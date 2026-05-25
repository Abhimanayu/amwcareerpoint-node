const crypto = require("node:crypto");
const Razorpay = require("razorpay");
const PredictorPayment = require("../models/PredictorPayment");
const PredictorAccess = require("../models/PredictorAccess");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const PREDICTOR_PRICE_INR = Number(process.env.PREDICTOR_PRICE_INR || 499);
const PREDICTOR_GST_PERCENT = Number(process.env.PREDICTOR_GST_PERCENT || 18);
const PREDICTOR_ACCESS_DAYS = Number(process.env.PREDICTOR_ACCESS_DAYS || 7);

function hasPaymentConfig() {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

function getRazorpayClient() {
  if (!hasPaymentConfig()) return null;
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

function computePlan() {
  const baseAmountPaise = Math.round(PREDICTOR_PRICE_INR * 100);
  const gstAmountPaise = Math.round(baseAmountPaise * (PREDICTOR_GST_PERCENT / 100));
  const amountPaise = baseAmountPaise + gstAmountPaise;

  return {
    currency: "INR",
    baseAmountPaise,
    gstAmountPaise,
    amountPaise,
    gstPercent: PREDICTOR_GST_PERCENT,
    accessDays: PREDICTOR_ACCESS_DAYS,
  };
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function verifySignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

exports.getPlan = async (req, res) => {
  return res.json({
    data: {
      ...computePlan(),
      keyId: RAZORPAY_KEY_ID || null,
      isPaymentConfigured: hasPaymentConfig(),
    },
  });
};

exports.createOrder = async (req, res, next) => {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({
        error: {
          code: "PAYMENT_NOT_CONFIGURED",
          message: "Payment gateway is not configured. Please contact support.",
        },
      });
    }

    const plan = computePlan();
    const receipt = `predictor_${req.predictorUser.id}_${Date.now()}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: plan.currency,
      receipt,
      notes: {
        product: "college_predictor",
        userId: req.predictorUser.id,
        accessDays: String(plan.accessDays),
      },
    });

    const payment = await PredictorPayment.create({
      userId: req.predictorUser.id,
      orderId: order.id,
      currency: plan.currency,
      baseAmountPaise: plan.baseAmountPaise,
      gstAmountPaise: plan.gstAmountPaise,
      amountPaise: plan.amountPaise,
      gstPercent: plan.gstPercent,
      accessDays: plan.accessDays,
      status: "created",
    });

    return res.status(201).json({
      data: {
        orderId: order.id,
        paymentRecordId: payment._id,
        keyId: RAZORPAY_KEY_ID,
        ...plan,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const orderId = String(req.body?.razorpay_order_id || req.body?.orderId || "").trim();
    const paymentId = String(req.body?.razorpay_payment_id || req.body?.paymentId || "").trim();
    const signature = String(req.body?.razorpay_signature || req.body?.signature || "").trim();

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "orderId, paymentId and signature are required",
        },
      });
    }

    const payment = await PredictorPayment.findOne({ orderId, userId: req.predictorUser.id });
    if (!payment) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Payment order not found" },
      });
    }

    if (payment.status === "paid" && payment.accessId) {
      const access = await PredictorAccess.findById(payment.accessId).lean();
      return res.json({
        data: {
          status: "paid",
          accessExpiresAt: access?.expiresAt || null,
          accessDays: payment.accessDays,
        },
      });
    }

    if (!hasPaymentConfig() || !verifySignature({ orderId, paymentId, signature })) {
      payment.status = "failed";
      payment.paymentId = paymentId;
      payment.signature = signature;
      payment.notes = "Signature verification failed";
      await payment.save();

      return res.status(400).json({
        error: { code: "PAYMENT_VERIFICATION_FAILED", message: "Payment verification failed" },
      });
    }

    await PredictorAccess.updateMany(
      { userId: req.predictorUser.id, isActive: true },
      { $set: { isActive: false, notes: "Auto-revoked after new paid access purchase" } }
    );

    const now = new Date();
    const access = await PredictorAccess.create({
      userId: req.predictorUser.id,
      accessType: "paid",
      grantedAt: now,
      expiresAt: addDays(now, payment.accessDays),
      isActive: true,
      notes: `Razorpay payment ${paymentId}`,
    });

    payment.status = "paid";
    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.accessId = access._id;
    await payment.save();

    return res.json({
      data: {
        status: "paid",
        accessExpiresAt: access.expiresAt,
        accessDays: payment.accessDays,
      },
    });
  } catch (err) {
    return next(err);
  }
};
