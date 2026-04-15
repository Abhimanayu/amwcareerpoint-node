require("dotenv").config();
const mongoose = require("mongoose");
const Country = require("../models/Country");
const University = require("../models/University");
const Faq = require("../models/Faq");
const slugify = require("slugify");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

// Helper to generate a text of exactly 'length' characters.
// We use words and occasional unspaced long strings to test word wrapping.
const generatePaddedText = (length) => {
  if (length <= 0) return "";
  let text = "StressTest ";
  const charBlock = "UIBreakTest";
  while (text.length < length) {
    // Inject a really long unbroken word every 100 chars to test word boundaries
    if (text.length % 150 === 0) {
      text += "Supercalifragilisticexpialidocious_UnbreakableWordTest_" + charBlock;
    } else {
      text += "Lorem ipsum dolor sit amet consectetur adipiscing elit. ";
    }
  }
  return text.substring(0, length).trim();
};

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  console.log("🛠️ Seeding 10 MAXIMUM LENGTH Countries...");
  
  const createdCountries = [];

  for (let i = 1; i <= 10; i++) {
    const rawName = `MAX TEST Country Level ${i} ${generatePaddedText(50)}`; // Name Max is 100
    const name = rawName.substring(0, 99);
    const slug = slugify(`max-test-country-${i}-${Date.now()}`, { lower: true });
    
    const country = await Country.create({
      name: name,
      slug: slug,
      tagline: generatePaddedText(200), // Max 200
      description: generatePaddedText(5000), // Max 5000
      highlights: [generatePaddedText(100), generatePaddedText(100), generatePaddedText(100)],
      eligibility: [generatePaddedText(100), generatePaddedText(100), generatePaddedText(100)],
      features: [
        { title: generatePaddedText(50), description: generatePaddedText(200) },
        { title: generatePaddedText(50), description: generatePaddedText(200) }
      ],
      admissionProcess: [
        { step: 1, title: generatePaddedText(100), description: generatePaddedText(500) },
        { step: 2, title: generatePaddedText(100), description: generatePaddedText(500) },
        { step: 3, title: generatePaddedText(100), description: generatePaddedText(500) }
      ],
      supportExperience: {
        eyebrow: generatePaddedText(80),
        title: generatePaddedText(180),
        description: generatePaddedText(800),
        progressItems: Array.from({ length: 6 }).map(() => ({
          label: generatePaddedText(120),
          value: Math.floor(Math.random() * 100),
          status: generatePaddedText(60)
        })),
        supportCards: Array.from({ length: 4 }).map(() => ({
          title: generatePaddedText(80),
          subtitle: generatePaddedText(120)
        }))
      },
      studentLife: {
        eyebrow: generatePaddedText(80),
        title: generatePaddedText(180),
        description: generatePaddedText(1000),
        cards: Array.from({ length: 6 }).map(() => ({
          title: generatePaddedText(100),
          description: generatePaddedText(300)
        }))
      },
      documentsChecklist: {
        eyebrow: generatePaddedText(80),
        title: generatePaddedText(180),
        items: Array.from({ length: 12 }).map(() => ({
          label: generatePaddedText(140)
        }))
      },
      status: "active",
      isFeatured: true
    });
    createdCountries.push(country._id);
  }

  console.log("🛠️ Seeding 10 MAXIMUM LENGTH Universities...");
  for (let i = 1; i <= 10; i++) {
    const slug = slugify(`max-test-univ-${i}-${Date.now()}`, { lower: true });
    await University.create({
      name: `MAX TEST University ${i} ${generatePaddedText(100)}`,
      slug: slug,
      country: createdCountries[i - 1], // Assigned to matching country
      description: generatePaddedText(2000),
      establishedYear: "1999",
      ranking: generatePaddedText(100),
      accreditation: generatePaddedText(150),
      courseDuration: "5 Years",
      annualFees: "$100,000",
      medium: "English",
      hostelFees: "$20,000",
      eligibility: generatePaddedText(500),
      highlights: [
        { label: generatePaddedText(50), value: generatePaddedText(50) },
        { label: generatePaddedText(50), value: generatePaddedText(50) }
      ],
      faqs: [
        { question: generatePaddedText(200), answer: generatePaddedText(800) },
        { question: generatePaddedText(200), answer: generatePaddedText(800) }
      ],
      status: "active",
      featured: true
    });
  }

  console.log("🛠️ Seeding 10 MAXIMUM LENGTH Global FAQs...");
  for (let i = 1; i <= 10; i++) {
    await Faq.create({
      question: `MAX TEST FAQ ${i}? ${generatePaddedText(300)}`,
      answer: generatePaddedText(2000), // very long answers for testing readmores and breaks
      page: "general",
      status: "active",
      sortOrder: i
    });
  }

  console.log("✅ 10 Countries, 10 Universities, and 10 FAQs explicitly loaded with MAX LENGTH text.");
  console.log("✅ Test word wrapping, line-clamping, and mobile responsiveness!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
