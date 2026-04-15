const mongoose = require("mongoose");

const admissionStepSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
  },
  { _id: false }
);

// ── Support Experience sub-schemas ───────────────────────────────────────────
const progressItemSchema = new mongoose.Schema(
  {
    label:  { type: String, required: true, trim: true, maxlength: 120 },
    value:  { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, default: "Included", maxlength: 60 },
  },
  { _id: false }
);

const supportCardSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true, maxlength: 80 },
    subtitle: { type: String, default: "", trim: true, maxlength: 120 },
  },
  { _id: false }
);

const supportExperienceSchema = new mongoose.Schema(
  {
    eyebrow:      { type: String, default: "", trim: true, maxlength: 80 },
    title:        { type: String, default: "", trim: true, maxlength: 180 },
    description:  { type: String, default: "", trim: true, maxlength: 800 },
    progressItems: {
      type:     [progressItemSchema],
      default:  [],
      validate: {
        validator: (arr) => arr.length <= 6,
        message:  "progressItems can have at most 6 items",
      },
    },
    supportCards: {
      type:     [supportCardSchema],
      default:  [],
      validate: {
        validator: (arr) => arr.length <= 4,
        message:  "supportCards can have at most 4 items",
      },
    },
  },
  { _id: false }
);

// ── Student Life sub-schemas ───────────────────────────────────────────────
const studentLifeCardSchema = new mongoose.Schema(
  {
    icon:        { type: String, default: null },
    title:       { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { _id: false }
);

const studentLifeSchema = new mongoose.Schema(
  {
    eyebrow:     { type: String, default: "", trim: true, maxlength: 80 },
    title:       { type: String, default: "", trim: true, maxlength: 180 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    cards: {
      type:    [studentLifeCardSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 6,
        message:  "cards can have at most 6 items",
      },
    },
  },
  { _id: false }
);

// ── Documents Checklist sub-schemas ──────────────────────────────────────────
const documentsChecklistItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 140 },
  },
  { _id: false }
);

const documentsChecklistSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "", trim: true, maxlength: 80 },
    title:   { type: String, default: "", trim: true, maxlength: 180 },
    items: {
      type:    [documentsChecklistItemSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 12,
        message:  "items can have at most 12 elements",
      },
    },
  },
  { _id: false }
);

// features can be either strings OR objects {icon, title, description}
const featureSchema = new mongoose.Schema(
  {
    icon: { type: String, default: null },
    title: { type: String, required: true },
    description: { type: String, default: null },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: null, maxlength: 60 },
    metaDescription: { type: String, default: null, maxlength: 160 },
    keywords: { type: String, default: null },
  },
  { _id: false }
);

const countrySchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },

    // ── Optional basic info ──────────────────────────────────────
    countryCode: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    tagline: { type: String, default: null, maxlength: 200 },
    description: { type: String, default: null, maxlength: 5000 },

    // ── Images (support both naming conventions) ─────────────────
    flagImage: { type: String, default: null },   // frontend: flagImage
    heroImage: { type: String, default: null },   // frontend: heroImage
    bannerImage: { type: String, default: null }, // legacy support
    cardImage: { type: String, default: null },

    // ── Styling ───────────────────────────────────────────────────
    headerColor: { type: String, default: null },

    // ── Fee & Duration ────────────────────────────────────────────
    feeRange: { type: String, default: null },
    feeRangeUSD: { type: String, default: null },
    duration: { type: String, default: null },

    // ── Highlights — array of strings ────────────────────────────
    highlights: { type: [String], default: [] },

    // ── Features — array of objects {icon, title, description} ───
    features: { type: [featureSchema], default: [] },

    // ── Eligibility — array of strings ───────────────────────────
    eligibility: { type: [String], default: [] },

    // ── Admission Process ─────────────────────────────────────────
    admissionProcess: { type: [admissionStepSchema], default: [] },

    // ── Extra info ────────────────────────────────────────────────
    climate: { type: String, default: null },
    language: { type: String, default: null },
    currency: { type: String, default: null },
    livingCost: { type: String, default: null },
    visaInfo: { type: String, default: null },

    // ── SEO — nested object ───────────────────────────────────────
    seo: { type: seoSchema, default: () => ({}) },

    // ── Legacy flat SEO fields (still supported) ─────────────────
    metaTitle: { type: String, default: null, maxlength: 60 },
    metaDescription: { type: String, default: null, maxlength: 160 },

    // ── Support Experience ────────────────────────────────────────
    supportExperience: { type: supportExperienceSchema, default: () => ({}) },

    // ── Student Life ──────────────────────────────────────────────
    studentLife: { type: studentLifeSchema, default: () => ({}) },

    // ── Documents Checklist ───────────────────────────────────────
    documentsChecklist: { type: documentsChecklistSchema, default: () => ({}) },

    // ── Stats ─────────────────────────────────────────────────────
    universityCount: { type: Number, default: 0 },

    // ── Flags ─────────────────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

countrySchema.index({ status: 1, sortOrder: 1 });
countrySchema.index({ isFeatured: 1 });

module.exports = mongoose.model("Country", countrySchema);
