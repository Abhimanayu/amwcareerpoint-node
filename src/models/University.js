const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    value: { type: String, default: "" },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    answer:   { type: String, default: "" },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords:        { type: String, default: "" },
  },
  { _id: false }
);

const universitySchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    country:         { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    description:     { type: String, default: "" },
    logo:            { type: String, default: "" },
    heroImage:       { type: String, default: "" },
    gallery:         [{ type: String }],
    establishedYear: { type: String, default: "" },
    ranking:         { type: String, default: "" },
    accreditation:   { type: String, default: "" },
    courseDuration:  { type: String, default: "" },
    annualFees:      { type: String, default: "" },
    medium:          { type: String, default: "" },
    hostelFees:      { type: String, default: "" },
    eligibility:     { type: String, default: "" },
    recognition:     [{ type: String }],
    status:          { type: String, enum: ["active", "inactive"], default: "active" },
    featured:        { type: Boolean, default: false },
    highlights:      [highlightSchema],
    faqs:            [faqSchema],
    seo:             { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

universitySchema.index({ country: 1, status: 1 });
universitySchema.index({ featured: 1 });

module.exports = mongoose.model("University", universitySchema);
