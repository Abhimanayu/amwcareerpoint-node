const mongoose = require("mongoose");

const admissionStepSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
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
