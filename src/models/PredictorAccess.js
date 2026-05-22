const mongoose = require("mongoose");

const auditActorSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const predictorAccessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    accessType: { type: String, enum: ["trial", "paid", "manual"], default: "manual" },
    grantedAt: { type: Date, default: Date.now },
    grantedBy: { type: auditActorSchema, default: null },
    revokedBy: { type: auditActorSchema, default: null },
    expiresAt: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

predictorAccessSchema.index({ userId: 1, isActive: 1, expiresAt: -1 });

module.exports = mongoose.model("PredictorAccess", predictorAccessSchema);
