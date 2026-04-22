const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const { Blog, BlogCategory } = require("../models/Blog");
const Country = require("../models/Country");
const University = require("../models/University");
const Faq = require("../models/Faq");
const { Review, ReviewMeta } = require("../models/Review");
const Admin = require("../models/Admin");
const Counsellor = require("../models/Counsellor");
const Enquiry = require("../models/Enquiry");

async function clearAllData() {
  try {
    console.log("🗑️ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("🗑️ Clearing all existing data...");
    
    // Clear all collections
    await Promise.all([
      Blog.deleteMany({}),
      BlogCategory.deleteMany({}),
      Country.deleteMany({}),
      University.deleteMany({}),
      Faq.deleteMany({}),
      Review.deleteMany({}),
      ReviewMeta.deleteMany({}),
      Enquiry.deleteMany({})
      // Keep Admin and Counsellor for login access
    ]);
    
    console.log("✅ All data cleared successfully!");
    console.log("📊 Collections cleared:");
    console.log("   - Blogs: 0 documents");
    console.log("   - Blog Categories: 0 documents");
    console.log("   - Countries: 0 documents");
    console.log("   - Universities: 0 documents");
    console.log("   - FAQs: 0 documents");
    console.log("   - Reviews: 0 documents");
    console.log("   - Enquiries: 0 documents");
    
  } catch (error) {
    console.error("❌ Error clearing data:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run if called directly
if (require.main === module) {
  clearAllData();
}

module.exports = clearAllData;