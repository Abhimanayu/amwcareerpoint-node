require("dotenv").config();
const mongoose = require("mongoose");
const Country = require("../models/Country");
const University = require("../models/University");
const slugify = require("slugify");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

async function seedIndia() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  console.log("📍 Upserting India Country Profile...");
  
  const indiaObj = {
    name: "India",
    countryCode: "in",
    tagline: "Explore top-tier education with rich cultural heritage.",
    description: "India is home to some of the world's finest educational institutions offering a wide range of programs in engineering, medicine, management, and arts. With a rapidly growing global presence, Indian universities provide top-notch academic rigor bundled with diverse campus lifestyles.",
    flagImage: "https://via.placeholder.com/150x100.png?text=India+Flag",
    heroImage: "https://via.placeholder.com/1920x1080.png?text=India+Hero+Image",
    bannerImage: "https://via.placeholder.com/1920x600.png?text=India+Banner",
    cardImage: "https://via.placeholder.com/600x400.png?text=India+Card",
    headerColor: "#ff9933",
    feeRange: "₹2 Lakhs - ₹15 Lakhs",
    duration: "3 to 5 Years",
    highlights: ["Global Recognition", "Affordable Education", "Diverse Culture", "Tech Hubs"],
    features: [
      { title: "World Class Labs", description: "State-of-the-art research facilities." },
      { title: "Vibrant Campus Life", description: "Festivals, global summits, and massive alumni networks." }
    ],
    supportExperience: {
      eyebrow: "AMW INDIAN SUPPORT",
      title: "We guide you to India's premier institutes",
      description: "From passing the JEE and NEET equivalents to ensuring seamless hostel allocations.",
      progressItems: [
        { label: "Profile Evaluation", value: 100, status: "Done" },
        { label: "Shortlisting", value: 80, status: "In Progress" }
      ],
      supportCards: [
        { title: "Exam Prep", subtitle: "Crack entrance exams" },
        { title: "Admissions", subtitle: "Direct applications" }
      ]
    },
    studentLife: {
      eyebrow: "LIFE IN INDIA",
      title: "Experience a melting pot of cultures",
      description: "Indian campuses are vibrant ecosystems with massive fests, cultural programs, and intense technical competitions.",
      cards: [
        { title: "Tech Fests", description: "Participate in Asia's largest technical festivals." },
        { title: "Cultural Events", description: "Experience diverse traditions and cuisines." }
      ]
    },
    documentsChecklist: {
      eyebrow: "ADMISSION PREP",
      title: "Documents required for Indian Universities",
      items: [
        { label: "10th and 12th Marksheets" },
        { label: "Transfer Certificate & Migration Certificate" },
        { label: "Entrance Exam Scorecard (JEE/NEET/CUET)" }
      ]
    },
    status: "active",
    isFeatured: true
  };

  const country = await Country.findOneAndUpdate(
    { slug: "india" },
    { $set: indiaObj },
    { upsert: true, new: true }
  );

  console.log("✅ India created/updated successfully.");

  const indianUniversities = [
    {
      name: "Indian Institute of Technology Bombay",
      slug: slugify("IIT Bombay", { lower: true }),
      country: country._id,
      description: "IIT Bombay is a globally recognized engineering and research institution located in Powai, Mumbai. It is famous for its rigorous academics and vibrant campus life.",
      logo: "https://via.placeholder.com/200x200.png?text=IIT+Bombay+Logo",
      heroImage: "https://via.placeholder.com/1920x1080.png?text=IIT+Bombay+Hero",
      gallery: [
        "https://via.placeholder.com/800x600.png?text=IIT+Campus+1",
        "https://via.placeholder.com/800x600.png?text=IIT+Campus+2",
        "https://via.placeholder.com/800x600.png?text=IIT+Labs"
      ],
      establishedYear: "1958",
      ranking: "#1 in India (Engineering)",
      courseDuration: "4 Years",
      annualFees: "₹2.5 Lakhs",
      medium: "English",
      hostelFees: "₹40,000",
      featured: true,
      status: "active"
    },
    {
      name: "All India Institute of Medical Sciences Delhi",
      slug: slugify("AIIMS Delhi", { lower: true }),
      country: country._id,
      description: "AIIMS Delhi is the premier medical college and hospital in India, producing the nation's top doctors and conducting cutting-edge medical research.",
      logo: "https://via.placeholder.com/200x200.png?text=AIIMS+Logo",
      heroImage: "https://via.placeholder.com/1920x1080.png?text=AIIMS+Hero",
      gallery: [
        "https://via.placeholder.com/800x600.png?text=AIIMS+Campus",
        "https://via.placeholder.com/800x600.png?text=AIIMS+Operations"
      ],
      establishedYear: "1956",
      ranking: "#1 in India (Medical)",
      courseDuration: "5.5 Years",
      annualFees: "₹6,000",
      medium: "English",
      hostelFees: "₹15,000",
      featured: true,
      status: "active"
    },
    {
      name: "Indian Institute of Management Ahmedabad",
      slug: slugify("IIM Ahmedabad", { lower: true }),
      country: country._id,
      description: "IIM Ahmedabad is the leading business school in India, known for its case-study methodology and world-class MBA equivalents.",
      logo: "https://via.placeholder.com/200x200.png?text=IIMA+Logo",
      heroImage: "https://via.placeholder.com/1920x1080.png?text=IIMA+Hero",
      gallery: [
        "https://via.placeholder.com/800x600.png?text=IIMA+Brick+Architecture",
        "https://via.placeholder.com/800x600.png?text=IIMA+Library"
      ],
      establishedYear: "1961",
      ranking: "#1 in India (Management)",
      courseDuration: "2 Years",
      annualFees: "₹25 Lakhs",
      medium: "English",
      hostelFees: "₹80,000",
      featured: true,
      status: "active"
    },
    {
      name: "BITS Pilani",
      slug: slugify("BITS Pilani", { lower: true }),
      country: country._id,
      description: "Birla Institute of Technology and Science, Pilani is a prestigious private institute focusing on engineering and sciences with a flexible curriculum.",
      logo: "https://via.placeholder.com/200x200.png?text=BITS+Logo",
      heroImage: "https://via.placeholder.com/1920x1080.png?text=BITS+Hero",
      gallery: [
        "https://via.placeholder.com/800x600.png?text=BITS+Clock+Tower",
        "https://via.placeholder.com/800x600.png?text=BITS+Auditorium"
      ],
      establishedYear: "1964",
      ranking: "Top Private Engineering",
      courseDuration: "4 Years",
      annualFees: "₹5.5 Lakhs",
      medium: "English",
      hostelFees: "₹50,000",
      featured: true,
      status: "active"
    },
    {
      name: "Delhi University",
      slug: slugify("Delhi University", { lower: true }),
      country: country._id,
      description: "A collegiate public central university offering unparalleled programs in Arts, Humanities, Commerce, and Sciences.",
      logo: "https://via.placeholder.com/200x200.png?text=DU+Logo",
      heroImage: "https://via.placeholder.com/1920x1080.png?text=DU+Hero",
      gallery: [
        "https://via.placeholder.com/800x600.png?text=DU+Campus",
        "https://via.placeholder.com/800x600.png?text=DU+Fest"
      ],
      establishedYear: "1922",
      ranking: "Top Central University",
      courseDuration: "3 Years",
      annualFees: "₹15,000",
      medium: "English",
      hostelFees: "₹35,000",
      featured: true,
      status: "active"
    }
  ];

  console.log("📍 Upserting 5 Indian Universities...");

  for (const uni of indianUniversities) {
    await University.findOneAndUpdate(
      { slug: uni.slug },
      { $set: uni },
      { upsert: true, new: true }
    );
  }

  console.log("✅ 5 Indian Colleges created/updated successfully.");
  await mongoose.disconnect();
}

seedIndia().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
