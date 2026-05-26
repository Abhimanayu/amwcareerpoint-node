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

const curriculumSchema = new mongoose.Schema(
  {
    year: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    subjects: { type: String, default: "", trim: true },
    desc: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords:        { type: String, default: "" },
    canonicalUrl:    { type: String, default: "" },
    schemaMarkup:    { type: String, default: "" },
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
    gallery: {
      type: [{ type: String, trim: true }],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 4,
        message: "gallery can have at most 4 images",
      },
    },
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
    sortOrder:       { type: Number, default: 0 },
    highlights:      [highlightSchema],
    faqs:            [faqSchema],
    curriculum:      [curriculumSchema],
    seo:             { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

universitySchema.index({ country: 1, status: 1 });
universitySchema.index({ featured: 1 });
universitySchema.index({ status: 1, sortOrder: 1, createdAt: -1, _id: -1 });
universitySchema.index({ country: 1, status: 1, sortOrder: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model("University", universitySchema);
