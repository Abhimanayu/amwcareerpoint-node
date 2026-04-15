require("dotenv").config();
const mongoose = require("mongoose");
const Country = require("../models/Country");
const University = require("../models/University");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

async function update() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  console.log("🖼️ Adding images to MAX TEST Countries...");
  
  const countryRes = await Country.updateMany(
    { name: { $regex: /^MAX TEST/ } },
    {
      $set: {
        flagImage: "https://via.placeholder.com/150x100.png?text=Max+Test+Flag",
        heroImage: "https://via.placeholder.com/1920x1080.png?text=Max+Test+Country+Hero",
        bannerImage: "https://via.placeholder.com/1920x600.png?text=Max+Test+Banner",
        cardImage: "https://via.placeholder.com/600x400.png?text=Max+Test+Country+Card"
      }
    }
  );
  console.log(`✅ Updated ${countryRes.modifiedCount} Countries with images.`);

  console.log("🖼️ Adding images to MAX TEST Universities...");
  
  const univRes = await University.updateMany(
    { name: { $regex: /^MAX TEST/ } },
    {
      $set: {
        logo: "https://via.placeholder.com/200x200.png?text=Univ+Logo",
        heroImage: "https://via.placeholder.com/1920x1080.png?text=Univ+Hero+Image",
        gallery: [
          "https://via.placeholder.com/800x600.png?text=Gallery+1",
          "https://via.placeholder.com/800x600.png?text=Gallery+2",
          "https://via.placeholder.com/800x600.png?text=Gallery+3",
          "https://via.placeholder.com/800x600.png?text=Gallery+4",
          "https://via.placeholder.com/800x800.png?text=Gallery+5+Square",
        ]
      }
    }
  );
  console.log(`✅ Updated ${univRes.modifiedCount} Universities with images.`);

  console.log("🎉 All Test Countries and Universities now have placeholder images!");
  await mongoose.disconnect();
}

update().catch((err) => {
  console.error("❌ Update failed:", err.message);
  process.exit(1);
});
