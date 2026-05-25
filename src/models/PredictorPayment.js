const mongoose = require("mongoose");

const predictorPaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "PredictorUser", required: true, index: true },
    orderId: { type: String, required: true, unique: true, trim: true },
    paymentId: { type: String, default: null, trim: true, index: true },
    signature: { type: String, default: null, trim: true },
    currency: { type: String, default: "INR", trim: true },
    baseAmountPaise: { type: Number, required: true, min: 1 },
    gstAmountPaise: { type: Number, required: true, min: 0 },
    amountPaise: { type: Number, required: true, min: 1 },
    gstPercent: { type: Number, required: true, min: 0 },
    accessDays: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    accessId: { type: mongoose.Schema.Types.ObjectId, ref: "PredictorAccess", default: null },
    notes: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

predictorPaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PredictorPayment", predictorPaymentSchema);
