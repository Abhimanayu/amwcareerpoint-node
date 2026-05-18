const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "", maxlength: 70 },
    metaDescription: { type: String, default: "", maxlength: 160 },
    keywords: { type: String, default: "", maxlength: 250 },
    canonicalUrl: { type: String, default: "", maxlength: 300 },
    schemaMarkup: { type: String, default: "" },
  },
  { _id: false },
);

const heroSchema = new mongoose.Schema(
  {
    badge: { type: String, default: "", maxlength: 100 },
    heading: { type: String, default: "", maxlength: 140 },
    highlightedText: { type: String, default: "", maxlength: 80 },
    trailingText: { type: String, default: "", maxlength: 140 },
    description: { type: String, default: "", maxlength: 800 },
    primaryCtaText: { type: String, default: "", maxlength: 60 },
    primaryCtaHref: { type: String, default: "", maxlength: 240 },
    secondaryCtaText: { type: String, default: "", maxlength: 60 },
    secondaryCtaHref: { type: String, default: "", maxlength: 240 },
  },
  { _id: false },
);

const statSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, trim: true, maxlength: 24 },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    desc: { type: String, default: "", trim: true, maxlength: 140 },
  },
  { _id: false },
);

const sectionVisibilitySchema = new mongoose.Schema(
  {
    hero: { type: Boolean, default: true },
    stats: { type: Boolean, default: true },
    whyChoose: { type: Boolean, default: true },
    experts: { type: Boolean, default: true },
    universities: { type: Boolean, default: true },
    countries: { type: Boolean, default: true },
    comparison: { type: Boolean, default: true },
    process: { type: Boolean, default: true },
    predictor: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    videos: { type: Boolean, default: true },
    blogs: { type: Boolean, default: true },
    cta: { type: Boolean, default: true },
    faq: { type: Boolean, default: true },
  },
  { _id: false },
);

const homeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "home", unique: true, immutable: true },
    seo: { type: seoSchema, default: () => ({}) },
    hero: { type: heroSchema, default: () => ({}) },
    stats: {
      type: [statSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: "stats can have at most 4 items",
      },
    },
    sections: { type: sectionVisibilitySchema, default: () => ({}) },
    // ── Phase 2: curated homepage items ──────────────────────────
    homeCountries: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Country" }],
      default: [],
    },
    homeUniversities: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "University" }],
      default: [],
    },
    homeBlogs: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HomeSettings", homeSettingsSchema);
