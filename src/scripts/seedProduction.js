/**
 * Production seed script for AMW Career Point.
 * Seeds 6 countries, 12 universities, 8 blogs with real, professional content.
 *
 * Usage:
 *   node src/scripts/seedProduction.js
 *
 * Safe: skips records that already exist (by slug).
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Country = require("../models/Country");
const University = require("../models/University");
const { Blog, BlogCategory } = require("../models/Blog");

// ═══════════════════════════════════════════════════════════════════
// COUNTRIES
// ═══════════════════════════════════════════════════════════════════

const countries = [
  {
    name: "Russia",
    slug: "russia",
    countryCode: "ru",
    tagline: "World-class medical education at affordable costs",
    description:
      "Russia is one of the most sought-after destinations for Indian students pursuing MBBS abroad. Home to over 50 government-recognized medical universities, Russia offers a globally respected curriculum taught in English, with a strong emphasis on clinical training. Russian medical degrees are recognized by the NMC, WHO, and major international bodies. With annual tuition fees between ₹3–6 lakhs and a comfortable cost of living, Russia remains a top choice for students seeking quality medical education without the burden of heavy loans.",
    flagImage: "",
    heroImage: "",
    feeRange: "₹3,00,000 – ₹6,00,000 per year",
    feeRangeUSD: "$3,600 – $7,200 per year",
    duration: "6 years (including internship)",
    currency: "Russian Ruble (RUB)",
    livingCost: "₹8,000 – ₹15,000 per month",
    climate: "Continental — cold winters, warm summers",
    language: "Russian (English-medium courses available)",
    highlights: [
      "NMC and WHO recognized medical universities",
      "English-medium MBBS programs available",
      "Tuition fees starting from ₹3 lakh/year",
      "No entrance exam or donation required",
      "Advanced clinical training with hospital rotations",
      "Indian food and student communities available in major cities",
    ],
    eligibility: [
      "Minimum 50% aggregate in PCB in Class 12 (40% for reserved categories)",
      "NEET qualification is mandatory",
      "Minimum age of 17 years as of December 31 of admission year",
      "Valid Indian passport",
      "No upper age limit for most universities",
    ],
    features: [
      { title: "Affordable Tuition", description: "Annual fees as low as ₹3 lakh, making it accessible for most families" },
      { title: "Global Recognition", description: "Degrees recognized by NMC, WHO, and medical councils worldwide" },
      { title: "English Medium", description: "Complete MBBS curriculum taught in English at top universities" },
      { title: "No Donation", description: "Transparent admission process with no capitation or donation fees" },
      { title: "Advanced Infrastructure", description: "Modern labs, simulation centers, and teaching hospitals" },
    ],
    admissionProcess: [
      { step: 1, title: "Submit Application", description: "Fill out the online application form with academic documents and a valid NEET scorecard." },
      { step: 2, title: "Receive Invitation Letter", description: "Upon acceptance, the university issues an official invitation letter for visa processing." },
      { step: 3, title: "Apply for Student Visa", description: "Submit the invitation letter, passport, and other documents to the Russian embassy for a student visa." },
      { step: 4, title: "Travel & Registration", description: "Arrive in Russia, complete university registration, medical check-up, and hostel allotment." },
      { step: 5, title: "Begin Academic Session", description: "Attend orientation and start the first semester of the MBBS program." },
    ],
    supportExperience: {
      eyebrow: "Why Choose Russia",
      title: "Comprehensive Support for Your Medical Journey",
      description: "AMW Career Point provides end-to-end assistance for students pursuing MBBS in Russia — from university selection and documentation to visa processing and post-arrival support.",
      progressItems: [
        { label: "University Placement Rate", value: 98, status: "Excellent" },
        { label: "Visa Approval Rate", value: 95, status: "High" },
        { label: "Student Satisfaction", value: 92, status: "Excellent" },
      ],
      supportCards: [
        { title: "Admission Guidance", subtitle: "Complete application support" },
        { title: "Visa Assistance", subtitle: "Documentation and embassy coordination" },
        { title: "Travel Arrangements", subtitle: "Flights, pickup, and accommodation" },
        { title: "Post-Arrival Support", subtitle: "Registration, SIM, bank account help" },
      ],
    },
    studentLife: {
      eyebrow: "Student Life",
      title: "Living and Studying in Russia",
      description: "Russia offers a vibrant student experience with modern campuses, diverse cultural events, and Indian communities in every major university city.",
      cards: [
        { title: "Campus Life", description: "Well-equipped hostels, libraries, sports facilities, and student lounges on campus." },
        { title: "Indian Community", description: "Active Indian student associations organize festivals, cultural events, and support networks." },
        { title: "Food & Dining", description: "Indian restaurants and mess facilities serve home-style food in most university cities." },
        { title: "Safety & Transport", description: "Russia has a reliable metro and bus system, and university campuses are generally safe." },
      ],
    },
    documentsChecklist: {
      eyebrow: "Documents Required",
      title: "Checklist for MBBS Admission in Russia",
      items: [
        { label: "Class 10 marksheet and certificate" },
        { label: "Class 12 marksheet and certificate" },
        { label: "NEET scorecard and admit card" },
        { label: "Valid passport (minimum 18 months validity)" },
        { label: "Passport-size photographs (white background)" },
        { label: "Medical fitness certificate" },
        { label: "HIV test report" },
        { label: "Birth certificate" },
      ],
    },
    seo: {
      metaTitle: "MBBS in Russia 2025 – Fees, Admission, Top Universities",
      metaDescription: "Study MBBS in Russia with NMC-recognized universities. Affordable fees starting ₹3 lakh/year. Get complete admission guidance from AMW Career Point.",
    },
    isFeatured: true,
    sortOrder: 1,
    status: "active",
  },
  {
    name: "Georgia",
    slug: "georgia",
    countryCode: "ge",
    tagline: "European-standard medical education in a safe, student-friendly country",
    description:
      "Georgia has rapidly emerged as a top destination for Indian medical students. Located at the crossroads of Europe and Asia, Georgia offers affordable, high-quality MBBS programs taught entirely in English. Georgian medical universities follow a European credit-based curriculum and are recognized by NMC, WHO, and WFME. With no language barrier, low cost of living, and a welcoming culture, Georgia is an excellent choice for aspiring doctors.",
    flagImage: "",
    heroImage: "",
    feeRange: "₹3,50,000 – ₹7,00,000 per year",
    feeRangeUSD: "$4,200 – $8,500 per year",
    duration: "6 years (including internship)",
    currency: "Georgian Lari (GEL)",
    livingCost: "₹10,000 – ₹18,000 per month",
    climate: "Moderate — mild winters, warm summers",
    language: "Georgian (English-medium courses available)",
    highlights: [
      "Complete English-medium MBBS programs",
      "European credit transfer system (ECTS) curriculum",
      "NMC, WHO, and WFME recognized",
      "Safe and student-friendly environment",
      "Affordable tuition and living costs",
      "No IELTS or TOEFL required",
    ],
    eligibility: [
      "Minimum 50% in PCB in Class 12 (40% for reserved categories)",
      "NEET qualification is mandatory",
      "Minimum age of 17 years as of December 31 of admission year",
      "Valid Indian passport",
      "No language proficiency test required",
    ],
    features: [
      { title: "European Curriculum", description: "Modern ECTS-based curriculum aligned with European medical standards" },
      { title: "English Medium", description: "Entire MBBS course delivered in English — no language barrier" },
      { title: "Safe Country", description: "One of the safest countries in Europe with low crime rates" },
      { title: "NMC Recognized", description: "Graduates eligible to appear for FMGE/NExT screening test in India" },
    ],
    admissionProcess: [
      { step: 1, title: "Submit Application", description: "Apply online with Class 12 marksheets, NEET scorecard, and passport copy." },
      { step: 2, title: "Receive Offer Letter", description: "University reviews and issues an official letter of acceptance." },
      { step: 3, title: "Pay Initial Fees", description: "Pay the first-year tuition fee to confirm your admission." },
      { step: 4, title: "Visa Application", description: "Apply for a Georgian student visa at the embassy with required documents." },
      { step: 5, title: "Travel & Enrollment", description: "Arrive in Georgia, complete registration, and begin classes." },
    ],
    supportExperience: {
      eyebrow: "Why Choose Georgia",
      title: "Your Path to a European Medical Degree",
      description: "AMW Career Point guides you through every step — from choosing the right university in Georgia to settling into campus life.",
      progressItems: [
        { label: "University Placement Rate", value: 97, status: "Excellent" },
        { label: "Visa Approval Rate", value: 96, status: "High" },
        { label: "Student Satisfaction", value: 94, status: "Excellent" },
      ],
      supportCards: [
        { title: "University Selection", subtitle: "Personalized counselling and comparison" },
        { title: "Documentation", subtitle: "Complete paperwork and attestation help" },
        { title: "Visa Processing", subtitle: "Embassy appointment and follow-up" },
        { title: "Arrival Support", subtitle: "Airport pickup, hostel, and orientation" },
      ],
    },
    studentLife: {
      eyebrow: "Student Life",
      title: "Experience Georgia as a Medical Student",
      description: "Georgia offers a unique blend of European culture, warm hospitality, and modern campus facilities for international students.",
      cards: [
        { title: "Modern Campuses", description: "State-of-the-art classrooms, labs, and simulation centres at top universities." },
        { title: "Cultural Experience", description: "Explore historic Tbilisi, vibrant nightlife, and Georgian cuisine and traditions." },
        { title: "Affordable Living", description: "Comfortable hostels and city apartments available at budget-friendly prices." },
      ],
    },
    documentsChecklist: {
      eyebrow: "Documents Required",
      title: "Checklist for MBBS Admission in Georgia",
      items: [
        { label: "Class 10 and 12 marksheets and certificates" },
        { label: "NEET scorecard" },
        { label: "Valid passport with minimum 18 months validity" },
        { label: "Passport-size photographs" },
        { label: "Medical fitness certificate" },
        { label: "Birth certificate" },
        { label: "Migration certificate (if applicable)" },
      ],
    },
    seo: {
      metaTitle: "MBBS in Georgia 2025 – Fees, Admission, Universities",
      metaDescription: "Study MBBS in Georgia with European-standard education. NMC recognized, English medium, affordable fees. Apply through AMW Career Point.",
    },
    isFeatured: true,
    sortOrder: 2,
    status: "active",
  },
  {
    name: "Kazakhstan",
    slug: "kazakhstan",
    countryCode: "kz",
    tagline: "Rapidly growing medical education hub in Central Asia",
    description:
      "Kazakhstan is one of the largest and most developed countries in Central Asia, and its medical universities have gained strong recognition worldwide. Several Kazakh medical universities appear in global rankings and are approved by NMC and WHO. The country offers English-medium MBBS programs with modern infrastructure, experienced faculty, and hospital-based clinical training. With tuition fees lower than most European countries and a growing Indian student community, Kazakhstan is an increasingly popular choice.",
    flagImage: "",
    heroImage: "",
    feeRange: "₹3,50,000 – ₹6,50,000 per year",
    feeRangeUSD: "$4,200 – $7,800 per year",
    duration: "5 + 1 years (5 years academic + 1 year internship)",
    currency: "Kazakhstani Tenge (KZT)",
    livingCost: "₹8,000 – ₹14,000 per month",
    climate: "Continental — harsh winters, hot summers",
    language: "Kazakh and Russian (English-medium available)",
    highlights: [
      "NMC and WHO recognized universities",
      "Several globally ranked medical universities",
      "English-medium programs with clinical rotations",
      "Modern hospital infrastructure for training",
      "Growing Indian student community",
      "Affordable tuition and hostel fees",
    ],
    eligibility: [
      "Minimum 50% in PCB in Class 12 (40% for reserved categories)",
      "NEET qualification mandatory",
      "Minimum 17 years of age as of December 31 of admission year",
      "Valid Indian passport",
    ],
    features: [
      { title: "Globally Ranked", description: "Universities like Kazakh National Medical University feature in world rankings" },
      { title: "Clinical Focus", description: "Strong clinical exposure from early years with hospital rotations" },
      { title: "Affordable", description: "Total MBBS cost significantly lower than private colleges in India" },
      { title: "Safe Environment", description: "Politically stable country with good law and order" },
    ],
    admissionProcess: [
      { step: 1, title: "Apply Online", description: "Submit application with academic transcripts, NEET score, and passport copy." },
      { step: 2, title: "Admission Confirmation", description: "Receive official acceptance and invitation letter from the university." },
      { step: 3, title: "Visa Processing", description: "Apply for a student visa at the Kazakhstan embassy with invitation letter." },
      { step: 4, title: "Arrival & Registration", description: "Complete university enrollment, medical check-up, and hostel allocation." },
    ],
    supportExperience: {
      eyebrow: "Why Choose Kazakhstan",
      title: "Quality Medical Education in Central Asia",
      description: "AMW Career Point offers complete support for admissions to Kazakhstan's top medical universities.",
      progressItems: [
        { label: "Placement Success", value: 96, status: "Excellent" },
        { label: "Visa Approval Rate", value: 94, status: "High" },
        { label: "Student Satisfaction", value: 90, status: "Excellent" },
      ],
      supportCards: [
        { title: "Expert Counselling", subtitle: "University and city-wise guidance" },
        { title: "Visa Assistance", subtitle: "Complete documentation support" },
        { title: "Pre-Departure Briefing", subtitle: "What to expect and pack" },
        { title: "On-Ground Support", subtitle: "Local coordinators in Kazakhstan" },
      ],
    },
    studentLife: {
      eyebrow: "Student Life",
      title: "Living in Kazakhstan",
      description: "Kazakhstan offers a modern lifestyle with welcoming people, diverse cuisine, and a growing international student community.",
      cards: [
        { title: "Modern Cities", description: "Almaty and Astana are cosmopolitan cities with malls, cafes, and parks." },
        { title: "Hostel Facilities", description: "University hostels offer furnished rooms, Wi-Fi, and canteen services." },
        { title: "Indian Restaurants", description: "Indian eateries and grocery stores are available near most universities." },
      ],
    },
    documentsChecklist: {
      eyebrow: "Documents Required",
      title: "Checklist for MBBS Admission in Kazakhstan",
      items: [
        { label: "Class 10 and 12 marksheets (originals and copies)" },
        { label: "NEET scorecard" },
        { label: "Valid passport" },
        { label: "Passport-size photographs" },
        { label: "Medical fitness certificate" },
        { label: "HIV test report" },
        { label: "Birth certificate" },
      ],
    },
    seo: {
      metaTitle: "MBBS in Kazakhstan 2025 – Fees, Universities, Admission",
      metaDescription: "Study MBBS in Kazakhstan at globally ranked, NMC-recognized universities. Affordable fees, English medium. Apply with AMW Career Point.",
    },
    isFeatured: true,
    sortOrder: 3,
    status: "active",
  },
  {
    name: "Kyrgyzstan",
    slug: "kyrgyzstan",
    countryCode: "kg",
    tagline: "Budget-friendly MBBS education with NMC recognition",
    description:
      "Kyrgyzstan is one of the most affordable destinations for Indian students looking to study MBBS abroad. The country's medical universities are recognized by the NMC and WHO, making graduates eligible to practice in India after clearing the screening test. Kyrgyz medical universities offer English-medium programs with a focus on practical clinical skills. The simple admission process, low cost of living, and a supportive Indian student community make Kyrgyzstan a strong option for budget-conscious families.",
    flagImage: "",
    heroImage: "",
    feeRange: "₹2,50,000 – ₹4,50,000 per year",
    feeRangeUSD: "$3,000 – $5,400 per year",
    duration: "5 + 1 years (5 years academic + 1 year internship)",
    currency: "Kyrgyzstani Som (KGS)",
    livingCost: "₹6,000 – ₹12,000 per month",
    climate: "Continental — cold winters, pleasant summers",
    language: "Kyrgyz and Russian (English-medium available)",
    highlights: [
      "One of the most affordable MBBS abroad options",
      "NMC and WHO recognized universities",
      "English-medium instruction available",
      "Simple and fast admission process",
      "Established Indian student community",
      "No donation or capitation fees",
    ],
    eligibility: [
      "Minimum 50% in PCB in Class 12 (40% for reserved categories)",
      "NEET qualification mandatory",
      "Minimum 17 years of age by December 31 of admission year",
      "Valid Indian passport",
    ],
    features: [
      { title: "Most Affordable", description: "Total MBBS cost under ₹20 lakhs for the entire course" },
      { title: "Quick Admission", description: "Streamlined process with admissions confirmed in weeks" },
      { title: "Practical Training", description: "Clinical rotations begin from early semesters" },
      { title: "Recognized Globally", description: "Degrees accepted by NMC, WHO, and ECFMG" },
    ],
    admissionProcess: [
      { step: 1, title: "Submit Documents", description: "Send scanned copies of marksheets, NEET score, and passport for evaluation." },
      { step: 2, title: "Get Admission Letter", description: "Receive an official acceptance letter from the chosen university." },
      { step: 3, title: "Visa Application", description: "Apply for a Kyrgyz student visa with the admission letter and supporting documents." },
      { step: 4, title: "Travel & Enroll", description: "Fly to Kyrgyzstan, complete registration, and move into the university hostel." },
    ],
    supportExperience: {
      eyebrow: "Why Choose Kyrgyzstan",
      title: "Affordable Medical Education Within Reach",
      description: "AMW Career Point makes MBBS in Kyrgyzstan accessible with full counselling, documentation, and travel assistance.",
      progressItems: [
        { label: "Placement Success", value: 95, status: "Excellent" },
        { label: "Visa Approval Rate", value: 93, status: "High" },
        { label: "Student Satisfaction", value: 89, status: "Good" },
      ],
      supportCards: [
        { title: "Budget Planning", subtitle: "Fee breakdowns and payment schedules" },
        { title: "Document Preparation", subtitle: "Attestation and apostille support" },
        { title: "Visa Guidance", subtitle: "Complete visa filing and tracking" },
        { title: "Student Welfare", subtitle: "On-ground support in Bishkek" },
      ],
    },
    studentLife: {
      eyebrow: "Student Life",
      title: "Your Life in Kyrgyzstan",
      description: "Kyrgyzstan offers a peaceful, community-driven student experience with affordable living and scenic surroundings.",
      cards: [
        { title: "Affordable Living", description: "One of the cheapest countries for international students with low rent and food costs." },
        { title: "Natural Beauty", description: "Surrounded by mountains, lakes, and scenic landscapes perfect for weekend trips." },
        { title: "Indian Community", description: "Active student groups celebrate Indian festivals and organize cultural events." },
      ],
    },
    documentsChecklist: {
      eyebrow: "Documents Required",
      title: "Checklist for MBBS Admission in Kyrgyzstan",
      items: [
        { label: "Class 10 and 12 marksheets and certificates" },
        { label: "NEET scorecard" },
        { label: "Valid passport" },
        { label: "Passport-size photographs" },
        { label: "Medical fitness certificate" },
        { label: "Birth certificate" },
      ],
    },
    seo: {
      metaTitle: "MBBS in Kyrgyzstan 2025 – Fees, Admission, Universities",
      metaDescription: "Study MBBS in Kyrgyzstan at NMC-approved universities. Fees from ₹2.5 lakh/year. Hassle-free admission via AMW Career Point.",
    },
    isFeatured: false,
    sortOrder: 4,
    status: "active",
  },
  {
    name: "Uzbekistan",
    slug: "uzbekistan",
    countryCode: "uz",
    tagline: "Emerging destination for quality and affordable MBBS abroad",
    description:
      "Uzbekistan is fast becoming a preferred destination for Indian students seeking MBBS abroad. The country's medical universities offer well-structured programs in English, with strong government support for education. Uzbek medical degrees are recognized by NMC and WHO. The country is culturally close to India, with a warm and hospitable population. Low tuition fees, affordable living costs, and an improving infrastructure make Uzbekistan an emerging contender in the MBBS-abroad space.",
    flagImage: "",
    heroImage: "",
    feeRange: "₹2,50,000 – ₹5,00,000 per year",
    feeRangeUSD: "$3,000 – $6,000 per year",
    duration: "5 + 1 years (5 years academic + 1 year internship)",
    currency: "Uzbekistani Som (UZS)",
    livingCost: "₹6,000 – ₹11,000 per month",
    climate: "Continental — cold winters, hot dry summers",
    language: "Uzbek and Russian (English-medium available)",
    highlights: [
      "NMC and WHO recognized medical universities",
      "Government-funded education infrastructure",
      "English-medium MBBS programs",
      "Culturally close to India",
      "Very affordable tuition and living costs",
      "Growing number of Indian students every year",
    ],
    eligibility: [
      "Minimum 50% in PCB in Class 12 (40% for reserved categories)",
      "NEET qualification mandatory",
      "Minimum 17 years of age by December 31 of admission year",
      "Valid Indian passport",
    ],
    features: [
      { title: "Government-Backed", description: "Strong government investment in medical education infrastructure" },
      { title: "Cultural Proximity", description: "Warm, hospitable people with cultural similarities to India" },
      { title: "Low Cost", description: "One of the most affordable MBBS programs globally" },
      { title: "NMC Approved", description: "Graduates can appear for FMGE/NExT screening test in India" },
    ],
    admissionProcess: [
      { step: 1, title: "Apply with Documents", description: "Submit academic certificates, NEET scorecard, and passport for admission review." },
      { step: 2, title: "Receive Acceptance", description: "University issues an official offer letter and invitation for visa." },
      { step: 3, title: "Visa Processing", description: "Apply for an Uzbek student visa with all required documentation." },
      { step: 4, title: "Arrive & Register", description: "Complete enrollment, medical examination, and hostel check-in on arrival." },
    ],
    supportExperience: {
      eyebrow: "Why Choose Uzbekistan",
      title: "An Emerging Medical Education Destination",
      description: "AMW Career Point helps students navigate admissions to Uzbekistan's best medical universities with personalized support.",
      progressItems: [
        { label: "Placement Success", value: 94, status: "Excellent" },
        { label: "Visa Approval Rate", value: 92, status: "High" },
        { label: "Student Satisfaction", value: 88, status: "Good" },
      ],
      supportCards: [
        { title: "University Matching", subtitle: "Best-fit university recommendations" },
        { title: "Visa Coordination", subtitle: "Embassy-level documentation support" },
        { title: "Travel Planning", subtitle: "Flight booking and airport pickup" },
        { title: "Local Assistance", subtitle: "On-ground coordinators in Tashkent" },
      ],
    },
    studentLife: {
      eyebrow: "Student Life",
      title: "Living in Uzbekistan",
      description: "Uzbekistan offers a warm, welcoming environment with rich history, affordable living, and a growing international student community.",
      cards: [
        { title: "Historic Cities", description: "Explore Samarkand, Bukhara, and Tashkent — cities steeped in history and culture." },
        { title: "Affordable Lifestyle", description: "Extremely low cost of living with comfortable hostel and food options." },
        { title: "Friendly Locals", description: "Uzbek people are known for their hospitality and warmth towards Indian students." },
      ],
    },
    documentsChecklist: {
      eyebrow: "Documents Required",
      title: "Checklist for MBBS Admission in Uzbekistan",
      items: [
        { label: "Class 10 and 12 marksheets and certificates" },
        { label: "NEET scorecard" },
        { label: "Valid passport" },
        { label: "Passport-size photographs" },
        { label: "Medical fitness certificate" },
        { label: "Birth certificate" },
        { label: "Police clearance certificate (if required)" },
      ],
    },
    seo: {
      metaTitle: "MBBS in Uzbekistan 2025 – Fees, Admission, Universities",
      metaDescription: "Study MBBS in Uzbekistan with NMC-recognized, affordable medical universities. Complete admission support by AMW Career Point.",
    },
    isFeatured: false,
    sortOrder: 5,
    status: "active",
  },
  {
    name: "Philippines",
    slug: "philippines",
    countryCode: "ph",
    tagline: "US-pattern medical curriculum with English-medium instruction",
    description:
      "The Philippines is a longstanding and popular destination for Indian students pursuing MBBS abroad. The country follows a US-based medical education pattern and the entire curriculum is delivered in English, eliminating any language barrier. Philippine medical universities are recognized by NMC and WHO. Graduates can also pursue residency in the US, UK, or return to India after clearing the screening test. The tropical climate, friendly locals, and familiar cultural environment make the Philippines a comfortable choice for Indian students.",
    flagImage: "",
    heroImage: "",
    feeRange: "₹4,00,000 – ₹8,00,000 per year",
    feeRangeUSD: "$4,800 – $9,600 per year",
    duration: "5.5 years (BS + MD combined program)",
    currency: "Philippine Peso (PHP)",
    livingCost: "₹12,000 – ₹20,000 per month",
    climate: "Tropical — warm and humid year-round",
    language: "Filipino and English (English is official medium of instruction)",
    highlights: [
      "US-based medical curriculum pattern",
      "Entire course taught in English",
      "NMC and WHO recognized universities",
      "Pathway to USMLE and UK residency",
      "Warm, tropical climate and friendly culture",
      "Large Indian student community",
    ],
    eligibility: [
      "Minimum 50% in PCB in Class 12 (40% for reserved categories)",
      "NEET qualification mandatory",
      "Minimum 17 years of age by December 31 of admission year",
      "Valid Indian passport",
      "Some universities require NMAT Philippines entrance exam",
    ],
    features: [
      { title: "US-Pattern Curriculum", description: "MD program modeled on the American medical education system" },
      { title: "100% English", description: "No language barrier — English is the medium of instruction and daily life" },
      { title: "USMLE Pathway", description: "Curriculum prepares students for USMLE Steps, enabling US residency" },
      { title: "NMC Recognized", description: "Graduates eligible for FMGE/NExT screening test to practice in India" },
    ],
    admissionProcess: [
      { step: 1, title: "Submit Application", description: "Apply with academic transcripts, NEET scorecard, and passport copy." },
      { step: 2, title: "Entrance Assessment", description: "Some universities require the NMAT or their own entrance assessment." },
      { step: 3, title: "Receive Acceptance", description: "University issues the official letter of acceptance and enrollment form." },
      { step: 4, title: "Visa Application", description: "Apply for a Philippine student visa (9F) with required documents." },
      { step: 5, title: "Travel & Start", description: "Arrive in the Philippines, complete enrollment, and begin the BS-MD program." },
    ],
    supportExperience: {
      eyebrow: "Why Choose Philippines",
      title: "A Proven Path to a Global Medical Career",
      description: "AMW Career Point offers full guidance for MBBS in the Philippines — from entrance prep to clinical rotations.",
      progressItems: [
        { label: "Placement Success", value: 95, status: "Excellent" },
        { label: "Visa Approval Rate", value: 97, status: "Excellent" },
        { label: "Student Satisfaction", value: 93, status: "Excellent" },
      ],
      supportCards: [
        { title: "Entrance Prep", subtitle: "NMAT guidance and study material" },
        { title: "Admission Filing", subtitle: "Complete application management" },
        { title: "Visa & Travel", subtitle: "Visa processing and flight coordination" },
        { title: "On-Campus Support", subtitle: "Orientation and local coordinator" },
      ],
    },
    studentLife: {
      eyebrow: "Student Life",
      title: "Living in the Philippines",
      description: "The Philippines offers a vibrant, English-speaking environment with tropical beaches, friendly locals, and a strong Indian community.",
      cards: [
        { title: "English Everywhere", description: "Daily life is conducted in English, making it very comfortable for Indian students." },
        { title: "Tropical Lifestyle", description: "Beautiful beaches, islands, and year-round warm weather for a refreshing student life." },
        { title: "Affordable Food", description: "Good variety of Indian and local food at reasonable prices near university areas." },
        { title: "Friendly Culture", description: "Filipinos are known for their warmth and friendliness towards foreign students." },
      ],
    },
    documentsChecklist: {
      eyebrow: "Documents Required",
      title: "Checklist for MBBS Admission in Philippines",
      items: [
        { label: "Class 10 and 12 marksheets and certificates" },
        { label: "NEET scorecard" },
        { label: "Valid passport with minimum 12 months validity" },
        { label: "Passport-size photographs" },
        { label: "Medical fitness certificate" },
        { label: "Birth certificate (PSA authenticated, if required)" },
        { label: "Police clearance certificate" },
        { label: "NMAT score (for universities that require it)" },
      ],
    },
    seo: {
      metaTitle: "MBBS in Philippines 2025 – Fees, Admission, Universities",
      metaDescription: "Study MBBS in Philippines with US-pattern curriculum. English medium, NMC recognized. Expert guidance from AMW Career Point.",
    },
    isFeatured: true,
    sortOrder: 6,
    status: "active",
  },
];

// ═══════════════════════════════════════════════════════════════════
// UNIVERSITIES
// ═══════════════════════════════════════════════════════════════════

// Country slugs are resolved at seed time (see main fn)
const universities = [
  // ── Russia ─────────────────────────────────────────────────────
  {
    name: "Kazan Federal University",
    slug: "kazan-federal-university",
    countrySlug: "russia",
    description:
      "Kazan Federal University is one of the oldest and most prestigious universities in Russia, founded in 1804. Its Institute of Fundamental Medicine and Biology offers a world-class MBBS program in English. The university is ranked among the top 500 globally and provides extensive clinical training at affiliated hospitals. With modern laboratories, a rich academic heritage, and a diverse international student body, Kazan Federal University is a top choice for Indian medical aspirants.",
    establishedYear: "1804",
    ranking: "Top 500 globally (QS Rankings)",
    accreditation: "NMC, WHO, ECFMG recognized",
    courseDuration: "6 years",
    annualFees: "₹4,50,000 per year",
    medium: "English",
    hostelFees: "₹50,000 – ₹80,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "ECFMG", "Ministry of Education, Russia"],
    highlights: [
      { label: "Established", value: "1804" },
      { label: "Global Ranking", value: "Top 500 (QS)" },
      { label: "Annual Fees", value: "₹4.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "6 Years" },
    ],
    faqs: [
      { question: "Is Kazan Federal University recognized by NMC?", answer: "Yes, Kazan Federal University is fully recognized by the National Medical Commission (NMC) of India and the WHO." },
      { question: "What is the medium of instruction?", answer: "The MBBS program is taught entirely in English for international students." },
      { question: "Is hostel accommodation available?", answer: "Yes, the university provides modern hostel facilities with furnished rooms, Wi-Fi, and canteen services." },
      { question: "Can I practice in India after graduating?", answer: "Yes, after clearing the FMGE/NExT screening test, graduates can practice medicine in India." },
    ],
    seo: {
      metaTitle: "Kazan Federal University – MBBS, Fees, Admission",
      metaDescription: "Study MBBS at Kazan Federal University, Russia. NMC recognized, English medium, affordable fees. Apply through AMW Career Point.",
    },
    featured: true,
    status: "active",
  },
  {
    name: "Bashkir State Medical University",
    slug: "bashkir-state-medical-university",
    countrySlug: "russia",
    description:
      "Bashkir State Medical University (BSMU), located in Ufa, is one of the leading medical institutions in Russia with over 90 years of teaching experience. The university offers a well-structured English-medium MBBS program and has trained thousands of international graduates. BSMU is known for its strong clinical training, modern hospital facilities, and experienced faculty. It is recognized by the NMC and WHO, making it a reliable choice for Indian students.",
    establishedYear: "1932",
    ranking: "Top medical university in the Bashkortostan Republic",
    accreditation: "NMC, WHO recognized",
    courseDuration: "6 years",
    annualFees: "₹3,50,000 per year",
    medium: "English",
    hostelFees: "₹40,000 – ₹60,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "Ministry of Health, Russia"],
    highlights: [
      { label: "Established", value: "1932" },
      { label: "Annual Fees", value: "₹3.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "6 Years" },
      { label: "Indian Students", value: "500+" },
    ],
    faqs: [
      { question: "How much does MBBS cost at BSMU?", answer: "The annual tuition fee is approximately ₹3.5 lakh, making it one of the most affordable options in Russia." },
      { question: "Is the degree valid in India?", answer: "Yes, BSMU is NMC-recognized. Graduates can appear for FMGE/NExT to practice in India." },
      { question: "Is Indian food available?", answer: "Yes, there are Indian restaurants and mess facilities available near the campus." },
    ],
    seo: {
      metaTitle: "Bashkir State Medical University – MBBS Fees & Admission",
      metaDescription: "MBBS at Bashkir State Medical University, Ufa. NMC recognized, ₹3.5 lakh/year. Apply via AMW Career Point.",
    },
    featured: false,
    status: "active",
  },

  // ── Georgia ────────────────────────────────────────────────────
  {
    name: "Tbilisi State Medical University",
    slug: "tbilisi-state-medical-university",
    countrySlug: "georgia",
    description:
      "Tbilisi State Medical University (TSMU) is the oldest and most prestigious medical university in Georgia, established in 1918. Located in the capital Tbilisi, TSMU follows the European Credit Transfer System (ECTS) and offers an internationally recognized MD program taught in English. The university is known for its rigorous academic program, excellent clinical facilities, and a vibrant international student community. TSMU graduates are eligible to practice across Europe, India, and other countries.",
    establishedYear: "1918",
    ranking: "No. 1 medical university in Georgia",
    accreditation: "NMC, WHO, WFME recognized",
    courseDuration: "6 years",
    annualFees: "₹5,50,000 per year",
    medium: "English",
    hostelFees: "₹60,000 – ₹90,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "WFME", "Ministry of Education, Georgia"],
    highlights: [
      { label: "Established", value: "1918" },
      { label: "Ranking", value: "#1 in Georgia" },
      { label: "Annual Fees", value: "₹5.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Curriculum", value: "ECTS-based" },
    ],
    faqs: [
      { question: "Is TSMU recognized by NMC India?", answer: "Yes, TSMU is recognized by NMC, WHO, and WFME — graduates can practice in India after clearing FMGE/NExT." },
      { question: "What curriculum does TSMU follow?", answer: "TSMU follows the European Credit Transfer and Accumulation System (ECTS), aligned with EU medical education standards." },
      { question: "Is Tbilisi safe for Indian students?", answer: "Yes, Georgia is one of the safest countries in Europe, and Tbilisi has a welcoming international community." },
      { question: "Are there Indian students at TSMU?", answer: "Yes, TSMU has a significant Indian student population with active cultural associations." },
    ],
    seo: {
      metaTitle: "Tbilisi State Medical University – MBBS Fees & Admission",
      metaDescription: "Study MBBS at Tbilisi State Medical University, Georgia. NMC recognized, ECTS curriculum, English medium. Apply via AMW Career Point.",
    },
    featured: true,
    status: "active",
  },
  {
    name: "European University (Georgia)",
    slug: "european-university-georgia",
    countrySlug: "georgia",
    description:
      "European University is a modern, fast-growing medical institution in Tbilisi, Georgia. Known for its state-of-the-art infrastructure and student-focused approach, the university offers an English-medium MD program aligned with European standards. It is recognized by NMC and WHO and has gained popularity among Indian students for its quality education at competitive fees. The university features modern simulation labs, digital classrooms, and partnerships with leading hospitals for clinical rotations.",
    establishedYear: "2011",
    ranking: "Among top private medical universities in Georgia",
    accreditation: "NMC, WHO recognized",
    courseDuration: "6 years",
    annualFees: "₹4,50,000 per year",
    medium: "English",
    hostelFees: "₹55,000 – ₹75,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "Ministry of Education, Georgia"],
    highlights: [
      { label: "Established", value: "2011" },
      { label: "Annual Fees", value: "₹4.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "6 Years" },
      { label: "Infrastructure", value: "Modern" },
    ],
    faqs: [
      { question: "Is European University recognized by NMC?", answer: "Yes, it is recognized by both NMC India and the WHO." },
      { question: "What makes European University different?", answer: "Modern infrastructure, simulation labs, and small class sizes ensure personalized attention for each student." },
      { question: "What is the total cost of MBBS?", answer: "The total cost including tuition and hostel for 6 years is approximately ₹30–35 lakhs." },
    ],
    seo: {
      metaTitle: "European University Georgia – MBBS Fees & Admission",
      metaDescription: "MBBS at European University Georgia. Modern campus, NMC recognized, ₹4.5 lakh/year. Apply through AMW Career Point.",
    },
    featured: false,
    status: "active",
  },

  // ── Kazakhstan ─────────────────────────────────────────────────
  {
    name: "Kazakh National Medical University",
    slug: "kazakh-national-medical-university",
    countrySlug: "kazakhstan",
    description:
      "Kazakh National Medical University (KazNMU), located in Almaty, is the most prestigious medical university in Kazakhstan and one of the highest-ranked in Central Asia. Founded in 1930, KazNMU offers a comprehensive English-medium MBBS program with strong emphasis on research and clinical practice. The university has affiliations with multiple teaching hospitals and is recognized by the NMC, WHO, and FAIMER. It consistently ranks among the top medical universities in the region.",
    establishedYear: "1930",
    ranking: "No. 1 in Kazakhstan, top in Central Asia",
    accreditation: "NMC, WHO, FAIMER recognized",
    courseDuration: "5 + 1 years",
    annualFees: "₹5,00,000 per year",
    medium: "English",
    hostelFees: "₹50,000 – ₹70,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "FAIMER", "Ministry of Health, Kazakhstan"],
    highlights: [
      { label: "Established", value: "1930" },
      { label: "Ranking", value: "#1 in Kazakhstan" },
      { label: "Annual Fees", value: "₹5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5+1 Years" },
    ],
    faqs: [
      { question: "Is KazNMU a good university for Indian students?", answer: "Yes, KazNMU is the top-ranked medical university in Kazakhstan, recognized by NMC India, WHO, and FAIMER." },
      { question: "What is Almaty like for students?", answer: "Almaty is a modern, cosmopolitan city with good transport, restaurants, and recreational options." },
      { question: "Is clinical training provided?", answer: "Yes, the university has multiple affiliated teaching hospitals where students gain hands-on clinical experience." },
    ],
    seo: {
      metaTitle: "Kazakh National Medical University – MBBS Fees & Admission",
      metaDescription: "MBBS at Kazakh National Medical University, Almaty. #1 in Kazakhstan, NMC recognized. Apply via AMW Career Point.",
    },
    featured: true,
    status: "active",
  },
  {
    name: "Al-Farabi Kazakh National University",
    slug: "al-farabi-kazakh-national-university",
    countrySlug: "kazakhstan",
    description:
      "Al-Farabi Kazakh National University is a leading multidisciplinary university in Almaty with a dedicated School of Medicine. Named after the medieval scholar Al-Farabi, the university is one of the most well-known institutions in Central Asia. It offers MBBS programs with modern medical infrastructure, experienced faculty, and strong research programs. The university is recognized by NMC and WHO, and its medical graduates go on to successful careers across the world.",
    establishedYear: "1934",
    ranking: "Top 200 in Asia (QS Asia Rankings)",
    accreditation: "NMC, WHO recognized",
    courseDuration: "5 + 1 years",
    annualFees: "₹4,50,000 per year",
    medium: "English",
    hostelFees: "₹45,000 – ₹65,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "QS Ranked"],
    highlights: [
      { label: "Established", value: "1934" },
      { label: "Asia Ranking", value: "Top 200 (QS)" },
      { label: "Annual Fees", value: "₹4.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5+1 Years" },
    ],
    faqs: [
      { question: "Is Al-Farabi University NMC recognized?", answer: "Yes, its medical program is recognized by NMC India and WHO." },
      { question: "What is the campus like?", answer: "A large, well-maintained campus with libraries, labs, sports facilities, and comfortable hostels." },
      { question: "Are scholarships available?", answer: "The university offers merit-based scholarships for high-performing international students." },
    ],
    seo: {
      metaTitle: "Al-Farabi Kazakh National University – MBBS Admission",
      metaDescription: "Study MBBS at Al-Farabi Kazakh National University, Almaty. QS ranked, NMC recognized. Apply through AMW Career Point.",
    },
    featured: false,
    status: "active",
  },

  // ── Kyrgyzstan ─────────────────────────────────────────────────
  {
    name: "Kyrgyz State Medical Academy",
    slug: "kyrgyz-state-medical-academy",
    countrySlug: "kyrgyzstan",
    description:
      "Kyrgyz State Medical Academy (KSMA), located in Bishkek, is the premier government medical institution in Kyrgyzstan. Established in 1939, it has a long history of training competent medical professionals. KSMA offers an English-medium MBBS program recognized by NMC and WHO. With affordable fees, experienced faculty, and clinical training at government hospitals, KSMA is one of the most popular choices among Indian students seeking budget-friendly MBBS abroad options.",
    establishedYear: "1939",
    ranking: "No. 1 medical academy in Kyrgyzstan",
    accreditation: "NMC, WHO recognized",
    courseDuration: "5 + 1 years",
    annualFees: "₹3,00,000 per year",
    medium: "English",
    hostelFees: "₹30,000 – ₹45,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "Ministry of Health, Kyrgyzstan"],
    highlights: [
      { label: "Established", value: "1939" },
      { label: "Ranking", value: "#1 in Kyrgyzstan" },
      { label: "Annual Fees", value: "₹3 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Indian Alumni", value: "2000+" },
    ],
    faqs: [
      { question: "What is the total cost of MBBS at KSMA?", answer: "The total cost for 6 years, including tuition and hostel, is approximately ₹18–22 lakhs." },
      { question: "Is KSMA recognized for practicing in India?", answer: "Yes, KSMA is NMC-recognized. Graduates can take the FMGE/NExT to practice in India." },
      { question: "Is Bishkek safe for students?", answer: "Bishkek is a peaceful capital city with a sizable Indian student community and affordable living." },
    ],
    seo: {
      metaTitle: "Kyrgyz State Medical Academy – MBBS Fees & Admission",
      metaDescription: "Study MBBS at Kyrgyz State Medical Academy, Bishkek. NMC recognized, fees from ₹3 lakh/year. Apply with AMW Career Point.",
    },
    featured: true,
    status: "active",
  },
  {
    name: "Osh State University",
    slug: "osh-state-university",
    countrySlug: "kyrgyzstan",
    description:
      "Osh State University is the largest university in southern Kyrgyzstan, located in the city of Osh. Its Faculty of Medicine offers an affordable English-medium MBBS program recognized by NMC and WHO. The university has produced thousands of medical graduates and is known for its practical, hands-on approach to medical education. With some of the lowest fees among NMC-recognized universities, Osh State University is an excellent option for students on a tight budget.",
    establishedYear: "1951",
    ranking: "Top university in southern Kyrgyzstan",
    accreditation: "NMC, WHO recognized",
    courseDuration: "5 + 1 years",
    annualFees: "₹2,50,000 per year",
    medium: "English",
    hostelFees: "₹25,000 – ₹40,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO"],
    highlights: [
      { label: "Established", value: "1951" },
      { label: "Annual Fees", value: "₹2.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5+1 Years" },
      { label: "Total Cost", value: "~₹15–18 Lakh" },
    ],
    faqs: [
      { question: "Is Osh State University a good choice?", answer: "Yes, it is one of the most affordable NMC-recognized universities with a solid track record of Indian graduates." },
      { question: "What is life like in Osh?", answer: "Osh is a quieter city compared to Bishkek, but has all basic amenities and a small Indian community." },
      { question: "How is the clinical training?", answer: "Students get clinical rotations at affiliated government hospitals starting from the 3rd year." },
    ],
    seo: {
      metaTitle: "Osh State University – MBBS Fees & Admission",
      metaDescription: "MBBS at Osh State University, Kyrgyzstan. Most affordable NMC-recognized option. Apply via AMW Career Point.",
    },
    featured: false,
    status: "active",
  },

  // ── Uzbekistan ─────────────────────────────────────────────────
  {
    name: "Tashkent Medical Academy",
    slug: "tashkent-medical-academy",
    countrySlug: "uzbekistan",
    description:
      "Tashkent Medical Academy (TMA) is the leading medical institution in Uzbekistan, located in the capital city Tashkent. Established in 1919, TMA has a century-long tradition of medical education and research. The academy offers an English-medium MBBS program with modern teaching methods, experienced professors, and clinical training at affiliated hospitals. Recognized by NMC and WHO, TMA is the top choice for Indian students looking to study MBBS in Uzbekistan.",
    establishedYear: "1919",
    ranking: "No. 1 medical institution in Uzbekistan",
    accreditation: "NMC, WHO recognized",
    courseDuration: "5 + 1 years",
    annualFees: "₹3,50,000 per year",
    medium: "English",
    hostelFees: "₹30,000 – ₹50,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "Ministry of Health, Uzbekistan"],
    highlights: [
      { label: "Established", value: "1919" },
      { label: "Ranking", value: "#1 in Uzbekistan" },
      { label: "Annual Fees", value: "₹3.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5+1 Years" },
    ],
    faqs: [
      { question: "Is Tashkent Medical Academy NMC recognized?", answer: "Yes, TMA is fully recognized by NMC India and listed in the WHO World Directory of Medical Schools." },
      { question: "What is life like in Tashkent?", answer: "Tashkent is a modern, affordable city with good public transport, parks, and a growing Indian community." },
      { question: "Are there Indian students at TMA?", answer: "Yes, TMA has a growing number of Indian students each year, with active student associations." },
    ],
    seo: {
      metaTitle: "Tashkent Medical Academy – MBBS Fees & Admission",
      metaDescription: "Study MBBS at Tashkent Medical Academy, Uzbekistan. NMC recognized, ₹3.5 lakh/year. Apply via AMW Career Point.",
    },
    featured: true,
    status: "active",
  },
  {
    name: "Samarkand State Medical University",
    slug: "samarkand-state-medical-university",
    countrySlug: "uzbekistan",
    description:
      "Samarkand State Medical University (SamSMU) is a well-established medical institution in the historic city of Samarkand. Founded in 1930, the university has a strong reputation for producing competent medical graduates. SamSMU offers English-medium MBBS programs with clinical training at university-affiliated hospitals. The university is recognized by NMC and WHO. Located in one of the most culturally rich cities in the world, SamSMU offers a unique combination of quality education and a fascinating living experience.",
    establishedYear: "1930",
    ranking: "Among top 3 medical universities in Uzbekistan",
    accreditation: "NMC, WHO recognized",
    courseDuration: "5 + 1 years",
    annualFees: "₹3,00,000 per year",
    medium: "English",
    hostelFees: "₹25,000 – ₹40,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO"],
    highlights: [
      { label: "Established", value: "1930" },
      { label: "Annual Fees", value: "₹3 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5+1 Years" },
      { label: "City", value: "Samarkand" },
    ],
    faqs: [
      { question: "Why choose Samarkand for MBBS?", answer: "SamSMU offers very affordable fees, NMC recognition, and the unique experience of living in the ancient Silk Road city." },
      { question: "Is the degree recognized internationally?", answer: "Yes, the degree is recognized by NMC India and WHO, allowing graduates to practice globally after clearing respective exams." },
      { question: "How is the hostel and food?", answer: "University hostels are clean and affordable. Indian food options are available through local restaurants and student-run kitchens." },
    ],
    seo: {
      metaTitle: "Samarkand State Medical University – MBBS Admission",
      metaDescription: "MBBS at Samarkand State Medical University, Uzbekistan. NMC recognized, ₹3 lakh/year. Apply with AMW Career Point.",
    },
    featured: false,
    status: "active",
  },

  // ── Philippines ────────────────────────────────────────────────
  {
    name: "University of Perpetual Help System DALTA",
    slug: "university-of-perpetual-help-dalta",
    countrySlug: "philippines",
    description:
      "The University of Perpetual Help System DALTA (UPHSD) is one of the most popular universities among Indian students studying MBBS in the Philippines. Located in Las Piñas City, Metro Manila, UPHSD offers a US-based MD program taught entirely in English. The university has a well-equipped medical school with modern simulation labs, a university hospital, and experienced faculty. It is recognized by NMC and WHO, and its curriculum also prepares students for the USMLE, opening pathways for practice in the United States.",
    establishedYear: "1975",
    ranking: "Among top medical schools in the Philippines for international students",
    accreditation: "NMC, WHO, CHED recognized",
    courseDuration: "5.5 years (BS + MD)",
    annualFees: "₹5,00,000 per year",
    medium: "English",
    hostelFees: "₹70,000 – ₹1,00,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "CHED (Philippines)", "ECFMG"],
    highlights: [
      { label: "Established", value: "1975" },
      { label: "Annual Fees", value: "₹5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5.5 Years" },
      { label: "Program", value: "BS-MD Combined" },
    ],
    faqs: [
      { question: "Is UPHSD recognized by NMC?", answer: "Yes, UPHSD is recognized by NMC India, WHO, and the Philippine Commission on Higher Education (CHED)." },
      { question: "What is the BS-MD program?", answer: "It is a combined program: 1.5 years of BS in pre-medical sciences followed by 4 years of Doctor of Medicine (MD)." },
      { question: "Does the curriculum prepare for USMLE?", answer: "Yes, the US-pattern curriculum aligns with USMLE preparation, enabling graduates to pursue residency in the US." },
      { question: "Is Manila safe for students?", answer: "The university area in Las Piñas is a safe, residential neighborhood. The campus has 24/7 security." },
    ],
    seo: {
      metaTitle: "UPHSD Philippines – MBBS (MD) Fees & Admission",
      metaDescription: "Study MBBS (MD) at University of Perpetual Help, Philippines. NMC recognized, English medium, US curriculum. Apply via AMW Career Point.",
    },
    featured: true,
    status: "active",
  },
  {
    name: "AMA School of Medicine",
    slug: "ama-school-of-medicine",
    countrySlug: "philippines",
    description:
      "AMA School of Medicine is a well-known medical institution in the Philippines, part of the larger AMA Education System — one of the largest educational networks in Asia. Located in Makati City, Metro Manila, AMA offers a Doctor of Medicine (MD) program following the US medical curriculum. The school provides strong clinical exposure through hospital rotations and is recognized by NMC and WHO. With competitive fees and a practical approach to medical education, AMA is a solid choice for Indian students seeking MBBS in the Philippines.",
    establishedYear: "1980",
    ranking: "Leading private medical school in the Philippines",
    accreditation: "NMC, WHO, CHED recognized",
    courseDuration: "5.5 years (BS + MD)",
    annualFees: "₹4,50,000 per year",
    medium: "English",
    hostelFees: "₹65,000 – ₹90,000 per year",
    eligibility: "50% in PCB (Class 12), NEET qualified, minimum age 17",
    recognition: ["NMC (India)", "WHO", "CHED (Philippines)"],
    highlights: [
      { label: "Established", value: "1980" },
      { label: "Annual Fees", value: "₹4.5 Lakh" },
      { label: "Medium", value: "English" },
      { label: "Duration", value: "5.5 Years" },
      { label: "Location", value: "Makati, Manila" },
    ],
    faqs: [
      { question: "Is AMA School of Medicine NMC recognized?", answer: "Yes, it is recognized by NMC India, WHO, and the Philippine CHED." },
      { question: "What clinical exposure does AMA provide?", answer: "Students undergo clinical rotations at affiliated hospitals in Metro Manila starting from the 3rd year of the MD program." },
      { question: "What is the Indian student community like?", answer: "AMA has a notable Indian student body with community events and support groups for new arrivals." },
    ],
    seo: {
      metaTitle: "AMA School of Medicine Philippines – MBBS Fees & Admission",
      metaDescription: "MBBS (MD) at AMA School of Medicine, Philippines. NMC recognized, US curriculum, ₹4.5 lakh/year. Apply with AMW Career Point.",
    },
    featured: false,
    status: "active",
  },
];

// ═══════════════════════════════════════════════════════════════════
// BLOG CATEGORIES & BLOGS
// ═══════════════════════════════════════════════════════════════════

const blogCategories = [
  "MBBS Abroad",
  "Country Guides",
  "Exam Preparation",
  "Student Life",
  "Admission Guidance",
];

const blogs = [
  {
    title: "MBBS in Russia 2025: Complete Guide for Indian Students",
    slug: "mbbs-in-russia-complete-guide",
    excerpt: "Everything you need to know about studying MBBS in Russia — from top universities and fees to admission process and student life.",
    categoryName: "Country Guides",
    author: "AMW Career Point",
    tags: ["MBBS in Russia", "Study Abroad", "Medical Education", "NMC Recognized"],
    status: "published",
    featured: true,
    seo: {
      metaTitle: "MBBS in Russia 2025 – Complete Guide | AMW Career Point",
      metaDescription: "Comprehensive guide to studying MBBS in Russia for Indian students. Top universities, fees, eligibility, and admission process.",
    },
    content: `<h2>Introduction</h2>
<p>Russia has been a trusted destination for Indian medical students for over two decades. With more than 50 NMC-recognized universities, affordable tuition fees, and English-medium programs, Russia continues to attract thousands of Indian students every year. In this guide, we cover everything you need to know about pursuing MBBS in Russia in 2025.</p>

<h2>Why Choose Russia for MBBS?</h2>
<p>Russia offers a unique combination of world-class medical education and affordability. The country's medical universities are recognized by the NMC (National Medical Commission), WHO, and other international bodies. Unlike private medical colleges in India, Russian universities charge no donation or capitation fees, and the annual tuition typically ranges between ₹3–6 lakhs. The curriculum emphasizes both theoretical knowledge and clinical practice, with hospital rotations from the third year onwards.</p>

<h2>Top Medical Universities in Russia</h2>
<p>Some of the most popular and highly-regarded medical universities in Russia for Indian students include Kazan Federal University, Bashkir State Medical University, Crimea Federal University, and Orenburg State Medical University. These universities offer complete English-medium MBBS programs, modern campus facilities, and have a strong track record of producing successful medical graduates. When choosing a university, consider factors like NMC recognition, fee structure, location, and the strength of their Indian student community.</p>

<h2>Eligibility and Admission Process</h2>
<p>To study MBBS in Russia, Indian students must have scored a minimum of 50% in Physics, Chemistry, and Biology in Class 12, and must have a valid NEET scorecard. The admission process is straightforward: submit your application along with academic documents, receive an invitation letter from the university, apply for a student visa at the Russian embassy, and travel to Russia for enrollment. There is no entrance exam required by Russian universities — NEET qualification is sufficient.</p>

<h2>Fee Structure and Cost of Living</h2>
<p>The annual tuition fee at most Russian medical universities ranges from ₹3 lakh to ₹6 lakh, depending on the university and city. Hostel fees are typically ₹40,000 to ₹80,000 per year. The monthly cost of living, including food, transport, and personal expenses, ranges from ₹8,000 to ₹15,000. This makes the total cost of completing MBBS in Russia approximately ₹25–40 lakhs — significantly lower than most private medical colleges in India.</p>

<h2>Life as a Medical Student in Russia</h2>
<p>Russian university cities offer a comfortable student experience. Most campuses have well-furnished hostels, canteens, libraries, and sports facilities. Indian students will find Indian restaurants and grocery stores in major university cities. Active Indian student associations organize cultural events and festivals. While winters can be harsh, the university experience is enriching, with exposure to international peers and advanced medical training.</p>

<h2>Conclusion</h2>
<p>Russia remains one of the best destinations for Indian students seeking quality, affordable MBBS education abroad. With strong NMC recognition, no donation requirements, and a well-structured English-medium curriculum, a Russian medical degree opens doors to a successful medical career. If you're considering MBBS in Russia, AMW Career Point can guide you through every step — from choosing the right university to settling into your new campus.</p>

<h2>Frequently Asked Questions</h2>
<h3>Is MBBS in Russia recognized in India?</h3>
<p>Yes, most Russian medical universities are recognized by the NMC. Graduates must clear the FMGE/NExT screening test to practice in India.</p>
<h3>Do I need to learn Russian?</h3>
<p>English-medium programs are available at many universities. A basic Russian language course is usually included in the first year to help with daily life and patient interaction.</p>
<h3>Is MBBS in Russia safe for Indian students?</h3>
<p>Yes, Russian university cities are generally safe, and universities have dedicated international student support services.</p>`,
  },
  {
    title: "MBBS in Georgia: Why It's a Top Choice in 2025",
    slug: "mbbs-in-georgia-top-choice-2025",
    excerpt: "Discover why Georgia is rapidly becoming one of the most preferred European destinations for Indian students pursuing MBBS abroad.",
    categoryName: "Country Guides",
    author: "AMW Career Point",
    tags: ["MBBS in Georgia", "European Medical Education", "Study Abroad", "ECTS Curriculum"],
    status: "published",
    featured: true,
    seo: {
      metaTitle: "MBBS in Georgia 2025 – Why Choose Georgia | AMW Career Point",
      metaDescription: "Top reasons to study MBBS in Georgia. European ECTS curriculum, English medium, NMC recognized. Guide by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>Georgia, located at the crossroads of Europe and Asia, has emerged as one of the most attractive destinations for Indian students seeking MBBS abroad. With European-standard education, full English-medium programs, NMC recognition, and a safe living environment, Georgia offers an exceptional value proposition for aspiring doctors. This guide explores everything you need to know about pursuing MBBS in Georgia in 2025.</p>

<h2>European Curriculum, Global Recognition</h2>
<p>Georgian medical universities follow the European Credit Transfer and Accumulation System (ECTS), meaning your degree is aligned with EU medical education standards. This gives you the flexibility to pursue further studies or practice medicine in European countries as well. Universities like Tbilisi State Medical University and European University are recognized by NMC, WHO, and WFME — ensuring your degree is valid for practicing in India after clearing the FMGE/NExT screening test.</p>

<h2>Affordable Fees and No Hidden Costs</h2>
<p>Annual tuition fees at Georgian medical universities range from ₹3.5 lakh to ₹7 lakh, with the total cost of completing the entire 6-year program being approximately ₹25–45 lakhs. There are no hidden donation fees or capitation charges. Many universities also offer payment plans to ease the financial burden on families. The cost of living is moderate — students can live comfortably on ₹10,000–18,000 per month including food, transport, and essentials.</p>

<h2>Student-Friendly and Safe Environment</h2>
<p>Georgia is one of the safest countries in Europe, with a very low crime rate. Georgian people are known for their hospitality, and international students are welcomed warmly. Tbilisi, the capital city where most medical universities are located, is a vibrant city with a rich cultural heritage, modern cafes, and a growing international community. Indian restaurants and stores are easily accessible.</p>

<h2>Admission Process and Eligibility</h2>
<p>Eligibility is straightforward: 50% in PCB in Class 12, NEET qualification, and a valid Indian passport. The admission process involves submitting an application with documents, receiving an offer letter, paying the first-year fee, and applying for a student visa. No IELTS/TOEFL or additional entrance exam is required. AMW Career Point handles the entire process end-to-end, ensuring a smooth transition from India to Georgia.</p>

<h2>Conclusion</h2>
<p>Georgia offers a compelling combination of European-quality education, affordability, safety, and NMC recognition. For Indian students who want a globally valid medical degree without the stress and expense of Indian private colleges, Georgia is a smart choice. Contact AMW Career Point for personalized guidance on your MBBS journey to Georgia.</p>

<h2>Frequently Asked Questions</h2>
<h3>Can I practice in India with a Georgian medical degree?</h3>
<p>Yes, after clearing the FMGE/NExT screening test, Georgian medical graduates can practice in India.</p>
<h3>Is Georgian visa easy to get?</h3>
<p>Yes, Georgian student visas have a high approval rate. AMW Career Point assists with the entire documentation and visa process.</p>
<h3>Do I need to know Georgian language?</h3>
<p>No, the entire MBBS program is offered in English. Georgian language is not required for academic purposes.</p>`,
  },
  {
    title: "MBBS in Kazakhstan: Affordable Excellence in Central Asia",
    slug: "mbbs-in-kazakhstan-affordable-excellence",
    excerpt: "Kazakhstan offers globally ranked medical universities at affordable prices. Here's your complete guide to studying MBBS in Kazakhstan.",
    categoryName: "Country Guides",
    author: "AMW Career Point",
    tags: ["MBBS in Kazakhstan", "Central Asia", "Affordable MBBS", "NMC Recognized"],
    status: "published",
    featured: false,
    seo: {
      metaTitle: "MBBS in Kazakhstan 2025 – Affordable & Ranked | AMW Career Point",
      metaDescription: "Study MBBS in Kazakhstan at globally ranked universities. Complete guide on fees, eligibility, and top universities by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>Kazakhstan, the largest country in Central Asia, has become an increasingly popular destination for Indian students pursuing medical education abroad. Home to several globally ranked universities, Kazakhstan offers high-quality MBBS programs at competitive prices. With NMC and WHO recognition, English-medium instruction, and modern medical infrastructure, Kazakhstan presents a strong case for aspiring doctors.</p>

<h2>Why Kazakhstan Stands Out</h2>
<p>Kazakhstan's medical universities have invested heavily in infrastructure, faculty development, and international accreditation. Kazakh National Medical University in Almaty, for instance, is consistently ranked among the top medical schools in Central Asia. The country follows a 5+1 year MBBS structure (5 years of academics plus 1 year of clinical internship), and clinical training is conducted at well-equipped teaching hospitals. English-medium programs ensure Indian students face no language barriers in their academic studies.</p>

<h2>Fee Structure and Total Cost</h2>
<p>The annual tuition fee ranges from ₹3.5 lakh to ₹6.5 lakh, depending on the university. Hostel accommodation costs ₹45,000 to ₹70,000 per year. Monthly living expenses are moderate at ₹8,000 to ₹14,000. The total cost for the entire MBBS program is approximately ₹25–40 lakhs, which is highly competitive compared to Indian private medical colleges charging ₹60 lakh to over ₹1 crore.</p>

<h2>Top Universities and Their Strengths</h2>
<p>Kazakh National Medical University (Almaty) is the premier institution — globally ranked, NMC-recognized, with extensive clinical training facilities. Al-Farabi Kazakh National University also offers a strong medical program with QS Asia rankings. Both institutions have experienced faculty, modern labs, and are located in Almaty — a cosmopolitan city with excellent amenities.</p>

<h2>Eligibility and How to Apply</h2>
<p>Indian students need 50% in PCB (Class 12), a valid NEET score, and a passport. The admission process involves online application, receiving an admission letter, visa processing through the Kazakhstan embassy, and travel. AMW Career Point handles the complete process including university selection, documentation, visa filing, and travel arrangements.</p>

<h2>Conclusion</h2>
<p>Kazakhstan offers the rare combination of globally ranked education at affordable prices. For Indian students looking beyond the traditional MBBS abroad destinations, Kazakhstan is a strong, value-for-money option backed by international recognition. Reach out to AMW Career Point for expert guidance on your MBBS journey to Kazakhstan.</p>

<h2>Frequently Asked Questions</h2>
<h3>Are Kazakhstan medical degrees accepted in India?</h3>
<p>Yes, degrees from NMC-recognized Kazakh universities are valid in India after clearing FMGE/NExT.</p>
<h3>How cold does it get in Kazakhstan?</h3>
<p>Winters in Almaty can be cold (-10°C to -20°C), but university hostels are fully heated and well-insulated.</p>
<h3>Is Kazakhstan safe for Indian students?</h3>
<p>Yes, Kazakhstan is a politically stable country with a good law-and-order situation and a welcoming attitude toward international students.</p>`,
  },
  {
    title: "NEET Score and MBBS Abroad: What You Need to Know in 2025",
    slug: "neet-score-mbbs-abroad-2025",
    excerpt: "Understand the NEET requirements for studying MBBS abroad, minimum qualifying scores, and how to choose the right country based on your marks.",
    categoryName: "Exam Preparation",
    author: "AMW Career Point",
    tags: ["NEET", "MBBS Abroad", "NMC Guidelines", "Eligibility", "NEET Score"],
    status: "published",
    featured: true,
    seo: {
      metaTitle: "NEET Score for MBBS Abroad 2025 – Requirements & Guide",
      metaDescription: "Minimum NEET score needed for MBBS abroad in 2025. Country-wise requirements, NMC rules, and expert guidance by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>If you're planning to study MBBS abroad, understanding the NEET requirements is crucial. As per NMC (National Medical Commission) guidelines, NEET qualification is mandatory for all Indian students seeking admission to foreign medical universities. This article breaks down the NEET score requirements, eligibility criteria, and how your score can influence your choice of country and university.</p>

<h2>NMC Mandate: NEET Is Mandatory</h2>
<p>The NMC mandates that all Indian students — regardless of category — must qualify NEET before seeking admission to any foreign medical university. This rule was introduced to ensure that students pursuing MBBS abroad meet a minimum standard of academic competence. Without a valid NEET scorecard, no NMC-recognized foreign university will admit an Indian student, and any degree obtained without NEET will not be recognized for practice in India.</p>

<h2>Minimum NEET Score for MBBS Abroad</h2>
<p>There is no separate "minimum score" specifically for MBBS abroad — you simply need to qualify NEET. For General category students, the typical qualifying percentile is 50th percentile, and for SC/ST/OBC categories, it is 40th percentile. In practical terms, this translates to a score of approximately 130–150 for General and around 105–110 for reserved categories (this varies slightly year to year). Most reputable foreign universities accept students who have qualified NEET without requiring very high scores — making MBBS abroad accessible to a wider range of students.</p>

<h2>Country-Wise NEET Expectations</h2>
<p>While NEET qualification is the baseline, different countries and universities may have varying levels of competition. Popular destinations like Russia and Georgia accept students with NEET qualifying scores. Universities in Kazakhstan and Kyrgyzstan are similarly accessible. The Philippines may have additional requirements like the NMAT entrance test for some universities. In general, MBBS abroad is a viable option for students in the 130–400 NEET score range who may not secure a seat in Indian government colleges but want quality medical education at affordable fees.</p>

<h2>How to Choose Based on Your NEET Score</h2>
<p>If your NEET score is in the 400+ range, you may also want to explore state counselling options in India. For scores between 200–400, MBBS abroad offers excellent value — you can access top NMC-recognized universities in Russia, Georgia, Kazakhstan, or the Philippines at a fraction of Indian private college costs. For scores near the qualifying cutoff (130–200), countries like Kyrgyzstan and Uzbekistan offer the most budget-friendly options. AMW Career Point can help you evaluate the best option based on your specific score and budget.</p>

<h2>Conclusion</h2>
<p>NEET qualification is the key that opens the door to MBBS abroad. Regardless of whether you scored 140 or 400, there are quality NMC-recognized universities available for every budget. The important thing is to make an informed decision based on your academic profile, financial situation, and career goals. AMW Career Point is here to help you navigate this decision with expert counselling and end-to-end support.</p>

<h2>Frequently Asked Questions</h2>
<h3>Can I study MBBS abroad without NEET?</h3>
<p>No. As per NMC rules, NEET qualification is mandatory for Indian students. Any foreign degree obtained without NEET will not be recognized in India.</p>
<h3>Is there a minimum NEET score required for specific countries?</h3>
<p>Most countries require only NEET qualification (50th percentile for General, 40th for reserved). There is no country-specific minimum score beyond this.</p>
<h3>What if I score below 200 in NEET?</h3>
<p>You can still pursue MBBS abroad in affordable countries like Kyrgyzstan and Uzbekistan. AMW Career Point can guide you to the best university for your score range.</p>`,
  },
  {
    title: "NMC, FMGE, and NExT Exam: What Every MBBS Abroad Student Must Know",
    slug: "nmc-fmge-next-exam-guide",
    excerpt: "A clear breakdown of FMGE, NExT, and NMC registration — the essential steps for Indian students returning from MBBS abroad.",
    categoryName: "Exam Preparation",
    author: "AMW Career Point",
    tags: ["NMC", "FMGE", "NExT Exam", "Screening Test", "MBBS Abroad"],
    status: "published",
    featured: false,
    seo: {
      metaTitle: "NMC, FMGE & NExT Exam Guide – MBBS Abroad Students",
      metaDescription: "Complete guide to FMGE, NExT exam, and NMC registration for MBBS abroad graduates. Everything you need to know, by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>For Indian students studying MBBS abroad, the journey doesn't end with graduation — you must clear a screening test to practice medicine in India. The NMC (National Medical Commission) requires all foreign medical graduates to pass either the FMGE (Foreign Medical Graduate Examination) or the upcoming NExT (National Exit Test) to obtain a license to practice. This article explains both exams, their differences, and how to prepare effectively.</p>

<h2>What is FMGE?</h2>
<p>The Foreign Medical Graduate Examination (FMGE) is a screening test conducted by the National Board of Examinations (NBE) for Indian citizens who have obtained their medical degree from a foreign university. It is currently held twice a year (June and December). The exam consists of 300 MCQs covering all major subjects of MBBS — Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, Forensic Medicine, Community Medicine, Medicine, Surgery, Obstetrics & Gynaecology, Paediatrics, ENT, and Ophthalmology. A minimum score of 150 out of 300 (50%) is required to pass.</p>

<h2>What is NExT and How Is It Different?</h2>
<p>NExT (National Exit Test) is a unified examination that the NMC has been developing to replace multiple exams including FMGE. Once fully implemented, NExT is expected to serve as the licensing exam for both Indian and foreign medical graduates. NExT is proposed to have two steps — Step 1 (theory) and Step 2 (practical/clinical). Students who clear NExT will not need to take FMGE separately. As of 2025, the NMC is working on the implementation timeline, and students should stay updated on the latest notifications.</p>

<h2>How to Prepare for FMGE/NExT</h2>
<p>Preparation should ideally begin during the final year of MBBS itself. Focus on high-yield subjects like Medicine, Surgery, OBG, Pathology, and Pharmacology. Use reputable question banks and practice previous years' papers. Many students enroll in FMGE coaching programs — both online and classroom-based — during their internship year. Consistent revision, mock tests, and clinical exposure during your MBBS years are the keys to clearing the exam on your first attempt.</p>

<h2>NMC Registration After Clearing FMGE/NExT</h2>
<p>After passing FMGE or NExT, you need to apply for provisional registration with your respective State Medical Council. This registration allows you to work as a doctor in India. You will then need to complete a compulsory internship (12 months) at an approved hospital in India if not already completed abroad. After internship completion, you receive permanent registration and can practice as a fully licensed medical doctor in India.</p>

<h2>Conclusion</h2>
<p>Clearing the FMGE or NExT exam is a critical milestone for MBBS abroad graduates who want to practice in India. With focused preparation starting from your final MBBS year, it is very much achievable. AMW Career Point supports students throughout their journey — including connecting them with FMGE preparation resources and guidance for the NMC registration process.</p>

<h2>Frequently Asked Questions</h2>
<h3>Is FMGE difficult to pass?</h3>
<p>The pass rate for FMGE has historically been around 20–25%, but with dedicated preparation and good coaching, many students clear it on their first attempt.</p>
<h3>Will NExT replace FMGE completely?</h3>
<p>Yes, NExT is designed to eventually replace FMGE. However, until NExT is fully implemented, FMGE will continue. Check NMC notifications for the latest timeline.</p>
<h3>Can I do internship abroad instead of India?</h3>
<p>Internship abroad is acceptable if it meets NMC standards. However, most students prefer to return to India for internship to prepare for FMGE alongside clinical training.</p>`,
  },
  {
    title: "How to Choose the Right Country for MBBS Abroad",
    slug: "how-to-choose-right-country-mbbs-abroad",
    excerpt: "Confused between Russia, Georgia, Kazakhstan, and other countries for MBBS? Here's a structured approach to making the right decision.",
    categoryName: "Admission Guidance",
    author: "AMW Career Point",
    tags: ["Country Selection", "MBBS Abroad", "Comparison", "Admission Guidance"],
    status: "published",
    featured: false,
    seo: {
      metaTitle: "How to Choose the Best Country for MBBS Abroad | AMW Career Point",
      metaDescription: "Structured guide to choosing the right country for MBBS abroad. Compare Russia, Georgia, Kazakhstan & more. Expert advice by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>Choosing the right country for MBBS abroad is one of the most important decisions you'll make in your medical career. With multiple options — Russia, Georgia, Kazakhstan, Kyrgyzstan, Uzbekistan, Philippines — it can feel overwhelming. This article provides a clear, structured framework to help you evaluate and compare destinations based on what matters most: recognition, fees, quality, and lifestyle.</p>

<h2>Factor 1: NMC Recognition</h2>
<p>The most critical factor is whether the university is recognized by India's National Medical Commission (NMC). Only NMC-recognized universities allow you to appear for FMGE/NExT and practice in India. Before finalizing any university, verify its status on the NMC website and the WHO World Directory of Medical Schools. All countries featured by AMW Career Point — Russia, Georgia, Kazakhstan, Kyrgyzstan, Uzbekistan, and Philippines — have NMC-recognized institutions.</p>

<h2>Factor 2: Tuition Fees and Total Budget</h2>
<p>Your family's budget is a practical consideration. Here is a rough comparison of total MBBS cost (tuition + hostel + living) across countries: Kyrgyzstan and Uzbekistan are the most affordable at ₹15–25 lakhs total. Russia and Kazakhstan fall in the mid-range at ₹25–40 lakhs. Georgia ranges from ₹25–45 lakhs. The Philippines is typically ₹35–55 lakhs. Indian private colleges, in comparison, can cost ₹60 lakh to over ₹1 crore. Clearly, all abroad options offer significant savings.</p>

<h2>Factor 3: Curriculum and Medium of Instruction</h2>
<p>English-medium availability is crucial. All the countries mentioned offer MBBS programs in English, but the quality and extent vary. The Philippines and Georgia teach entirely in English. Russia and Kazakhstan have well-established English-medium tracks. Kyrgyzstan and Uzbekistan have English-medium options, though some clinical interaction may involve Russian or the local language. Consider how comfortable you are with potential language exposure beyond the classroom.</p>

<h2>Factor 4: Climate, Culture, and Lifestyle</h2>
<p>Don't underestimate the impact of lifestyle factors on your 5–6 year stay. If you prefer warm weather, the Philippines is ideal. Georgia offers a moderate European climate. Central Asian countries have harsh winters but are culturally close to India. Russia's winters are severe, but university cities offer modern amenities. Consider factors like food availability (Indian restaurants), safety, proximity to India (flight time and cost), and the size of the Indian student community.</p>

<h2>Factor 5: Career Pathways After Graduation</h2>
<p>Think beyond just the degree. Some universities prepare students for USMLE (US residency pathway), particularly in the Philippines. European-curriculum countries like Georgia offer pathways to EU practice. Russian and Central Asian degrees are well-recognized for FMGE/NExT in India. Discuss your long-term career goals with AMW Career Point counsellors to align your country choice with your professional aspirations.</p>

<h2>Conclusion</h2>
<p>There is no single "best" country for everyone — the right choice depends on your budget, academic profile, lifestyle preferences, and career plans. Use this framework to narrow down your options, and then consult with AMW Career Point for personalized, expert guidance. We've helped thousands of students find their ideal university, and we can do the same for you.</p>

<h2>Frequently Asked Questions</h2>
<h3>Which country is cheapest for MBBS abroad?</h3>
<p>Kyrgyzstan and Uzbekistan offer the lowest total costs, with complete MBBS programs available under ₹20 lakhs.</p>
<h3>Which country has the best clinical training?</h3>
<p>Russia and Kazakhstan are known for strong clinical training with hospital rotations from early semesters.</p>
<h3>Should I prioritize fees or ranking?</h3>
<p>Focus on NMC recognition first, then balance fees and university quality based on your budget. A recognized degree is more important than a high ranking.</p>`,
  },
  {
    title: "MBBS Abroad Fee Comparison 2025: Country-by-Country Breakdown",
    slug: "mbbs-abroad-fee-comparison-2025",
    excerpt: "A detailed comparison of MBBS fees across Russia, Georgia, Kazakhstan, Kyrgyzstan, Uzbekistan, and the Philippines — updated for 2025.",
    categoryName: "MBBS Abroad",
    author: "AMW Career Point",
    tags: ["Fee Comparison", "MBBS Abroad", "Budget Planning", "Tuition Fees"],
    status: "published",
    featured: true,
    seo: {
      metaTitle: "MBBS Abroad Fee Comparison 2025 | AMW Career Point",
      metaDescription: "Compare MBBS abroad fees for 2025 — Russia, Georgia, Kazakhstan, Philippines & more. Complete cost breakdown by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>One of the first questions parents and students ask about MBBS abroad is: "How much will it cost?" This article provides a transparent, up-to-date comparison of MBBS fees across the six most popular destinations for Indian students in 2025. We break down tuition, hostel, living costs, and the total estimated budget for each country.</p>

<h2>Russia: Balanced Quality and Cost</h2>
<p>Russia offers a well-balanced equation of quality and affordability. Annual tuition ranges from ₹3 lakh to ₹6 lakh, depending on the university. Hostel fees are ₹40,000–80,000 per year. Monthly living costs average ₹8,000–15,000. The total estimated cost for the complete 6-year program, including all expenses, is approximately ₹25–40 lakhs. Universities like Bashkir State Medical University sit at the lower end, while Kazan Federal University is on the higher side due to its premium ranking.</p>

<h2>Georgia: European Education at Competitive Prices</h2>
<p>Georgian medical universities charge ₹3.5 lakh to ₹7 lakh per year in tuition. Hostel fees range from ₹55,000 to ₹90,000 annually. Monthly living expenses in Tbilisi are ₹10,000–18,000. The total estimated cost for 6 years is ₹25–45 lakhs. Georgia offers excellent value considering you receive a European-standard ECTS curriculum, which opens doors for practice across the EU as well.</p>

<h2>Kazakhstan, Kyrgyzstan, and Uzbekistan: Budget-Friendly Central Asia</h2>
<p>Central Asian countries offer the most affordable MBBS programs. Kazakhstan's fees are ₹3.5–6.5 lakh per year (total: ₹25–40 lakhs). Kyrgyzstan is cheaper at ₹2.5–4.5 lakh per year (total: ₹15–25 lakhs). Uzbekistan is similarly affordable at ₹2.5–5 lakh per year (total: ₹15–28 lakhs). All three countries have NMC-recognized universities and English-medium programs. For families with a limited budget, Kyrgyzstan and Uzbekistan offer the best value.</p>

<h2>Philippines: US-Pattern at a Premium</h2>
<p>The Philippines is the most expensive among these options, but it offers a US-pattern MD curriculum that prepares students for USMLE. Tuition ranges from ₹4 lakh to ₹8 lakh per year. Living costs are higher at ₹12,000–20,000 per month. The total cost for the 5.5-year BS-MD program is ₹35–55 lakhs. While pricier than Central Asian options, the Philippines offers significant English-language immersion and USMLE preparation — valuable if you're targeting a career in the US.</p>

<h2>How Do These Compare to India?</h2>
<p>For perspective, deemed/private medical colleges in India charge anywhere from ₹60 lakh to over ₹1 crore for the MBBS course, often with additional management or NRI quota fees. Government college seats — while far cheaper — are extremely competitive. MBBS abroad, at ₹15–55 lakhs for the entire program, offers quality NMC-recognized education at a fraction of Indian private college costs, without any donation demands.</p>

<h2>Conclusion</h2>
<p>Every family has a different budget, and the right country depends on your financial capacity and career goals. Whether you have ₹15 lakhs or ₹50 lakhs, there is a quality NMC-recognized MBBS program abroad for you. AMW Career Point provides transparent, honest fee breakdowns with no hidden costs. Contact us for a personalized budget plan based on your specific situation.</p>

<h2>Frequently Asked Questions</h2>
<h3>Are there hidden costs in MBBS abroad?</h3>
<p>Reputable consultancies like AMW Career Point provide a complete cost breakdown upfront. Common additional costs include visa fees, airfare, insurance, and personal expenses — all of which can be planned for.</p>
<h3>Can I get scholarships for MBBS abroad?</h3>
<p>Some universities in Kazakhstan and Russia offer merit scholarships. AMW Career Point can help you identify and apply for such opportunities.</p>
<h3>Is education loan available for MBBS abroad?</h3>
<p>Yes, several Indian banks and NBFCs offer education loans for MBBS abroad. We can connect you with our banking partners for loan assistance.</p>`,
  },
  {
    title: "Student Life Abroad: What to Expect as an MBBS Student",
    slug: "student-life-abroad-mbbs",
    excerpt: "Moving abroad for MBBS is a big step. Here's what daily life looks like for Indian medical students studying in Russia, Georgia, and beyond.",
    categoryName: "Student Life",
    author: "AMW Career Point",
    tags: ["Student Life", "MBBS Abroad", "Living Abroad", "Indian Students"],
    status: "published",
    featured: false,
    seo: {
      metaTitle: "Student Life Abroad for MBBS Students | AMW Career Point",
      metaDescription: "What daily life is like for Indian MBBS students abroad. Hostel, food, culture, and tips for adjusting. Guide by AMW Career Point.",
    },
    content: `<h2>Introduction</h2>
<p>Studying MBBS abroad is not just about academics — it's about living independently in a new country for 5 to 6 years. For many Indian students, this is their first time away from home, and naturally, there are a lot of questions about daily life, food, safety, and social activities. This article gives you an honest, detailed picture of what student life looks like in popular MBBS destinations.</p>

<h2>Accommodation: Hostels and Apartments</h2>
<p>Most universities offer on-campus hostel facilities for international students. Rooms are typically shared (2–4 students) and come furnished with beds, desks, wardrobes, and Wi-Fi. Hostels in Russia and Central Asian countries are basic but clean and functional. Georgian and Philippine universities tend to have more modern hostel infrastructure. Some senior students prefer renting private apartments — this offers more independence but costs slightly more. On-campus hostels are recommended for the first year for a smoother adjustment.</p>

<h2>Food: Indian Options Are Available</h2>
<p>One of the biggest concerns for Indian students is food. The good news is that Indian restaurants and grocery stores are found near most popular medical universities in Russia, Georgia, Kazakhstan, and the Philippines. Many hostels also allow self-cooking with shared kitchen facilities. Students often form groups and cook together, which is both cost-effective and comforting. University canteens serve local cuisine which is usually affordable and filling, and gradually, most students develop a taste for local dishes alongside their home food.</p>

<h2>Academic Schedule and Study Culture</h2>
<p>Medical studies abroad are rigorous. A typical day includes 4–6 hours of lectures and practicals, followed by self-study and library time. The academic year usually runs from September to June, with exams at the end of each semester. Clinical rotations begin from the 3rd or 4th year, involving hospital visits and patient interaction alongside senior doctors. Students who manage their time well — balancing study, rest, and recreation — perform best academically and enjoy the experience most.</p>

<h2>Social Life and Indian Community</h2>
<p>Every major university city has an active Indian student community. Students organize cultural events, celebrate Diwali, Holi, and other festivals, and maintain WhatsApp and social media groups for support. Beyond the Indian community, you will interact with classmates from around the world — making friendships across cultures is one of the most enriching aspects of studying abroad. Universities also organize sports events, cultural festivals, and educational trips throughout the year.</p>

<h2>Safety and Practical Tips</h2>
<p>Safety is a top concern for parents. The countries featured by AMW Career Point are all considered safe for students, though common-sense precautions apply everywhere. Stay in groups after dark, keep your documents safe, register with the Indian embassy, and maintain regular communication with family. Most universities have dedicated international student offices that assist with any issues — from medical emergencies to administrative queries.</p>

<h2>Conclusion</h2>
<p>Student life abroad is an enriching, sometimes challenging, but ultimately rewarding experience. With the right preparation and support system, Indian students thrive in their MBBS journey overseas. AMW Career Point provides pre-departure briefings, on-ground support, and stays connected with students and parents throughout the program to ensure a smooth experience.</p>

<h2>Frequently Asked Questions</h2>
<h3>Can I come home during vacations?</h3>
<p>Yes, most universities have a 2–3 month summer break (June–August) and a winter break (2–3 weeks). Students regularly fly home during vacations.</p>
<h3>Is the weather a problem?</h3>
<p>Russian and Central Asian winters can be harsh, but hostels and buildings are well-heated. Students adapt within the first year. The Philippines and Georgia have more moderate climates.</p>
<h3>Can my parents visit me?</h3>
<p>Yes, parents can apply for a tourist/visitor visa to the respective country. Many parents visit during the first or second year to see the campus and city.</p>`,
  },
];

// ═══════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";
  console.log(`\n🔌 Connecting to: ${uri}`);
  await mongoose.connect(uri);
  console.log(`✅ Connected to: ${mongoose.connection.name}\n`);

  // ── 1. Seed countries ──────────────────────────────────────────
  console.log("🌍 Seeding countries...");
  const countryMap = {}; // slug -> _id
  for (const c of countries) {
    const existing = await Country.findOne({ slug: c.slug });
    if (existing) {
      console.log(`   ⏭️  Country "${c.name}" already exists, skipping`);
      countryMap[c.slug] = existing._id;
    } else {
      const doc = await Country.create(c);
      countryMap[c.slug] = doc._id;
      console.log(`   ✅ Created country: ${c.name}`);
    }
  }

  // Update universityCount on each country
  for (const slug of Object.keys(countryMap)) {
    const count = await University.countDocuments({ country: countryMap[slug] });
    await Country.findByIdAndUpdate(countryMap[slug], { universityCount: count });
  }

  // ── 2. Seed universities ──────────────────────────────────────
  console.log("\n🏛️  Seeding universities...");
  for (const u of universities) {
    const existing = await University.findOne({ slug: u.slug });
    if (existing) {
      console.log(`   ⏭️  University "${u.name}" already exists, skipping`);
      continue;
    }
    const countryId = countryMap[u.countrySlug];
    if (!countryId) {
      console.log(`   ❌ Country slug "${u.countrySlug}" not found for university "${u.name}", skipping`);
      continue;
    }
    const { countrySlug, ...uData } = u;
    uData.country = countryId;
    await University.create(uData);
    console.log(`   ✅ Created university: ${u.name}`);
  }

  // Update universityCount after universities are seeded
  for (const slug of Object.keys(countryMap)) {
    const count = await University.countDocuments({ country: countryMap[slug] });
    await Country.findByIdAndUpdate(countryMap[slug], { universityCount: count });
  }

  // ── 3. Seed blog categories ───────────────────────────────────
  console.log("\n📂 Seeding blog categories...");
  const categoryMap = {}; // name -> _id
  for (const name of blogCategories) {
    let cat = await BlogCategory.findOne({ name });
    if (!cat) {
      cat = await BlogCategory.create({ name });
      console.log(`   ✅ Created category: ${name}`);
    } else {
      console.log(`   ⏭️  Category "${name}" already exists`);
    }
    categoryMap[name] = cat._id;
  }

  // ── 4. Seed blogs ─────────────────────────────────────────────
  console.log("\n📝 Seeding blogs...");
  for (const b of blogs) {
    const existing = await Blog.findOne({ slug: b.slug });
    if (existing) {
      console.log(`   ⏭️  Blog "${b.title}" already exists, skipping`);
      continue;
    }
    const { categoryName, ...bData } = b;
    bData.category = categoryMap[categoryName] || null;
    await Blog.create(bData);
    console.log(`   ✅ Created blog: ${b.title}`);
  }

  // ── Summary ────────────────────────────────────────────────────
  console.log("\n───────────────────────────────────────────────────");
  console.log("📊 Final record counts:");
  const counts = {
    Countries: await Country.countDocuments(),
    Universities: await University.countDocuments(),
    "Blog Categories": await BlogCategory.countDocuments(),
    Blogs: await Blog.countDocuments(),
  };
  for (const [label, count] of Object.entries(counts)) {
    console.log(`   ${label}: ${count}`);
  }
  console.log("───────────────────────────────────────────────────");

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. Seed complete.\n");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
