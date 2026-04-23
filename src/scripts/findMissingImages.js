/**
 * Scan all models for image fields referencing files that don't exist on disk.
 * Usage:  node src/scripts/findMissingImages.js
 */
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// ── bootstrap ────────────────────────────────────────────────────────────────
require("dotenv").config();
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

// ── models & their image fields ──────────────────────────────────────────────
const { Blog } = require("../models/Blog");
const University = require("../models/University");
const Country = require("../models/Country");

const checks = [
  {
    model: Blog,
    name: "Blog",
    imageFields: ["coverImage"],
    labelField: "title",
  },
  {
    model: University,
    name: "University",
    imageFields: ["logo", "heroImage", "gallery"],
    labelField: "name",
  },
  {
    model: Country,
    name: "Country",
    imageFields: ["flagImage", "heroImage", "bannerImage", "cardImage"],
    labelField: "name",
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
function extractRelPath(value) {
  if (!value || typeof value !== "string") return null;
  // strip leading URL parts like http://localhost:5000/uploads/...
  const idx = value.indexOf("/uploads/");
  if (idx !== -1) return value.slice(idx + 1); // "uploads/blogs/foo.png"
  // already a relative path?
  if (value.startsWith("uploads/")) return value;
  return null;
}

function fileExists(relPath) {
  const abs = path.join(__dirname, "..", "..", relPath);
  return fs.existsSync(abs);
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to", mongoose.connection.name);

  let totalMissing = 0;

  for (const { model, name, imageFields, labelField } of checks) {
    const docs = await model.find().lean();
    console.log(`\n── ${name} (${docs.length} docs) ──`);

    for (const doc of docs) {
      for (const field of imageFields) {
        const raw = doc[field];
        const values = Array.isArray(raw) ? raw : [raw];

        for (const val of values) {
          const rel = extractRelPath(val);
          if (!rel) continue; // empty / null / external URL
          if (!fileExists(rel)) {
            totalMissing++;
            console.log(
              `  ❌  ${doc[labelField] || doc._id}` +
                `  →  ${field}: ${val}`
            );
          }
        }
      }
    }
  }

  if (totalMissing === 0) {
    console.log("\n🎉 All referenced images exist on disk!");
  } else {
    console.log(`\n⚠️  ${totalMissing} missing image(s) found.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
