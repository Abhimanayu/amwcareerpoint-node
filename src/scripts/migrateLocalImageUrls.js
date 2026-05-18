/**
 * One-time migration: clear DB image fields that still contain local
 * `/uploads/...` paths from seed scripts.  These files never exist on
 * the production server (Cloudinary is used for all uploads).
 *
 * Clears the field to "" so the frontend shows its placeholder image
 * instead of a 404.  Re-upload images via the admin panel afterward.
 *
 * Run on production:
 *   node src/scripts/migrateLocalImageUrls.js
 *
 * Dry-run (see what would change without writing):
 *   DRY_RUN=1 node src/scripts/migrateLocalImageUrls.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const Country    = require("../models/Country");
const University = require("../models/University");
const Blog       = require("../models/Blog");

const DRY_RUN = process.env.DRY_RUN === "1";
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Add it to your .env or Hostinger env panel.");
  process.exit(1);
}

/** Returns true if the value is a local-path image (not a Cloudinary / http URL) */
function isLocalPath(v) {
  if (!v || typeof v !== "string") return false;
  const s = v.trim();
  // Matches: "uploads/...", "/uploads/...", relative paths that don't start with http
  return (s.startsWith("uploads/") || s.startsWith("/uploads/")) && !s.startsWith("http");
}

async function migrateCollection({ Model, name, imageFields }) {
  const docs = await Model.find({}).lean();
  let fixed = 0;

  for (const doc of docs) {
    const patch = {};
    for (const field of imageFields) {
      const val = doc[field];
      if (Array.isArray(val)) {
        // arrays of image strings (e.g. gallery)
        const cleaned = val.map((v) => (isLocalPath(v) ? "" : v));
        if (cleaned.some((v, i) => v !== val[i])) {
          patch[field] = cleaned;
        }
      } else if (isLocalPath(val)) {
        patch[field] = "";
      }
    }

    if (Object.keys(patch).length > 0) {
      fixed++;
      console.log(`  [${name}] id=${doc._id} slug=${doc.slug || doc.title || ""}`);
      for (const [k, v] of Object.entries(patch)) {
        console.log(`    ${k}: "${doc[k]}" → "${v}"`);
      }
      if (!DRY_RUN) {
        await Model.updateOne({ _id: doc._id }, { $set: patch });
      }
    }
  }

  console.log(`✅ ${name}: ${fixed} document(s) ${DRY_RUN ? "would be" : ""} updated out of ${docs.length}`);
  return fixed;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
  if (DRY_RUN) console.log("⚠️  DRY RUN — no changes will be written\n");

  let total = 0;

  total += await migrateCollection({
    Model: Country,
    name: "Country",
    imageFields: ["flagImage", "heroImage", "bannerImage", "cardImage"],
  });

  total += await migrateCollection({
    Model: University,
    name: "University",
    imageFields: ["logo", "heroImage", "bannerImage", "cardImage"],
  });

  total += await migrateCollection({
    Model: Blog,
    name: "Blog",
    imageFields: ["coverImage", "thumbnailImage"],
  });

  console.log(`\n🎉 Migration complete. Total documents updated: ${total}`);
  if (total > 0) {
    console.log("   ⬆️  Re-upload images via Admin → Countries / Universities / Blogs.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
