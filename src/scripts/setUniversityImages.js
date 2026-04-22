/**
 * Helper script to set proper image URLs for universities
 * This shows how to set uploaded image URLs correctly
 *
 * Usage examples:
 * - For uploaded files: http://localhost:5000/uploads/universities/university-name-logo.jpg
 * - For external CDNs: https://cdn.example.com/images/university.jpg
 *
 * Run: node src/scripts/setUniversityImages.js <university-slug> <logo-url> <hero-url> [gallery-urls...]
 */
require("dotenv").config();
const mongoose = require("mongoose");
const University = require("../models/University");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

async function setImages() {
  const [, , slug, logoUrl, heroUrl, ...galleryUrls] = process.argv;

  if (!slug) {
    console.log(
      "❌ Usage: node setUniversityImages.js <university-slug> [logo-url] [hero-url] [gallery-urls...]",
    );
    console.log("");
    console.log("Examples:");
    console.log("  node setUniversityImages.js delhi-university \\");
    console.log(
      "    'http://localhost:5000/uploads/universities/du-logo.jpg' \\",
    );
    console.log(
      "    'http://localhost:5000/uploads/universities/du-hero.jpg' \\",
    );
    console.log(
      "    'http://localhost:5000/uploads/universities/du-gallery-1.jpg' \\",
    );
    console.log(
      "    'http://localhost:5000/uploads/universities/du-gallery-2.jpg'",
    );
    console.log("");
    console.log("  For external URLs:");
    console.log("    node setUniversityImages.js kazan-federal-university \\");
    console.log("      'https://images.unsplash.com/photo-123?w=200' \\");
    console.log("      'https://images.unsplash.com/photo-456?w=1200'");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const university = await University.findOne({ slug }).lean();
  if (!university) {
    console.log(`❌ University not found: ${slug}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const updates = {};

  if (logoUrl) {
    updates.logo = logoUrl.trim();
    console.log(`📸 Setting logo: ${logoUrl}`);
  }

  if (heroUrl) {
    updates.heroImage = heroUrl.trim();
    console.log(`🖼️  Setting hero image: ${heroUrl}`);
  }

  if (galleryUrls.length > 0) {
    updates.gallery = galleryUrls.map((url) => url.trim()).filter((url) => url);
    console.log(`🏛️  Setting gallery (${galleryUrls.length} images):`);
    galleryUrls.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
  }

  if (Object.keys(updates).length === 0) {
    console.log("ℹ️  No image URLs provided, nothing to update");
    await mongoose.disconnect();
    return;
  }

  await University.findByIdAndUpdate(university._id, { $set: updates });
  console.log(`✅ Updated university: ${university.name}`);

  await mongoose.disconnect();
}

setImages().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
