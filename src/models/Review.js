const mongoose = require("mongoose");

const reviewMetaSchema = new mongoose.Schema(
  {
    key:           { type: String, default: "global", unique: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:  { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    university:  { type: String, default: "" },
    country:     { type: String, default: "" },
    avatar:      { type: String, default: "" },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    reviewText:  { type: String, required: true },
    videoUrl:    { type: String, default: "" },
    status:      { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
    featured:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1 });

const Review     = mongoose.model("Review", reviewSchema);
const ReviewMeta = mongoose.model("ReviewMeta", reviewMetaSchema);

module.exports = { Review, ReviewMeta };
