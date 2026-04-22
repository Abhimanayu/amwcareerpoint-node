/**
 * Fix placeholder URLs script - removes placeholder URLs and fixes newlines
 * Run: node src/scripts/fixPlaceholderUrls.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const University = require("../models/University");
const Country = require("../models/Country");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

async function fixPlaceholders() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  console.log("🔍 Finding universities with placeholder URLs...");

  // Find all universities with placeholder URLs
  const universities = await University.find({
    $or: [
      { logo: { $regex: "via.placeholder.com" } },
      { heroImage: { $regex: "via.placeholder.com" } },
      { gallery: { $elemMatch: { $regex: "via.placeholder.com" } } },
    ],
  });

  console.log(
    `📦 Found ${universities.length} universities with placeholder URLs.`,
  );

  let updatedCount = 0;

  for (const uni of universities) {
    const updates = {};
    let hasChanges = false;

    // Handle logo
    if (uni.logo && uni.logo.includes("via.placeholder.com")) {
      updates.logo = "";
      hasChanges = true;
      console.log(`  [${uni.name}] Clearing placeholder logo`);
    } else if (uni.logo && typeof uni.logo === "string") {
      const trimmed = uni.logo.trim();
      if (trimmed !== uni.logo) {
        updates.logo = trimmed;
        hasChanges = true;
        console.log(`  [${uni.name}] Trimming logo URL`);
      }
    }

    // Handle heroImage
    if (uni.heroImage && uni.heroImage.includes("via.placeholder.com")) {
      updates.heroImage = "";
      hasChanges = true;
      console.log(`  [${uni.name}] Clearing placeholder heroImage`);
    } else if (uni.heroImage && typeof uni.heroImage === "string") {
      const trimmed = uni.heroImage.trim();
      if (trimmed !== uni.heroImage) {
        updates.heroImage = trimmed;
        hasChanges = true;
        console.log(`  [${uni.name}] Trimming heroImage URL`);
      }
    }

    // Handle gallery
    if (Array.isArray(uni.gallery) && uni.gallery.length > 0) {
      // Remove placeholder URLs and trim all URLs
      const cleanedGallery = uni.gallery
        .filter((url) => url && !url.includes("via.placeholder.com"))
        .map((url) => (typeof url === "string" ? url.trim() : url))
        .filter((url) => url); // Remove empty strings

      if (
        cleanedGallery.length !== uni.gallery.length ||
        cleanedGallery.some((url, i) => url !== uni.gallery[i])
      ) {
        updates.gallery = cleanedGallery;
        hasChanges = true;
        console.log(
          `  [${uni.name}] Gallery: removed ${uni.gallery.length - cleanedGallery.length} placeholder/invalid URLs, trimmed remaining`,
        );
      }
    }

    // Apply updates if any
    if (hasChanges) {
      await University.findByIdAndUpdate(uni._id, { $set: updates });
      updatedCount++;
    }
  }

  console.log(
    "🔍 Checking for other universities with newlines in image URLs...",
  );

  // Fix any remaining newline issues in non-placeholder URLs
  const allUniversities = await University.find({
    $or: [
      { logo: { $regex: /[\r\n]/ } },
      { heroImage: { $regex: /[\r\n]/ } },
      { gallery: { $elemMatch: { $regex: /[\r\n]/ } } },
    ],
  });

  for (const uni of allUniversities) {
    const updates = {};
    let hasChanges = false;

    // Trim logo
    if (uni.logo && typeof uni.logo === "string") {
      const trimmed = uni.logo.trim();
      if (trimmed !== uni.logo) {
        updates.logo = trimmed;
        hasChanges = true;
        console.log(`  [${uni.name}] Trimming logo URL newlines`);
      }
    }

    // Trim heroImage
    if (uni.heroImage && typeof uni.heroImage === "string") {
      const trimmed = uni.heroImage.trim();
      if (trimmed !== uni.heroImage) {
        updates.heroImage = trimmed;
        hasChanges = true;
        console.log(`  [${uni.name}] Trimming heroImage URL newlines`);
      }
    }

    // Trim gallery URLs
    if (Array.isArray(uni.gallery) && uni.gallery.length > 0) {
      const trimmedGallery = uni.gallery
        .map((url) => (typeof url === "string" ? url.trim() : url))
        .filter((url) => url); // Remove empty strings

      if (
        trimmedGallery.some((url, i) => url !== uni.gallery[i]) ||
        trimmedGallery.length !== uni.gallery.length
      ) {
        updates.gallery = trimmedGallery;
        hasChanges = true;
        console.log(`  [${uni.name}] Trimming gallery URLs newlines`);
      }
    }

    if (hasChanges) {
      await University.findByIdAndUpdate(uni._id, { $set: updates });
      updatedCount++;
    }
  }

  console.log("🔍 Checking countries for newlines in image URLs...");

  // Also fix countries with newline issues
  const countries = await Country.find({
    $or: [
      { flagImage: { $regex: /[\r\n]/ } },
      { heroImage: { $regex: /[\r\n]/ } },
    ],
  });

  for (const country of countries) {
    const updates = {};
    let hasChanges = false;

    if (country.flagImage && typeof country.flagImage === "string") {
      const trimmed = country.flagImage.trim();
      if (trimmed !== country.flagImage) {
        updates.flagImage = trimmed;
        hasChanges = true;
        console.log(`  [${country.name}] Trimming flagImage URL newlines`);
      }
    }

    if (country.heroImage && typeof country.heroImage === "string") {
      const trimmed = country.heroImage.trim();
      if (trimmed !== country.heroImage) {
        updates.heroImage = trimmed;
        hasChanges = true;
        console.log(`  [${country.name}] Trimming heroImage URL newlines`);
      }
    }

    if (hasChanges) {
      await Country.findByIdAndUpdate(country._id, { $set: updates });
    }
  }

  console.log(`✅ Process completed!`);
  console.log(`   - Updated ${updatedCount} universities`);
  console.log(`   - Removed placeholder URLs`);
  console.log(`   - Trimmed newline characters from all image URLs`);
  console.log(
    `   - Now all image URLs should be proper uploaded file URLs or empty strings`,
  );

  await mongoose.disconnect();
}

fixPlaceholders().catch((err) => {
  console.error("❌ Fix failed:", err.message);
  process.exit(1);
});
