const clearAllData = require("./clearAllData");
const createEdgeCaseData = require("./createEdgeCaseData");

async function resetWithEdgeCases() {
  console.log("🚀 Starting complete database reset with edge case data...");
  console.log("====================================================");
  
  try {
    // Step 1: Clear all existing data
    await clearAllData();
    
    console.log("");
    console.log("⏳ Waiting 2 seconds before creating new data...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Create edge case test data
    await createEdgeCaseData();
    
    console.log("");
    console.log("🎉 DATABASE RESET COMPLETE!");
    console.log("====================================================");
    console.log("✅ Old data cleared");
    console.log("✅ Edge case test data created");
    console.log("✅ Ready for UI stress testing");
    console.log("");
    console.log("🧪 Test your UI with:");
    console.log("   - Maximum length content");
    console.log("   - Special characters & emojis");
    console.log("   - Empty/null values");
    console.log("   - Large arrays");
    console.log("   - Long URLs");
    console.log("   - HTML injection attempts");
    console.log("");
    console.log("🎯 Look for UI breaks in:");
    console.log("   - Country pages with max content");
    console.log("   - Blog posts with long titles");
    console.log("   - University galleries with many images");
    console.log("   - Forms with special characters");
    
  } catch (error) {
    console.error("❌ Error during database reset:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  resetWithEdgeCases();
}

module.exports = resetWithEdgeCases;