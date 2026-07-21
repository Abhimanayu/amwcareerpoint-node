const mongoose = require("mongoose");

const predictorCutoffSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, trim: true, index: true },
    stateNormalized: { type: String, default: "", trim: true, index: true },
    college: { type: String, required: true, trim: true, index: true },
    collegeNormalized: { type: String, default: "", trim: true, index: true },
    rawCategory: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    subCategory: { type: String, default: null, trim: true },
    closingRank: { type: Number, required: true, min: 1, index: true },
    quota: { type: String, required: true, trim: true, index: true },
    rawQuota: { type: String, default: "", trim: true },
    quotaGroup: {
      type: String,
      enum: ["GOVT_STATE", "MANAGEMENT", "NRI", "MINORITY", "PRIVATE", "OTHER"],
      default: "OTHER",
      index: true,
    },
    sourceYear: { type: Number, default: null, index: true },
    sourceFile: { type: String, default: "", trim: true },
    importBatchId: { type: String, default: "", trim: true, index: true },
  },
  { timestamps: true }
);

predictorCutoffSchema.index(
  { state: 1, college: 1, rawCategory: 1, quota: 1, closingRank: 1 },
  { unique: true }
);
predictorCutoffSchema.index({ state: 1, quotaGroup: 1, category: 1, subCategory: 1, closingRank: 1 });
predictorCutoffSchema.index({ state: 1, quota: 1, category: 1, subCategory: 1, closingRank: 1 });
predictorCutoffSchema.index({ college: 1, state: 1, closingRank: 1 });

module.exports = mongoose.model("PredictorCutoff", predictorCutoffSchema);
