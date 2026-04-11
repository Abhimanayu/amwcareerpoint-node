/**
 * Seed script — creates the initial admin user
 * Run: node src/scripts/seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const email = process.env.ADMIN_EMAIL || "admin@amwcareerpoint.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";
  const name = process.env.ADMIN_NAME || "AMW Admin";

  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log(`ℹ️  Admin already exists: ${email}`);
  } else {
    await Admin.create({ name, email, password, role: "superadmin" });
    console.log(`✅ Admin created: ${email} / ${password}`);
  }

  await mongoose.disconnect();
  console.log("✅ Done. MongoDB disconnected.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
