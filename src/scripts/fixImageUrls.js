/**
 * One-time migration: strip trailing whitespace/newlines from all image URL
 * fields in Countries and Universities that were saved before the trim fix.
 *
 * Run once: node src/scripts/fixImageUrls.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Country    = require("../models/Country");
const University = require("../models/University");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

const trimStr = (v) => (typeof v === "string" ? v.trim() : v);

async function fixImageUrls() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // ── Countries ───────────────────────────────────────────────────────────────
  console.log("🔧 Fixing Country image URLs...");
  const COUNTRY_IMG_FIELDS = ["flagImage", "heroImage", "bannerImage", "cardImage"];
  const countries = await Country.find({}).lean();

  let countryFixed = 0;
  for (const doc of countries) {
    const patch = {};
    for (const field of COUNTRY_IMG_FIELDS) {
      if (doc[field] && doc[field] !== doc[field].trim()) {
        patch[field] = doc[field].trim();
        console.log(`  [Country][${doc.name}] ${field}: stripped newline`);
      }
    }
    if (Object.keys(patch).length) {
      await Country.updateOne({ _id: doc._id }, { $set: patch });
      countryFixed++;
    }
  }
  console.log(`✅ Countries fixed: ${countryFixed} / ${countries.length}\n`);

  // ── Universities ─────────────────────────────────────────────────────────────
  console.log("🔧 Fixing University image URLs...");
  const UNIV_IMG_FIELDS = ["logo", "heroImage", "bannerImage", "cardImage"];
  const universities = await University.find({}).lean();

  let univFixed = 0;
  for (const doc of universities) {
    const patch = {};

    for (const field of UNIV_IMG_FIELDS) {
      if (doc[field] && doc[field] !== doc[field].trim()) {
        patch[field] = doc[field].trim();
        console.log(`  [University][${doc.name}] ${field}: stripped newline`);
      }
    }

    // gallery array — trim every URL
    if (Array.isArray(doc.gallery)) {
      const cleaned = doc.gallery
        .map(trimStr)
        .filter(Boolean);
      // Check if anything actually changed
      const changed = cleaned.some((v, i) => v !== doc.gallery[i]) || cleaned.length !== doc.gallery.length;
      if (changed) {
        patch.gallery = cleaned;
        console.log(`  [University][${doc.name}] gallery: trimmed ${doc.gallery.length} entries`);
      }
    }

    if (Object.keys(patch).length) {
      await University.updateOne({ _id: doc._id }, { $set: patch });
      univFixed++;
    }
  }
  console.log(`✅ Universities fixed: ${univFixed} / ${universities.length}\n`);

  console.log("🎉 Done — all image URL fields are now clean.");
  await mongoose.disconnect();
}

fixImageUrls().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
