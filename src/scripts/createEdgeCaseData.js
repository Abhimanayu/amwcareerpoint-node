const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const { Blog, BlogCategory } = require("../models/Blog");
const Country = require("../models/Country");
const University = require("../models/University");
const Faq = require("../models/Faq");
const { Review, ReviewMeta } = require("../models/Review");
const Enquiry = require("../models/Enquiry");

// Edge case test data generators
const generateLongText = (length) => "EDGE_TEST_STRESS_LOREM_IPSUM_DOLOR_SIT_AMET_CONSECTETUR_ADIPISCING_ELIT_SED_DO_EIUSMOD_TEMPOR_INCIDIDUNT_UT_LABORE_ET_DOLORE_MAGNA_ALIQUA_".repeat(Math.ceil(length / 130)).substring(0, length);

const generateSpecialChars = () => "🎓💼🌟✨🔥💯🚀🎯⭐🏆🎊🎉🌈💎🔮🎭🎨🎪🎢🎡🎠🎟️🎪 Special!@#$%^&*()_+-=[]{}|;':\",./<>? 中文 العربية Русский 한국어";

const specialCharNames = [
  "🎓 University of Special Characters & Symbols! @#$%",
  "Very-Long-University-Name-With-Hyphens-And-Numbers-123456789-That-Could-Break-UI-Layout",
  "XX", // Minimum 2 chars for validation
  "অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ বাংলা University", // Bengali
  "Universität für Sondërzeichen & Tëst-Dätën", // German umlauts
  "Universidad де Тест Специальных Символов", // Mixed scripts
  "🏫 Emoji University 🎉 With Many 🌟 Symbols 💯",
  "University with\nNewlines\tAnd\rTabs",
  "A".repeat(100), // Maximum length test
  "AB" // Minimum valid name
];

async function createEdgeCaseData() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("🧪 Creating edge case test data...");
    
    // 1. CREATE BLOG CATEGORIES
    console.log("📝 Creating blog categories...");
    const blogCategories = await BlogCategory.insertMany([
      { name: "Maximum Length Category Name That Could Break UI Layout Design" },
      { name: "Min" },
      { name: "🎓 Education & Special Chars!@#$%" },
      { name: generateSpecialChars().substring(0, 50) },
      { name: "Normal Category" }
    ]);

    // 2. CREATE COUNTRIES WITH EDGE CASES
    console.log("🌍 Creating countries with edge cases...");
    const countries = [];
    
    for (let i = 1; i <= 10; i++) {
      const isEvenIndex = i % 2 === 0;
      
      countries.push({
        slug: `edge-test-country-${i}-${Date.now()}`,
        name: i === 1 ? "XX" : i === 2 ? specialCharNames[i % specialCharNames.length] : `EDGE TEST Country Level ${i} ${generateLongText(60)}`,
        countryCode: isEvenIndex ? "xy" : null,
        tagline: i <= 2 ? generateLongText(200) : i === 3 ? "Short" : generateSpecialChars().substring(0, 150),
        description: i === 1 ? generateLongText(5000) : i === 2 ? "Min desc" : generateLongText(3000),
        
        // Image edge cases
        flagImage: i <= 5 ? `http://localhost:5000/uploads/countries/edge-test-flag-${i}.png` : "",
        heroImage: i <= 3 ? `http://localhost:5000/uploads/countries/edge-test-hero-${i}-${generateLongText(50)}.png` : "",
        bannerImage: isEvenIndex ? "https://via.placeholder.com/1920x600.png?text=Max+Test+Banner" : null,
        cardImage: isEvenIndex ? "https://via.placeholder.com/600x400.png?text=Max+Test+Country+Card" : null,
        
        headerColor: i <= 3 ? "#ff9933" : null,
        feeRange: i === 1 ? generateLongText(100) : i === 2 ? "₹0" : "₹2L-₹15L",
        feeRangeUSD: isEvenIndex ? `$${i * 1000}-$${i * 10000}` : null,
        duration: i === 1 ? generateLongText(200) : i === 2 ? "1Y" : `${i} Years Program`,
        
        // Highlights edge cases
        highlights: i === 1 ? Array(20).fill().map((_, idx) => generateLongText(100)) :
                   i === 2 ? ["Short", "Min"] :
                   i === 3 ? [] :
                   Array(10).fill().map((_, idx) => `${generateSpecialChars().substring(0, 100)}`),
        
        // Features edge cases  
        features: i === 1 ? Array(15).fill().map((_, idx) => ({
          icon: idx % 2 ? "🎓" : null,
          title: generateLongText(100),
          description: generateLongText(300)
        })) : i === 2 ? [] : Array(5).fill().map((_, idx) => ({
          icon: isEvenIndex ? null : "🌟",
          title: `${generateSpecialChars().substring(0, 50)}`,
          description: generateLongText(200)
        })),
        
        // Eligibility edge cases
        eligibility: i === 1 ? Array(15).fill().map((_, idx) => generateLongText(200)) :
                    i === 2 ? [] :
                    Array(5).fill().map((_, idx) => generateSpecialChars().substring(0, 100)),
        
        // Admission process edge cases
        admissionProcess: i === 1 ? Array(10).fill().map((_, idx) => ({
          step: idx + 1,
          title: generateLongText(100),
          description: generateLongText(500)
        })) : i === 2 ? [] : Array(3).fill().map((_, idx) => ({
          step: idx + 1,
          title: generateSpecialChars().substring(0, 80),
          description: generateLongText(400)
        })),
        
        climate: i <= 3 ? generateLongText(100) : null,
        language: i <= 2 ? generateSpecialChars() : null,
        currency: isEvenIndex ? generateLongText(50) : null,
        livingCost: generateLongText(100),
        visaInfo: i === 1 ? generateLongText(1000) : null,
        
        // SEO edge cases
        seo: {
          metaTitle: generateLongText(60),
          metaDescription: generateLongText(160),
          keywords: generateLongText(100)
        },
        
        // Support Experience with edge cases
        supportExperience: {
          eyebrow: generateSpecialChars().substring(0, 80),
          title: generateLongText(180),
          description: generateLongText(800),
          progressItems: Array(6).fill().map((_, idx) => ({
            label: generateLongText(120),
            value: Math.floor(Math.random() * 100),
            status: generateSpecialChars().substring(0, 60)
          })),
          supportCards: Array(4).fill().map((_, idx) => ({
            title: generateSpecialChars().substring(0, 80),
            subtitle: generateLongText(120)
          }))
        },
        
        // Student Life edge cases
        studentLife: {
          eyebrow: generateSpecialChars().substring(0, 80),
          title: generateLongText(180),
          description: generateLongText(1000),
          cards: Array(6).fill().map((_, idx) => ({
            icon: idx % 3 === 0 ? null : "🎓",
            title: generateLongText(100),
            description: generateLongText(300)
          }))
        },
        
        // Documents checklist edge cases
        documentsChecklist: {
          eyebrow: generateSpecialChars().substring(0, 80),
          title: generateLongText(180),
          items: Array(12).fill().map((_, idx) => ({
            label: generateLongText(140)
          }))
        },
        
        universityCount: i * 100,
        isFeatured: isEvenIndex,
        sortOrder: i === 1 ? -999 : i === 2 ? 999 : i,
        status: i === 10 ? "inactive" : "active"
      });
    }
    
    const insertedCountries = await Country.insertMany(countries);
    
    // 3. CREATE BLOGS WITH EDGE CASES
    console.log("📰 Creating blogs with edge cases...");
    const blogs = [];
    
    for (let i = 1; i <= 10; i++) {
      blogs.push({
        title: i === 1 ? generateLongText(200) : 
               i === 2 ? "X" : 
               `EDGE TEST Blog ${i} ${generateSpecialChars()}`,
        slug: `edge-test-blog-${i}-${Date.now()}`,
        content: i === 1 ? generateLongText(50000) : 
                i === 2 ? "Min" : 
                `<h1>${generateSpecialChars()}</h1><p>${generateLongText(10000)}</p><img src="break-test.jpg" alt="test">`,
        excerpt: i <= 3 ? generateLongText(500) : generateSpecialChars(),
        coverImage: i <= 5 ? `http://localhost:5000/uploads/blogs/edge-test-cover-${i}.jpg` : "",
        category: blogCategories[i % blogCategories.length]._id,
        author: i === 1 ? generateLongText(100) : i === 2 ? "X" : generateSpecialChars().substring(0, 50),
        tags: i === 1 ? Array(20).fill().map((_, idx) => generateLongText(30)) :
              i === 2 ? [] :
              Array(10).fill().map((_, idx) => generateSpecialChars().substring(0, 20)),
        status: i === 10 ? "draft" : "published",
        featured: i % 2 === 0,
        seo: {
          metaTitle: generateLongText(60),
          metaDescription: generateLongText(160),
          keywords: generateLongText(100)
        }
      });
    }
    
    await Blog.insertMany(blogs);
    
    // 4. CREATE UNIVERSITIES WITH EDGE CASES
    console.log("🏫 Creating universities with edge cases...");
    const universities = [];
    
    for (let i = 1; i <= 10; i++) {
      universities.push({
        name: specialCharNames[i % specialCharNames.length] || `Edge University ${i}`,
        slug: `edge-test-university-${i}-${Date.now()}`,
        country: insertedCountries[i % insertedCountries.length]._id,
        description: i === 1 ? generateLongText(5000) : generateLongText(1000),
        logo: i <= 5 ? `http://localhost:5000/uploads/universities/edge-logo-${i}.png` : "",
        heroImage: i <= 3 ? `http://localhost:5000/uploads/universities/edge-hero-${i}.jpg` : "",
        gallery: i === 1 ? Array(20).fill().map((_, idx) => `http://localhost:5000/uploads/universities/gallery-${i}-${idx}.jpg`) :
                 i === 2 ? [] :
                 Array(5).fill().map((_, idx) => `http://localhost:5000/uploads/universities/gallery-${i}-${idx}.jpg`),
        establishedYear: i === 1 ? "999999" : i === 2 ? "0" : `${1900 + i}`,
        ranking: generateLongText(100),
        accreditation: generateSpecialChars(),
        courseDuration: i === 1 ? generateLongText(100) : `${i} Years`,
        annualFees: generateLongText(50),
        medium: generateSpecialChars().substring(0, 30),
        hostelFees: generateLongText(50),
        eligibility: generateLongText(500),
        recognition: Array(10).fill().map((_, idx) => generateLongText(100)),
        status: i === 10 ? "inactive" : "active",
        featured: i % 2 === 0,
        highlights: Array(15).fill().map(() => ({
          label: generateLongText(50),
          value: generateLongText(100)
        })),
        faqs: Array(20).fill().map((_, idx) => ({
          question: generateLongText(200),
          answer: generateLongText(1000)
        })),
        seo: {
          metaTitle: generateLongText(60),
          metaDescription: generateLongText(160),
          keywords: generateLongText(100)
        }
      });
    }
    
    await University.insertMany(universities);
    
    // 5. CREATE FAQS WITH EDGE CASES
    console.log("❓ Creating FAQs with edge cases...");
    const faqs = [];
    
    for (let i = 1; i <= 10; i++) {
      faqs.push({
        question: i === 1 ? generateLongText(500) : 
                 i === 2 ? "?" : 
                 `${generateSpecialChars()} Question ${i}?`,
        answer: i === 1 ? generateLongText(5000) :
               i === 2 ? "." :
               generateLongText(2000),
        category: i % 2 === 0 ? "general" : "admission",
        sortOrder: i,
        status: i === 10 ? "inactive" : "active"
      });
    }
    
    await Faq.insertMany(faqs);
    
    // 6. CREATE REVIEWS WITH EDGE CASES
    console.log("⭐ Creating reviews with edge cases...");
    const reviews = [];
    
    for (let i = 1; i <= 10; i++) {
      reviews.push({
        studentName: i === 1 ? generateLongText(100) : i === 2 ? "XX" : generateSpecialChars().substring(0, 50),
        university: generateSpecialChars().substring(0, 100),
        country: i <= 5 ? insertedCountries[i % insertedCountries.length].name : "",
        avatar: i <= 5 ? `http://localhost:5000/uploads/reviews/avatar-${i}.jpg` : "",
        rating: i % 5 + 1,
        reviewText: i === 1 ? generateLongText(2000) : generateLongText(500),
        videoUrl: i <= 3 ? `https://youtube.com/watch?v=${generateLongText(20)}` : "",
        status: i === 10 ? "pending" : "approved",
        featured: i % 2 === 0
      });
    }
    
    await Review.insertMany(reviews);
    
    // 7. CREATE ENQUIRIES WITH EDGE CASES  
    console.log("📧 Creating enquiries with edge cases...");
    const enquiries = [];
    
    for (let i = 1; i <= 10; i++) {
      enquiries.push({
        name: i === 1 ? generateLongText(100) : i === 2 ? "XX" : generateSpecialChars().substring(0, 50),
        email: i === 1 ? `${generateLongText(30).replace(/[^a-zA-Z0-9]/g, 'x')}@test.com` : `test${i}@example.com`,
        phone: i === 1 ? generateLongText(20) : `+91-${i}000000000`,
        interestedCountry: i <= 5 ? insertedCountries[i % insertedCountries.length].name : "",
        source: i % 2 === 0 ? "website" : generateSpecialChars().substring(0, 30),
        message: i === 1 ? generateLongText(1000) : generateLongText(300),
        status: i === 1 ? "new" : i === 2 ? "contacted" : i === 3 ? "converted" : "closed",
        notes: generateLongText(200)
      });
    }
    
    await Enquiry.insertMany(enquiries);
    
    console.log("✅ Edge case test data created successfully!");
    console.log("📊 Created records:");
    console.log(`   - Blog Categories: ${blogCategories.length}`);
    console.log(`   - Countries: ${countries.length} (with max edge cases)`);
    console.log(`   - Blogs: ${blogs.length} (with content edge cases)`);
    console.log(`   - Universities: ${universities.length} (with gallery edge cases)`);
    console.log(`   - FAQs: ${faqs.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Enquiries: ${enquiries.length}`);
    console.log("");
    console.log("🧪 Edge cases included:");
    console.log("   ✅ Maximum length content fields");
    console.log("   ✅ Minimum length fields");
    console.log("   ✅ Special characters & emojis");
    console.log("   ✅ Maximum array lengths");
    console.log("   ✅ Empty arrays");
    console.log("   ✅ Null/undefined values");
    console.log("   ✅ Very long URLs");
    console.log("   ✅ HTML content injection");
    console.log("   ✅ Multi-language characters");
    console.log("   ✅ Extreme numbers");
    console.log("");
    console.log("🎯 UI stress test ready!");
    
  } catch (error) {
    console.error("❌ Error creating edge case data:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run if called directly
if (require.main === module) {
  createEdgeCaseData();
}

module.exports = createEdgeCaseData;