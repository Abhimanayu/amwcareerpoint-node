const mongoose = require("mongoose");

/**
 * Page-level FAQ model.
 * University-specific FAQs remain embedded in the University model.
 *
 * page      : which page this FAQ belongs to
 * pageSlug  : optional — used when page='country' or page='university'
 *             to scope FAQs to a specific country/university slug
 *             e.g. page='country', pageSlug='russia'
 */
const FaqSchema = new mongoose.Schema(
  {
    question:  { type: String, required: true, trim: true },
    answer:    { type: String, required: true, trim: true },
    page:      {
      type:     String,
      required: true,
      enum:     ["home", "country", "university", "contact", "general"],
      default:  "general",
    },
    pageSlug:  { type: String, default: "", trim: true, lowercase: true },
    sortOrder: { type: Number, default: 0 },
    status:    { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Index for fast page+slug lookups (most common query pattern)
FaqSchema.index({ page: 1, pageSlug: 1, status: 1, sortOrder: 1 });

module.exports = mongoose.model("Faq", FaqSchema);
