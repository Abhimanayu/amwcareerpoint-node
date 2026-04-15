/**
 * Full dummy data seed — 10+ records per collection
 * Run: node src/scripts/seedDummy.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const slugify  = require("slugify");

const Country      = require("../models/Country");
const University   = require("../models/University");
const { Blog, BlogCategory } = require("../models/Blog");
const Enquiry      = require("../models/Enquiry");
const Faq          = require("../models/Faq");

const makeSlug = (t) => slugify(t, { lower: true, strict: true, trim: true });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint");
  console.log("✅ Connected to MongoDB");

  // ── 1. Countries (10) ─────────────────────────────────────────────
  await Country.deleteMany({});
  const countries = await Country.insertMany([
    {
      name: "Russia", slug: "russia", tagline: "Study MBBS in Russia at affordable cost",
      description: "Russia is one of the top destinations for MBBS studies. With over 50 NMC-approved universities, affordable tuition, and English-medium programs, Russia attracts thousands of Indian students every year.",
      flagImage: "https://flagcdn.com/w80/ru.png", heroImage: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200",
      status: "active", sortOrder: 1,
      highlights: ["NMC & WHO recognized", "Fees $4,000–$7,000/yr", "No donation required", "English medium", "NEET accepted"],
      features: [
        { icon: "🎓", title: "World-Class Universities", description: "Russia has some of the oldest medical universities in the world." },
        { icon: "💰", title: "Affordable Fees", description: "Tuition from $4,000 to $7,000 per year including hostel." },
        { icon: "🌍", title: "Global Recognition", description: "Degrees recognized by WHO, NMC, ECFMG, and FAIMER." },
      ],
      eligibility: ["50% in PCB in Class 12", "NEET qualified", "Age 17+", "Valid passport"],
      admissionProcess: [
        { step: 1, title: "Apply Online", description: "Fill the enquiry form with your details." },
        { step: 2, title: "Document Verification", description: "Submit marksheets and NEET scorecard." },
        { step: 3, title: "Get Invitation Letter", description: "Receive official letter from university." },
        { step: 4, title: "Visa Processing", description: "Apply for student visa with our guidance." },
        { step: 5, title: "Fly to Russia", description: "Depart with pre-departure orientation." },
      ],
      seo: { metaTitle: "Study MBBS in Russia 2025 | AMW Career Point", metaDescription: "Guide to studying MBBS in Russia. NMC approved, low fees, English medium.", keywords: "mbbs in russia, russia medical university, nmc approved" },
    },
    {
      name: "Uzbekistan", slug: "uzbekistan", tagline: "Affordable MBBS in the Heart of Central Asia",
      description: "Uzbekistan has emerged as a top choice for Indian MBBS aspirants. Modern universities, English-medium education, and proximity to India offer excellent value.",
      flagImage: "https://flagcdn.com/w80/uz.png", heroImage: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200",
      status: "active", sortOrder: 2,
      highlights: ["Lowest fees globally $3,000–$5,000/yr", "No IELTS required", "3-hr flight from India", "NMC approved", "Safe student-friendly country"],
      features: [
        { icon: "✈️", title: "Close to India", description: "Just 3-4 hours flight from major Indian cities." },
        { icon: "💊", title: "Modern Hospitals", description: "Well-equipped teaching hospitals for clinical training." },
        { icon: "📚", title: "English Medium", description: "All courses taught in English." },
      ],
      eligibility: ["50% in PCB in Class 12", "NEET qualified", "Age 17+", "Valid passport"],
      admissionProcess: [
        { step: 1, title: "Apply Online", description: "Submit application with required documents." },
        { step: 2, title: "Receive Offer Letter", description: "Get official letter within 7 days." },
        { step: 3, title: "Visa & Travel", description: "Apply for visa and prepare for travel." },
      ],
      seo: { metaTitle: "Study MBBS in Uzbekistan 2025 | AMW Career Point", metaDescription: "Affordable MBBS in Uzbekistan. NMC approved, English medium, low fees.", keywords: "mbbs uzbekistan, uzbekistan medical university" },
    },
    {
      name: "Kazakhstan", slug: "kazakhstan", tagline: "Quality MBBS at Affordable Cost",
      description: "Kazakhstan is a fast-growing destination with globally recognized universities and modern infrastructure for world-class medical training.",
      flagImage: "https://flagcdn.com/w80/kz.png", heroImage: "https://images.unsplash.com/photo-1534375971785-5c1826f739d8?w=1200",
      status: "active", sortOrder: 3,
      highlights: ["WHO & NMC recognized", "Modern hospitals", "Scholarships available", "English medium", "Safe country"],
      features: [
        { icon: "🏥", title: "Modern Infrastructure", description: "State-of-the-art medical facilities." },
        { icon: "🎓", title: "Globally Recognized", description: "Degrees accepted worldwide." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+", "Valid passport"],
      admissionProcess: [
        { step: 1, title: "Apply Online", description: "Submit form with documents." },
        { step: 2, title: "Receive Admission Letter", description: "Get university invitation." },
        { step: 3, title: "Visa & Departure", description: "Process visa and travel." },
      ],
      seo: { metaTitle: "MBBS in Kazakhstan 2025 | AMW Career Point", metaDescription: "Study MBBS in Kazakhstan at top NMC approved universities.", keywords: "mbbs in kazakhstan, kazakhstan medical university" },
    },
    {
      name: "China", slug: "china", tagline: "MBBS in China — Top Universities at Low Cost",
      description: "China offers MBBS education at globally ranked universities with modern infrastructure, English-medium programs, and affordable fees for international students.",
      flagImage: "https://flagcdn.com/w80/cn.png", heroImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
      status: "active", sortOrder: 4,
      highlights: ["Top QS ranked universities", "Fees $3,000–$6,000/yr", "English medium available", "NMC listed universities", "Vibrant student life"],
      features: [
        { icon: "🏛️", title: "Top Ranked", description: "Several Chinese universities rank in global top 500." },
        { icon: "💡", title: "Research Focus", description: "Strong emphasis on research and clinical training." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+", "Valid passport"],
      admissionProcess: [
        { step: 1, title: "Apply Online", description: "Fill enquiry form." },
        { step: 2, title: "Get Admission Letter", description: "University issues invitation." },
        { step: 3, title: "Visa Processing", description: "Apply for student visa." },
      ],
      seo: { metaTitle: "MBBS in China 2025 | AMW Career Point", metaDescription: "Guide to studying MBBS in China. Top universities, affordable fees.", keywords: "mbbs in china, china medical university" },
    },
    {
      name: "Philippines", slug: "philippines", tagline: "MBBS in Philippines — US-Pattern Medical Education",
      description: "Philippines offers US-pattern medical education (BS+MD) recognized worldwide. English is the official medium and the lifestyle is similar to Western countries.",
      flagImage: "https://flagcdn.com/w80/ph.png", heroImage: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200",
      status: "active", sortOrder: 5,
      highlights: ["US-pattern MD degree", "English official language", "USMLE pathway", "Affordable fees", "NMC recognized"],
      features: [
        { icon: "🇺🇸", title: "US-Pattern Curriculum", description: "Follow the American medical education system." },
        { icon: "🌊", title: "Island Life", description: "Beautiful country with welcoming culture." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+", "Valid passport"],
      admissionProcess: [
        { step: 1, title: "Apply", description: "Submit application and documents." },
        { step: 2, title: "Admission Letter", description: "Receive letter from university." },
        { step: 3, title: "Visa", description: "Apply for student visa." },
      ],
      seo: { metaTitle: "MBBS in Philippines 2025 | AMW Career Point", metaDescription: "Study MBBS (MD) in Philippines. US-pattern curriculum, English medium.", keywords: "mbbs philippines, md philippines, study abroad" },
    },
    {
      name: "Georgia", slug: "georgia", tagline: "European MBBS Education at Lowest Cost",
      description: "Georgia offers European standard MBBS education at very affordable costs. The country has a safe environment and numerous NMC-approved universities.",
      flagImage: "https://flagcdn.com/w80/ge.png", heroImage: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200",
      status: "active", sortOrder: 6,
      highlights: ["European standard education", "Fees $4,000–$5,000/yr", "NMC approved", "Easy visa process", "Safe & peaceful country"],
      features: [
        { icon: "🏔️", title: "European Standard", description: "Medical degrees equivalent to European universities." },
        { icon: "🛡️", title: "Safe Country", description: "Georgia ranks among the safest countries." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+"],
      admissionProcess: [
        { step: 1, title: "Apply Online", description: "Submit application." },
        { step: 2, title: "Get Offer Letter", description: "Receive admission letter." },
        { step: 3, title: "Travel", description: "Visa process and depart." },
      ],
      seo: { metaTitle: "MBBS in Georgia 2025 | AMW Career Point", metaDescription: "European standard MBBS in Georgia at affordable cost.", keywords: "mbbs georgia, georgia medical university" },
    },
    {
      name: "Bangladesh", slug: "bangladesh", tagline: "MBBS in Bangladesh — Same Syllabus, Lower Cost",
      description: "Bangladesh offers MBBS with the same syllabus as India at significantly lower cost. The cultural similarity makes it easy for Indian students to adapt.",
      flagImage: "https://flagcdn.com/w80/bd.png", heroImage: "https://images.unsplash.com/photo-1524492412937-b28074a47d70?w=1200",
      status: "active", sortOrder: 7,
      highlights: ["Same syllabus as India", "Hindi/Bengali friendly", "Lowest total cost", "5.5 year course", "NMC approved"],
      features: [
        { icon: "📖", title: "Indian Syllabus", description: "MCI/NMC pattern curriculum, easy for Indian students." },
        { icon: "🤝", title: "Cultural Familiarity", description: "Similar food, language, and culture." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+"],
      admissionProcess: [
        { step: 1, title: "Apply", description: "Submit application." },
        { step: 2, title: "Admission", description: "Get university letter." },
        { step: 3, title: "Travel", description: "Depart for Bangladesh." },
      ],
      seo: { metaTitle: "MBBS in Bangladesh 2025 | AMW Career Point", metaDescription: "MBBS in Bangladesh at affordable cost. Same syllabus as India.", keywords: "mbbs bangladesh, bangladesh medical college" },
    },
    {
      name: "Nepal", slug: "nepal", tagline: "MBBS in Nepal — Indian Equivalent Degree",
      description: "Nepal offers MBBS education equivalent to Indian medical degrees. Close proximity, no language barrier, and NMC-approved colleges make it a top choice.",
      flagImage: "https://flagcdn.com/w80/np.png", heroImage: "https://images.unsplash.com/photo-1544735716-ea9ef3c0c332?w=1200",
      status: "active", sortOrder: 8,
      highlights: ["No language barrier", "Same NMC syllabus", "30 min from India border", "No visa required", "Affordable fees"],
      features: [
        { icon: "🏔️", title: "No Visa Required", description: "Indian students don't need a visa for Nepal." },
        { icon: "🇮🇳", title: "Indian Equivalent", description: "Degree equivalent to Indian medical colleges." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+"],
      admissionProcess: [
        { step: 1, title: "Apply", description: "Submit application form." },
        { step: 2, title: "Seat Allotment", description: "MCC counselling + private allotment." },
        { step: 3, title: "Join", description: "Report to university." },
      ],
      seo: { metaTitle: "MBBS in Nepal 2025 | AMW Career Point", metaDescription: "MBBS in Nepal for Indian students. No visa, same syllabus, affordable.", keywords: "mbbs nepal, nepal medical college" },
    },
    {
      name: "Kyrgyzstan", slug: "kyrgyzstan", tagline: "Budget MBBS in Central Asia",
      description: "Kyrgyzstan offers one of the most affordable MBBS programs in the world with NMC-approved universities and a large Indian student community.",
      flagImage: "https://flagcdn.com/w80/kg.png", heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
      status: "active", sortOrder: 9,
      highlights: ["Cheapest MBBS globally", "Fees from $2,500/yr", "NMC approved colleges", "Large Indian community", "6-year course"],
      features: [
        { icon: "💰", title: "Lowest Fees", description: "Start from just $2,500 per year." },
        { icon: "👨‍👩‍👧", title: "Indian Community", description: "Large established Indian student community." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+"],
      admissionProcess: [
        { step: 1, title: "Apply", description: "Submit form." },
        { step: 2, title: "Admission Letter", description: "Get university letter." },
        { step: 3, title: "Visa", description: "Apply visa and travel." },
      ],
      seo: { metaTitle: "MBBS in Kyrgyzstan 2025 | AMW Career Point", metaDescription: "Cheapest MBBS in Kyrgyzstan. NMC approved universities.", keywords: "mbbs kyrgyzstan, kyrgyzstan medical university" },
    },
    {
      name: "Egypt", slug: "egypt", tagline: "Ancient Land, Modern Medical Education",
      description: "Egypt offers internationally recognized MBBS programs at its historic universities. With affordable fees and English-medium programs, it is growing in popularity.",
      flagImage: "https://flagcdn.com/w80/eg.png", heroImage: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200",
      status: "active", sortOrder: 10,
      highlights: ["WHO recognized universities", "English medium available", "Rich cultural experience", "Affordable fees", "6-year program"],
      features: [
        { icon: "🏛️", title: "Historic Universities", description: "Study at universities with centuries of history." },
        { icon: "🌍", title: "Global Recognition", description: "WHO recognized medical degrees." },
      ],
      eligibility: ["50% in PCB", "NEET qualified", "Age 17+"],
      admissionProcess: [
        { step: 1, title: "Apply", description: "Submit application." },
        { step: 2, title: "Offer Letter", description: "Get admission letter." },
        { step: 3, title: "Visa", description: "Apply for student visa." },
      ],
      seo: { metaTitle: "MBBS in Egypt 2025 | AMW Career Point", metaDescription: "Study MBBS in Egypt at WHO recognized universities.", keywords: "mbbs egypt, egypt medical university" },
    },
  ]);
  console.log(`✅ ${countries.length} countries seeded`);

  const russiaId = countries.find(c => c.slug === "russia")._id;
  const uzbekId  = countries.find(c => c.slug === "uzbekistan")._id;
  const kazId    = countries.find(c => c.slug === "kazakhstan")._id;
  const chinaId  = countries.find(c => c.slug === "china")._id;
  const philId   = countries.find(c => c.slug === "philippines")._id;

  // ── 2. Universities (10) ──────────────────────────────────────────
  await University.deleteMany({});
  const universities = await University.insertMany([
    {
      name: "Kazan Federal University", slug: "kazan-federal-university", country: russiaId,
      description: "One of Russia's oldest and most prestigious universities, founded in 1804. Produced Nobel laureates and has top-ranked medical programs.",
      logo: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=200",
      heroImage: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=1200",
      gallery: ["https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800", "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800"],
      establishedYear: "1804", ranking: "Top 50 Russia, QS 392", accreditation: "NMC, WHO, ECFMG, FAIMER",
      courseDuration: "6 years", annualFees: "$4,500 - $5,000", medium: "English", hostelFees: "$800 - $1,200/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC", "ECFMG", "FAIMER"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$4,500/year" }, { label: "Duration", value: "6 Years" }, { label: "Location", value: "Kazan, Russia" }, { label: "Established", value: "1804" }],
      faqs: [{ question: "Is it NMC approved?", answer: "Yes, fully approved by NMC India." }, { question: "Is food available?", answer: "Yes, Indian food is available in hostel." }],
      seo: { metaTitle: "Kazan Federal University | MBBS in Russia", metaDescription: "Study MBBS at Kazan Federal University. NMC approved, $4500/year.", keywords: "kazan federal university, mbbs kazan" },
    },
    {
      name: "RUDN University Moscow", slug: "rudn-university-moscow", country: russiaId,
      description: "Peoples' Friendship University of Russia (RUDN) in Moscow is globally renowned for its diverse international student community and excellent medical faculty.",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      heroImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200",
      gallery: ["https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800"],
      establishedYear: "1960", ranking: "Top 30 Russia", accreditation: "NMC, WHO",
      courseDuration: "6 years", annualFees: "$5,500 - $6,500", medium: "English", hostelFees: "$1,000 - $1,500/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC", "ECFMG"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$5,500/year" }, { label: "Location", value: "Moscow" }, { label: "Duration", value: "6 Years" }],
      faqs: [{ question: "Is RUDN in Moscow?", answer: "Yes, RUDN is located in Moscow, Russia." }],
      seo: { metaTitle: "RUDN University Moscow | MBBS Russia", metaDescription: "Study MBBS at RUDN University Moscow.", keywords: "rudn university, mbbs moscow" },
    },
    {
      name: "Sechenov University", slug: "sechenov-university", country: russiaId,
      description: "I.M. Sechenov First Moscow State Medical University is Russia's oldest and largest medical university, founded in 1758. It is consistently ranked among the best in the world.",
      logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200",
      heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
      gallery: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"],
      establishedYear: "1758", ranking: "QS Top 250 Globally", accreditation: "NMC, WHO, ECFMG",
      courseDuration: "6 years", annualFees: "$6,000 - $8,000", medium: "English", hostelFees: "$1,200 - $1,800/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC", "ECFMG", "FAIMER"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$6,500/year" }, { label: "Ranking", value: "QS Top 250" }, { label: "Established", value: "1758" }],
      faqs: [{ question: "Is Sechenov the best in Russia?", answer: "Yes, it is Russia's oldest and most prestigious medical university." }],
      seo: { metaTitle: "Sechenov University | MBBS Russia", metaDescription: "Study MBBS at Sechenov University, Russia's oldest medical university.", keywords: "sechenov university, mbbs russia, top university" },
    },
    {
      name: "Volgograd State Medical University", slug: "volgograd-state-medical-university", country: russiaId,
      description: "Volgograd State Medical University is a leading state medical university in Russia offering affordable MBBS in English medium with NMC recognition.",
      logo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200",
      heroImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200",
      gallery: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"],
      establishedYear: "1935", ranking: "Top 100 Russia", accreditation: "NMC, WHO",
      courseDuration: "6 years", annualFees: "$4,000 - $4,800", medium: "English", hostelFees: "$700 - $1,000/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC"],
      status: "active", featured: false,
      highlights: [{ label: "Tuition Fee", value: "$4,000/year" }, { label: "City", value: "Volgograd" }],
      faqs: [{ question: "Is it affordable?", answer: "Yes, one of the most affordable NMC-approved universities in Russia." }],
      seo: { metaTitle: "Volgograd Medical University | MBBS Russia", metaDescription: "Affordable MBBS at Volgograd State Medical University.", keywords: "volgograd medical university, mbbs russia" },
    },
    {
      name: "Tashkent State Medical University", slug: "tashkent-state-medical-university", country: uzbekId,
      description: "Tashkent State Medical University is the oldest and most prestigious medical institution in Uzbekistan, founded in 1919, offering high-quality MBBS in English.",
      logo: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200",
      heroImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200",
      gallery: ["https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800"],
      establishedYear: "1919", ranking: "Rank 1 in Uzbekistan", accreditation: "NMC, WHO",
      courseDuration: "6 years", annualFees: "$3,500 - $4,500", medium: "English", hostelFees: "$600 - $900/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$3,500/year" }, { label: "Location", value: "Tashkent" }, { label: "Established", value: "1919" }],
      faqs: [{ question: "Is it NMC approved?", answer: "Yes, NMC approved and degrees valid in India." }],
      seo: { metaTitle: "Tashkent State Medical University | MBBS Uzbekistan", metaDescription: "Study MBBS at Tashkent State Medical University.", keywords: "tashkent medical university, mbbs uzbekistan" },
    },
    {
      name: "Samarkand State Medical University", slug: "samarkand-state-medical-university", country: uzbekId,
      description: "Samarkand State Medical University is one of the top medical universities in Uzbekistan offering MBBS in English medium with modern clinical training facilities.",
      logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200",
      heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200",
      gallery: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800"],
      establishedYear: "1930", ranking: "Top 3 Uzbekistan", accreditation: "NMC, WHO",
      courseDuration: "6 years", annualFees: "$3,000 - $4,000", medium: "English", hostelFees: "$500 - $800/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC"],
      status: "active", featured: false,
      highlights: [{ label: "Tuition Fee", value: "$3,000/year" }, { label: "City", value: "Samarkand" }],
      faqs: [{ question: "Is Samarkand safe for Indian students?", answer: "Yes, Uzbekistan is one of the safest countries for Indian students." }],
      seo: { metaTitle: "Samarkand Medical University | MBBS Uzbekistan", metaDescription: "Affordable MBBS at Samarkand State Medical University.", keywords: "samarkand medical university, mbbs uzbekistan" },
    },
    {
      name: "Kazakh National Medical University", slug: "kazakh-national-medical-university", country: kazId,
      description: "KazNMU is the leading medical institution in Kazakhstan with modern facilities and globally recognized programs.",
      logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200",
      heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
      gallery: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"],
      establishedYear: "1930", ranking: "Rank 1 Kazakhstan", accreditation: "NMC, WHO",
      courseDuration: "5 years", annualFees: "$4,000 - $5,500", medium: "English", hostelFees: "$700 - $1,000/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$4,500/year" }, { label: "Duration", value: "5 Years" }, { label: "City", value: "Almaty" }],
      faqs: [{ question: "Duration of MBBS?", answer: "5-year English medium MBBS program." }],
      seo: { metaTitle: "KazNMU | MBBS Kazakhstan", metaDescription: "Study MBBS at Kazakh National Medical University.", keywords: "kaznmu, mbbs kazakhstan" },
    },
    {
      name: "Astana Medical University", slug: "astana-medical-university", country: kazId,
      description: "Astana Medical University is located in Kazakhstan's modern capital and offers internationally accredited MBBS programs with cutting-edge research facilities.",
      logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200",
      heroImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200",
      gallery: ["https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800"],
      establishedYear: "1964", ranking: "Top 5 Kazakhstan", accreditation: "NMC, WHO",
      courseDuration: "5 years", annualFees: "$4,200 - $5,000", medium: "English", hostelFees: "$700 - $950/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC"],
      status: "active", featured: false,
      highlights: [{ label: "Tuition Fee", value: "$4,200/year" }, { label: "City", value: "Astana (Capital)" }],
      faqs: [{ question: "Is Astana safe?", answer: "Yes, Astana is the capital and very safe for students." }],
      seo: { metaTitle: "Astana Medical University | MBBS Kazakhstan", metaDescription: "Study MBBS at Astana Medical University, Kazakhstan.", keywords: "astana medical university, mbbs kazakhstan" },
    },
    {
      name: "China Medical University", slug: "china-medical-university", country: chinaId,
      description: "China Medical University is one of the oldest and most prestigious medical universities in China, offering world-class MBBS education in English medium.",
      logo: "https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=200",
      heroImage: "https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=1200",
      gallery: ["https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=800"],
      establishedYear: "1931", ranking: "Top 50 China", accreditation: "NMC listed, WHO",
      courseDuration: "6 years", annualFees: "$4,000 - $5,500", medium: "English", hostelFees: "$800 - $1,200/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$4,500/year" }, { label: "City", value: "Shenyang" }],
      faqs: [{ question: "Is China Medical University NMC listed?", answer: "Yes, it is listed in the NMC approved list." }],
      seo: { metaTitle: "China Medical University | MBBS China", metaDescription: "Study MBBS at China Medical University.", keywords: "china medical university, mbbs china" },
    },
    {
      name: "University of Santo Tomas Faculty of Medicine", slug: "university-santo-tomas-medicine", country: philId,
      description: "University of Santo Tomas is one of the most prestigious universities in the Philippines offering US-pattern MD program with world-class clinical training.",
      logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200",
      heroImage: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200",
      gallery: ["https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800"],
      establishedYear: "1611", ranking: "Top 5 Philippines", accreditation: "NMC, WHO, ECFMG",
      courseDuration: "4 years (BS+MD)", annualFees: "$5,000 - $7,000", medium: "English", hostelFees: "$1,000 - $1,500/year",
      eligibility: "50% in PCB, NEET qualified", recognition: ["WHO", "NMC", "ECFMG"],
      status: "active", featured: true,
      highlights: [{ label: "Tuition Fee", value: "$5,500/year" }, { label: "Degree", value: "BS+MD" }, { label: "Established", value: "1611" }],
      faqs: [{ question: "Is UST degree valid in India?", answer: "Yes, NMC recognizes the degree after clearing FMGE." }],
      seo: { metaTitle: "UST Faculty of Medicine | MBBS Philippines", metaDescription: "Study MD at University of Santo Tomas Philippines.", keywords: "ust philippines, mbbs philippines, md philippines" },
    },
  ]);
  console.log(`✅ ${universities.length} universities seeded`);

  // ── 3. Blog Categories ────────────────────────────────────────────
  await BlogCategory.deleteMany({});
  const categories = await BlogCategory.insertMany([
    { name: "Study Abroad" }, { name: "FMGE Preparation" }, { name: "University Reviews" },
    { name: "Student Life" }, { name: "Visa & Documentation" }, { name: "Admission Process" },
    { name: "Fee Structure" }, { name: "NEET & Eligibility" },
  ]);
  console.log(`✅ ${categories.length} blog categories seeded`);

  const catStudyAbroad  = categories.find(c => c.name === "Study Abroad")._id;
  const catFMGE         = categories.find(c => c.name === "FMGE Preparation")._id;
  const catReviews      = categories.find(c => c.name === "University Reviews")._id;
  const catVisa         = categories.find(c => c.name === "Visa & Documentation")._id;
  const catFees         = categories.find(c => c.name === "Fee Structure")._id;

  // ── 4. Blogs (10) ────────────────────────────────────────────────
  await Blog.deleteMany({});
  const blogs = await Blog.insertMany([
    {
      title: "Top 10 Medical Universities in Russia for Indian Students 2025",
      slug: "top-10-medical-universities-russia-2025",
      content: "<h2>Introduction</h2><p>Russia has been one of the most preferred destinations for Indian medical students for decades. With over 50 NMC-approved universities, affordable fees, and English-medium MBBS programs, Russia offers world-class medical education.</p><h2>Why Study MBBS in Russia?</h2><ul><li>NMC approved universities</li><li>Fees from $4,000 to $7,000 per year</li><li>No donation fee</li><li>English medium instruction</li></ul>",
      excerpt: "Discover the best medical universities in Russia for Indian students in 2025. Compare fees, rankings, and admission requirements.",
      coverImage: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800",
      category: catReviews, author: "AMW Career Point",
      tags: ["russia", "mbbs", "medical universities", "2025"], status: "published", featured: true,
      seo: { metaTitle: "Top 10 Medical Universities in Russia 2025", metaDescription: "Best NMC approved medical universities in Russia for Indian students.", keywords: "best medical universities russia, mbbs russia 2025" },
    },
    {
      title: "MBBS in Uzbekistan 2025 — Complete Guide for Indian Students",
      slug: "mbbs-uzbekistan-complete-guide-2025",
      content: "<h2>Why Uzbekistan?</h2><p>Uzbekistan has rapidly emerged as a top MBBS destination. NMC-approved universities with English-medium education at one of the lowest costs in the world.</p><h2>Total Cost</h2><p>Annual tuition: $3,000–$5,000. Hostel: $600–$900/year. Total 6-year cost: approximately $22,000–$35,000.</p>",
      excerpt: "Complete guide to MBBS in Uzbekistan 2025. Fees, top universities, admission process explained.",
      coverImage: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800",
      category: catStudyAbroad, author: "AMW Career Point",
      tags: ["uzbekistan", "mbbs", "2025", "affordable"], status: "published", featured: true,
      seo: { metaTitle: "MBBS in Uzbekistan 2025 — Complete Guide", metaDescription: "Everything about MBBS in Uzbekistan. Fees, universities, visa.", keywords: "mbbs uzbekistan 2025" },
    },
    {
      title: "FMGE Screening Test — Tips to Clear in First Attempt",
      slug: "fmge-tips-clear-first-attempt",
      content: "<h2>What is FMGE?</h2><p>The Foreign Medical Graduates Examination (FMGE) is mandatory for Indian students who complete MBBS abroad and want to practice in India.</p><h2>Key Tips</h2><ul><li>Start preparation from 3rd year of MBBS</li><li>Focus on high-yield topics</li><li>Practice MCQs daily</li><li>Join a test series</li></ul>",
      excerpt: "Expert tips and proven strategy to clear the FMGE screening exam in your first attempt.",
      coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
      category: catFMGE, author: "Dr. Sanjay Gupta",
      tags: ["fmge", "strategy", "nbe", "pass"], status: "published", featured: false,
      seo: { metaTitle: "FMGE Tips 2025 | Clear in First Attempt", metaDescription: "Proven tips to clear FMGE in first attempt.", keywords: "fmge tips, fmge strategy" },
    },
    {
      title: "How to Get a Student Visa for Russia — Step by Step Guide",
      slug: "student-visa-russia-guide",
      content: "<h2>Documents Required</h2><ul><li>Passport (6 months validity)</li><li>Invitation letter from university</li><li>Medical certificate (HIV test)</li><li>Passport size photos</li><li>Visa application form</li></ul><h2>Process</h2><p>Apply at the Russian Embassy in New Delhi or nearest consulate. Processing takes 7–15 working days.</p>",
      excerpt: "Step-by-step guide to applying for a Russian student visa. Documents, process, and timeline explained.",
      coverImage: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800",
      category: catVisa, author: "Ms. Ayesha Khan",
      tags: ["russia", "visa", "student visa", "documentation"], status: "published", featured: false,
      seo: { metaTitle: "Russia Student Visa Guide 2025", metaDescription: "How to get a student visa for Russia for MBBS students.", keywords: "russia student visa, mbbs russia visa" },
    },
    {
      title: "MBBS in Kazakhstan — Fee Structure and Living Cost 2025",
      slug: "mbbs-kazakhstan-fees-living-cost-2025",
      content: "<h2>Tuition Fees</h2><p>Annual tuition fees range from $4,000 to $5,500 depending on the university. Top universities like KazNMU charge $4,500/year.</p><h2>Living Expenses</h2><p>Hostel: $700–$1,000/year. Food: $100–$150/month. Transport: $20–$40/month. Total monthly expense: approximately $200–$300.</p>",
      excerpt: "Detailed fee structure and living costs for MBBS in Kazakhstan 2025. Plan your budget effectively.",
      coverImage: "https://images.unsplash.com/photo-1534375971785-5c1826f739d8?w=800",
      category: catFees, author: "AMW Career Point",
      tags: ["kazakhstan", "fees", "living cost", "budget"], status: "published", featured: false,
      seo: { metaTitle: "MBBS Kazakhstan Fees 2025 | Living Cost Guide", metaDescription: "Complete fee and living cost breakdown for MBBS in Kazakhstan.", keywords: "mbbs kazakhstan fees, living cost kazakhstan" },
    },
    {
      title: "NEET Score Required for MBBS Abroad — Country-wise Cut-off",
      slug: "neet-score-mbbs-abroad-cutoff",
      content: "<h2>Minimum NEET Score for MBBS Abroad</h2><p>As per NMC regulations, a minimum NEET score is required to study MBBS abroad. The general cut-off is 50th percentile for general category.</p><h2>Country-wise Requirements</h2><table><tr><td>Russia</td><td>150+ marks</td></tr><tr><td>Uzbekistan</td><td>150+ marks</td></tr><tr><td>Kazakhstan</td><td>150+ marks</td></tr><tr><td>Philippines</td><td>150+ marks</td></tr></table>",
      excerpt: "Know the minimum NEET score required for MBBS admission abroad. Country-wise and category-wise breakdown.",
      coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
      category: catStudyAbroad, author: "AMW Career Point",
      tags: ["neet", "cut-off", "mbbs abroad", "eligibility"], status: "published", featured: true,
      seo: { metaTitle: "NEET Score for MBBS Abroad 2025 | Cut-off Guide", metaDescription: "Minimum NEET score required for MBBS abroad. Country-wise cutoff.", keywords: "neet score mbbs abroad, neet cut-off" },
    },
    {
      title: "Life as an Indian Student in Russia — What to Expect",
      slug: "life-indian-student-russia",
      content: "<h2>Food & Accommodation</h2><p>Most Russian universities offer hostel accommodation at affordable rates. Indian food is available in university canteens and Indian restaurants in major cities.</p><h2>Climate</h2><p>Russia has extreme winters (−30°C) so warm clothing is essential. Summers are pleasant.</p><h2>Indian Community</h2><p>There is a large and well-established Indian student community in most university cities.</p>",
      excerpt: "Everything you need to know about student life in Russia as an Indian MBBS student. Food, weather, culture, and more.",
      coverImage: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800",
      category: catStudyAbroad, author: "Rahul Kumar (Student)",
      tags: ["russia", "student life", "indian students", "experience"], status: "published", featured: false,
      seo: { metaTitle: "Student Life in Russia for Indians | Real Experience", metaDescription: "What is student life like for Indian MBBS students in Russia?", keywords: "student life russia, indian students russia" },
    },
    {
      title: "Documents Required for MBBS Admission Abroad — Complete Checklist",
      slug: "documents-mbbs-admission-abroad-checklist",
      content: "<h2>Mandatory Documents</h2><ul><li>Class 10 Marksheet & Certificate</li><li>Class 12 Marksheet & Certificate</li><li>NEET Scorecard</li><li>Passport (minimum 1 year validity)</li><li>Passport size photographs (10)</li><li>Medical Fitness Certificate</li><li>HIV Test Report</li></ul><h2>Optional</h2><ul><li>Transfer Certificate from school</li><li>Migration Certificate (if applicable)</li></ul>",
      excerpt: "Complete checklist of documents required for MBBS admission abroad. Don't miss any document!",
      coverImage: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800",
      category: catVisa, author: "Ms. Ayesha Khan",
      tags: ["documents", "checklist", "admission", "mbbs abroad"], status: "published", featured: false,
      seo: { metaTitle: "Documents for MBBS Abroad 2025 | Complete Checklist", metaDescription: "Full list of documents needed for MBBS admission abroad.", keywords: "documents mbbs abroad, mbbs admission checklist" },
    },
    {
      title: "Kazan Federal University Review — Is It Worth It in 2025?",
      slug: "kazan-federal-university-review-2025",
      content: "<h2>Overview</h2><p>Kazan Federal University (KFU) is one of Russia's oldest universities, established in 1804. It consistently ranks among the top universities in Russia and globally.</p><h2>Pros</h2><ul><li>Affordable fees ($4,500/year)</li><li>Excellent clinical training</li><li>English medium MBBS</li><li>NMC and WHO approved</li></ul><h2>Cons</h2><ul><li>Extremely cold winters</li><li>Language barrier outside campus</li></ul>",
      excerpt: "Honest review of Kazan Federal University for MBBS 2025. Pros, cons, fees, and student experiences.",
      coverImage: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800",
      category: catReviews, author: "AMW Career Point",
      tags: ["kazan federal university", "review", "russia", "2025"], status: "published", featured: false,
      seo: { metaTitle: "Kazan Federal University Review 2025 | Worth It?", metaDescription: "Detailed review of Kazan Federal University for MBBS students.", keywords: "kazan federal university review, kfu russia" },
    },
    {
      title: "MBBS Admission Process 2025 — Step-by-Step for Beginners",
      slug: "mbbs-abroad-admission-process-2025",
      content: "<h2>Step 1: Clear NEET</h2><p>The first and most important step is to qualify NEET with the minimum required score.</p><h2>Step 2: Choose Country & University</h2><p>Research and shortlist countries and universities based on your budget, preferences, and NEET score.</p><h2>Step 3: Apply</h2><p>Contact AMW Career Point and submit your application with required documents.</p><h2>Step 4: Get Invitation Letter</h2><p>The university will issue an official invitation letter within 2-4 weeks.</p><h2>Step 5: Apply for Visa</h2><p>Apply for a student visa at the respective country's embassy in India.</p><h2>Step 6: Fly & Join</h2><p>Attend pre-departure orientation and depart for your dream university!</p>",
      excerpt: "Complete step-by-step MBBS admission process for 2025. From NEET to joining university — everything explained.",
      coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
      category: catStudyAbroad, author: "AMW Career Point",
      tags: ["admission process", "mbbs abroad", "2025", "beginners"], status: "published", featured: true,
      seo: { metaTitle: "MBBS Abroad Admission Process 2025 | Step-by-Step", metaDescription: "Complete MBBS abroad admission process explained for 2025.", keywords: "mbbs admission process, how to get mbbs abroad" },
    },
  ]);
  console.log(`✅ ${blogs.length} blogs seeded`);

  // ── 5. FAQs (page-level) ──────────────────────────────────────
  await Faq.deleteMany({});
  const faqs = await Faq.insertMany([
    // Home page FAQs
    { question: "What is AMW Career Point?",                             answer: "AMW Career Point is a leading overseas education consultancy specializing in MBBS admissions abroad for Indian students. We have helped over 2,000 students secure admissions in top NMC-approved universities.",       page: "home",     sortOrder: 1 },
    { question: "Which countries do you offer MBBS admissions in?",      answer: "We offer MBBS admissions in Russia, Uzbekistan, Kazakhstan, China, Philippines, Georgia, Bangladesh, Nepal, Kyrgyzstan, and Egypt. All universities we recommend are NMC-approved.",                             page: "home",     sortOrder: 2 },
    { question: "Is NEET mandatory for MBBS abroad?",                    answer: "Yes, as per NMC (National Medical Commission) regulations, NEET qualification is mandatory for Indian students to study MBBS abroad and practice medicine in India.",                               page: "home",     sortOrder: 3 },
    { question: "What is the total cost of MBBS abroad?",                answer: "The total cost varies by country. It ranges from approximately ₹15-20 lakh for Uzbekistan/Kyrgyzstan to ₹35-50 lakh for Russia/Philippines over the full course duration including tuition and hostel.",page: "home",     sortOrder: 4 },
    { question: "How do I apply?",                                        answer: "Simply fill out the enquiry form on our website or call our helpline. Our counsellors will guide you through country selection, document preparation, university application, and visa processing.",          page: "home",     sortOrder: 5 },
    { question: "Are AMW Career Point's services free?",                 answer: "Our initial counselling consultation is completely free. Service charges apply only after your admission is confirmed and you are fully satisfied with the university and package offered.",               page: "home",     sortOrder: 6 },

    // Contact page FAQs
    { question: "What are your working hours?",                          answer: "We are available Monday to Saturday, 9:00 AM to 7:00 PM IST. For urgent queries, you can also reach us via WhatsApp outside of office hours.",                                                               page: "contact",  sortOrder: 1 },
    { question: "Do you have offices across India?",                     answer: "Our main office is in Lucknow. We also have representatives in Delhi, Mumbai, Patna, Ranchi, and Hyderabad. Contact us to arrange an in-person consultation at the nearest location.",                        page: "contact",  sortOrder: 2 },
    { question: "Can I schedule an online consultation?",                answer: "Yes! We offer free online consultations via Zoom, Google Meet, or WhatsApp video call. Book your slot by filling out the contact form or calling our helpline.",                                          page: "contact",  sortOrder: 3 },

    // Country page FAQs — Russia
    { question: "Is MBBS degree from Russia valid in India?",            answer: "Yes. Degrees from NMC-approved Russian universities are valid in India. Students must clear the FMGE (Foreign Medical Graduate Examination) after returning to India to practice.",                        page: "country",  pageSlug: "russia",      sortOrder: 1 },
    { question: "What is the medium of instruction in Russia?",          answer: "English medium programs are available at all NMC-approved Russian universities. Some universities also offer Russian-medium programs at lower fees.",                                                       page: "country",  pageSlug: "russia",      sortOrder: 2 },
    { question: "How cold does it get in Russia?",                       answer: "Temperatures in major university cities can drop to -20°C to -35°C in winter. Students must be prepared with warm clothing. Summers are pleasant at 20-25°C.",                                              page: "country",  pageSlug: "russia",      sortOrder: 3 },

    // Country page FAQs — Uzbekistan
    { question: "How far is Uzbekistan from India?",                     answer: "Tashkent, the capital of Uzbekistan, is approximately 3-4 hours by direct flight from major Indian cities like Delhi and Mumbai. This makes it very convenient for students.",                              page: "country",  pageSlug: "uzbekistan",  sortOrder: 1 },
    { question: "Is food available for Indian students in Uzbekistan?",  answer: "Yes, Indian food is widely available in Tashkent and Samarkand. University hostels often have Indian-friendly messs and there are Indian restaurants in major cities.",                                     page: "country",  pageSlug: "uzbekistan",  sortOrder: 2 },

    // General FAQs
    { question: "What is FMGE and when do I need to clear it?",          answer: "FMGE (Foreign Medical Graduate Examination), now called NExT, is a screening test conducted by NMC that you must pass after completing MBBS abroad to get a license to practice medicine in India.",   page: "general",  sortOrder: 1 },
    { question: "Can I transfer to an Indian college after studying abroad?", answer: "No, transfer back to an Indian college is generally not permitted. Students must complete the full MBBS program at the foreign university they enrolled in.",                                          page: "general",  sortOrder: 2 },
  ]);
  console.log(`✅ ${faqs.length} faqs seeded`);

  // ── 6. Enquiries (10) ─────────────────────────────────────────────
  await Enquiry.deleteMany({});
  const enquiries = await Enquiry.insertMany([
    { name: "Amit Sharma",    email: "amit@example.com",    phone: "+91 9876543210", interestedCountry: "Russia",      source: "homepage-form", message: "I want to study MBBS in Russia. Please guide me on the process and fees.", status: "new" },
    { name: "Neha Gupta",     email: "neha@example.com",    phone: "+91 9123456789", interestedCountry: "Uzbekistan",  source: "contact-page",  message: "Interested in Uzbekistan MBBS. What are the total fees including hostel?", status: "contacted" },
    { name: "Rajan Patel",    email: "rajan@example.com",   phone: "+91 9001234567", interestedCountry: "Kazakhstan",  source: "country-page",  message: "Please provide information about KazNMU admission 2025.", status: "new" },
    { name: "Sunita Devi",    email: "sunita@example.com",  phone: "+91 9812345678", interestedCountry: "Russia",      source: "homepage-form", message: "My daughter scored 420 in NEET. Which Russia universities can she apply to?", status: "converted" },
    { name: "Arjun Mehta",    email: "arjun@example.com",   phone: "+91 9701234567", interestedCountry: "Uzbekistan",  source: "homepage-form", message: "Looking for MBBS abroad with good FMGE coaching support.", status: "new" },
    { name: "Kavya Reddy",    email: "kavya@example.com",   phone: "+91 9888123456", interestedCountry: "Kazakhstan",  source: "contact-page",  message: "Please call me regarding Kazakhstan MBBS admission 2025.", status: "new" },
    { name: "Deepak Kumar",   email: "deepak@example.com",  phone: "+91 9600012345", interestedCountry: "Russia",      source: "country-page",  message: "Want to know about RUDN University Moscow fees and hostel.", status: "closed" },
    { name: "Meera Joshi",    email: "meera@example.com",   phone: "+91 9555012345", interestedCountry: "China",       source: "homepage-form", message: "Is China a good option for MBBS? My NEET score is 380.", status: "new" },
    { name: "Saurabh Singh",  email: "saurabh@example.com", phone: "+91 9444012345", interestedCountry: "Philippines", source: "contact-page",  message: "Looking for Philippines MBBS. Is the degree valid in India?", status: "contacted" },
    { name: "Priyanka Das",   email: "priyanka@example.com",phone: "+91 9333012345", interestedCountry: "Georgia",     source: "homepage-form", message: "Please send me details about MBBS in Georgia — fees and top colleges.", status: "new" },
  ]);
  console.log(`✅ ${enquiries.length} enquiries seeded`);

  console.log("\n🎉 All dummy data seeded successfully!");
  console.log("─────────────────────────────────────────");
  console.log(`   Countries:        ${countries.length}`);
  console.log(`   Universities:     ${universities.length}`);
  console.log(`   Blog Categories:  ${categories.length}`);
  console.log(`   Blogs:            ${blogs.length}`);
  console.log(`   FAQs:             ${faqs.length}`);
  console.log(`   Enquiries:        ${enquiries.length}`);
  console.log("─────────────────────────────────────────");
  console.log("\n🔑 Login credentials:");
  console.log("   Email:    admin@amwcareerpoint.com");
  console.log("   Password: Admin@123456");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  console.error(err);
  process.exit(1);
});
