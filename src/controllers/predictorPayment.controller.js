const PredictorPayment = require("../models/PredictorPayment");
const PredictorAccess = require("../models/PredictorAccess");
const { Types } = require("mongoose");

const PREDICTOR_PRICE_INR = Number(process.env.PREDICTOR_PRICE_INR || 499);
const PREDICTOR_GST_PERCENT = Number(process.env.PREDICTOR_GST_PERCENT || 18);
const PREDICTOR_ACCESS_DAYS = Number(process.env.PREDICTOR_ACCESS_DAYS || 7);
const PREDICTOR_MANUAL_PAYMENT_ENABLED = process.env.PREDICTOR_MANUAL_PAYMENT_ENABLED !== "false";
const PREDICTOR_MANUAL_PAYMENT_LABEL = process.env.PREDICTOR_MANUAL_PAYMENT_LABEL || "Manual UPI / bank transfer";
const PREDICTOR_MANUAL_PAYMENT_UPI_ID = process.env.PREDICTOR_MANUAL_PAYMENT_UPI_ID || "";
const PREDICTOR_MANUAL_PAYMENT_QR_URL = process.env.PREDICTOR_MANUAL_PAYMENT_QR_URL || "";
const PREDICTOR_MANUAL_PAYMENT_INSTRUCTIONS =
  process.env.PREDICTOR_MANUAL_PAYMENT_INSTRUCTIONS ||
  "Pay manually, then submit your transaction ID. Admin will verify and activate 7-day access.";

function hasPaymentConfig() {
  return false;
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

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isAdminUser(admin) {
  return admin && ["admin", "superadmin"].includes(admin.role);
}

function getAdminActor(admin) {
  const adminId = cleanString(admin?.id);
  const email = cleanString(admin?.email).toLowerCase();
  if (!Types.ObjectId.isValid(adminId) || !email) return null;
  return { adminId, email, at: new Date() };
}

async function grantPaidAccess({ userId, accessDays, note, admin }) {
  const update = { isActive: false, notes: "Auto-revoked after new paid access purchase" };
  const actor = admin ? getAdminActor(admin) : null;
  if (actor) update.revokedBy = actor;

  await PredictorAccess.updateMany(
    { userId, isActive: true },
    { $set: update }
  );

  const now = new Date();
  return PredictorAccess.create({
    userId,
    accessType: "paid",
    grantedAt: now,
    grantedBy: actor || undefined,
    expiresAt: addDays(now, accessDays),
    isActive: true,
    notes: note,
  });
}

exports.getPlan = async (req, res) => {
  return res.json({
    data: {
      ...computePlan(),
      keyId: null,
      isPaymentConfigured: hasPaymentConfig(),
      manualPayment: {
        enabled: PREDICTOR_MANUAL_PAYMENT_ENABLED,
        label: PREDICTOR_MANUAL_PAYMENT_LABEL,
        upiId: PREDICTOR_MANUAL_PAYMENT_UPI_ID || null,
        qrUrl: PREDICTOR_MANUAL_PAYMENT_QR_URL || null,
        instructions: PREDICTOR_MANUAL_PAYMENT_INSTRUCTIONS,
      },
    },
  });
};

exports.createOrder = async (req, res, next) => {
  try {
    return res.status(503).json({
      error: {
        code: "PAYMENT_NOT_CONFIGURED",
        message: "Online payment is not configured yet. Please use manual payment verification.",
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.createManualRequest = async (req, res, next) => {
  try {
    if (!PREDICTOR_MANUAL_PAYMENT_ENABLED) {
      return res.status(503).json({
        error: {
          code: "MANUAL_PAYMENT_DISABLED",
          message: "Manual payment is not enabled. Please contact support.",
        },
      });
    }

    const transactionId = cleanString(req.body?.transactionId);
    const payerNote = cleanString(req.body?.note);

    if (!transactionId || transactionId.length < 4 || transactionId.length > 100) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "A valid transaction ID is required",
        },
      });
    }

    const plan = computePlan();
    const orderId = `manual_${req.predictorUser.id}_${Date.now()}`.slice(0, 80);

    const payment = await PredictorPayment.create({
      userId: req.predictorUser.id,
      orderId,
      method: "manual",
      transactionId,
      payerNote,
      currency: plan.currency,
      baseAmountPaise: plan.baseAmountPaise,
      gstAmountPaise: plan.gstAmountPaise,
      amountPaise: plan.amountPaise,
      gstPercent: plan.gstPercent,
      accessDays: plan.accessDays,
      status: "pending",
      notes: "Waiting for admin manual payment verification",
    });

    return res.status(201).json({
      data: {
        paymentRecordId: payment._id,
        orderId: payment.orderId,
        status: payment.status,
        transactionId: payment.transactionId,
        ...plan,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        error: {
          code: "DUPLICATE_PAYMENT",
          message: "This transaction is already submitted.",
        },
      });
    }
    return next(err);
  }
};

exports.listManualRequests = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can view manual payment requests" },
      });
    }

    const status = ["pending", "paid", "rejected"].includes(req.query.status)
      ? req.query.status
      : "pending";

    const items = await PredictorPayment.find({ method: "manual", status })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ data: { items } });
  } catch (err) {
    return next(err);
  }
};

exports.approveManualRequest = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can approve manual payments" },
      });
    }

    const paymentId = cleanString(req.params.paymentId);
    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Valid paymentId is required" },
      });
    }

    const payment = await PredictorPayment.findOne({ _id: paymentId, method: "manual" });
    if (!payment) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Manual payment request not found" },
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

    const access = await grantPaidAccess({
      userId: payment.userId,
      accessDays: payment.accessDays,
      note: `Manual payment approved: ${payment.transactionId || payment.orderId}`,
      admin: req.admin,
    });

    payment.status = "paid";
    payment.accessId = access._id;
    payment.notes = cleanString(req.body?.notes) || "Manual payment approved by admin";
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

exports.rejectManualRequest = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can reject manual payments" },
      });
    }

    const paymentId = cleanString(req.params.paymentId);
    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Valid paymentId is required" },
      });
    }

    const payment = await PredictorPayment.findOne({ _id: paymentId, method: "manual" });
    if (!payment) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Manual payment request not found" },
      });
    }

    payment.status = "rejected";
    payment.notes = cleanString(req.body?.notes) || "Manual payment rejected by admin";
    await payment.save();

    return res.json({
      data: {
        status: payment.status,
        paymentRecordId: payment._id,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    return res.status(503).json({
      error: {
        code: "PAYMENT_NOT_CONFIGURED",
        message: "Online payment verification is not configured yet. Please use manual payment verification.",
      },
    });
  } catch (err) {
    return next(err);
  }
};
