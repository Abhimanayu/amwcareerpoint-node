const mongoose = require("mongoose");
const HomeSettings = require("../models/HomeSettings");
const Country = require("../models/Country");
const University = require("../models/University");
const { Blog } = require("../models/Blog");

const DEFAULT_HOME_SETTINGS = {
  seo: {
    metaTitle: "Study MBBS Abroad for Indian Students",
    metaDescription:
      "AMW Career Point helps Indian students study MBBS abroad in Russia, Kazakhstan, Georgia, Kyrgyzstan, and Europe at affordable fees with complete admission support.",
    keywords: "",
    canonicalUrl: "https://amwcareerpoint.com/",
    schemaMarkup: "",
  },
  hero: {
    badge: "India's #1 Trusted Medical Consultancy",
    heading: "Dream of Becoming a Doctor?",
    highlightedText: "MBBS Abroad",
    trailingText: "Might Be Your Smartest Move.",
    description:
      "India has one MBBS seat for every ten NEET-qualified students. Studying MBBS abroad at universities that follow the NMC FMGL Gazette 2021 provides students with a proven path to their dream of becoming a doctor, and we have helped 18,500+ students make that dream a reality since 2009.",
    primaryCtaText: "Use College Predictor",
    primaryCtaHref: "#predictor",
    secondaryCtaText: "Meet Our Experts",
    secondaryCtaHref: "#experts",
  },
  stats: [
    { number: "18,500+", label: "Students Guided", desc: "Across India & abroad" },
    { number: "18+", label: "Years of Trust", desc: "Experienced counselling team" },
    { number: "5/5", label: "Student Rating", desc: "Consistent parent confidence" },
    { number: "45+", label: "Top Destinations", desc: "India plus global options" },
  ],
  sections: {
    hero: true,
    stats: true,
    whyChoose: true,
    experts: true,
    universities: true,
    countries: true,
    comparison: true,
    process: true,
    predictor: true,
    reviews: true,
    videos: true,
    blogs: true,
    cta: true,
    faq: true,
  },
};

const FIELD_LIMITS = {
  seo: {
    metaTitle: 70,
    metaDescription: 160,
    keywords: 250,
    canonicalUrl: 300,
  },
  hero: {
    badge: 100,
    heading: 140,
    highlightedText: 80,
    trailingText: 140,
    description: 800,
    primaryCtaText: 60,
    primaryCtaHref: 240,
    secondaryCtaText: 60,
    secondaryCtaHref: 240,
  },
  stat: {
    number: 24,
    label: 80,
    desc: 140,
  },
};

function validationError(message, field) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message,
      details: field ? [{ field, message }] : undefined,
    },
  };
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function limitString(value, max, field) {
  const cleaned = cleanString(value);
  if (cleaned.length > max) {
    return { ok: false, error: `${field} must not exceed ${max} characters` };
  }
  return { ok: true, value: cleaned };
}

function sanitizeSeo(seo = {}) {
  const output = {};

  for (const [field, max] of Object.entries(FIELD_LIMITS.seo)) {
    const result = limitString(seo[field], max, `seo.${field}`);
    if (!result.ok) return result;
    output[field] = result.value;
  }

  const schemaMarkup = cleanString(seo.schemaMarkup);
  if (schemaMarkup) {
    try {
      JSON.parse(schemaMarkup);
    } catch {
      return { ok: false, error: "seo.schemaMarkup must be valid JSON-LD" };
    }
  }
  output.schemaMarkup = schemaMarkup;

  return { ok: true, value: output };
}

function sanitizeHero(hero = {}) {
  const output = {};

  for (const [field, max] of Object.entries(FIELD_LIMITS.hero)) {
    const result = limitString(hero[field], max, `hero.${field}`);
    if (!result.ok) return result;
    output[field] = result.value;
  }

  return { ok: true, value: output };
}

function sanitizeStats(stats) {
  if (!Array.isArray(stats)) {
    return { ok: true, value: DEFAULT_HOME_SETTINGS.stats };
  }

  if (stats.length > 4) {
    return { ok: false, error: "stats can have at most 4 items" };
  }

  const value = stats
    .map((item) => ({
      number: cleanString(item?.number),
      label: cleanString(item?.label),
      desc: cleanString(item?.desc),
    }))
    .filter((item) => item.number || item.label || item.desc);

  for (let i = 0; i < value.length; i += 1) {
    const item = value[i];
    if (!item.number) return { ok: false, error: `stats[${i}].number is required` };
    if (!item.label) return { ok: false, error: `stats[${i}].label is required` };
    for (const [field, max] of Object.entries(FIELD_LIMITS.stat)) {
      if (item[field].length > max) {
        return { ok: false, error: `stats[${i}].${field} must not exceed ${max} characters` };
      }
    }
  }

  return { ok: true, value };
}

function sanitizeSections(sections = {}) {
  const output = {};
  for (const key of Object.keys(DEFAULT_HOME_SETTINGS.sections)) {
    output[key] = typeof sections[key] === "boolean" ? sections[key] : DEFAULT_HOME_SETTINGS.sections[key];
  }
  return { ok: true, value: output };
}

// ── Phase 2: slim field projections ─────────────────────────────────────────
const COUNTRY_HOME_SELECT = "_id name slug flagImage flagImageAlt cardImage cardImageAlt heroImage heroImageAlt feeRange duration";
const UNIVERSITY_HOME_SELECT = "_id name slug logo logoAlt heroImage heroImageAlt gallery galleryAlt annualFees courseDuration";
const BLOG_HOME_SELECT = "_id title slug excerpt coverImage coverImageAlt author createdAt";

// Resolve ordered home countries. publicMode = filter status:active.
async function resolveHomeCountries(storedIds, publicMode) {
  if (Array.isArray(storedIds) && storedIds.length > 0) {
    const filter = publicMode
      ? { _id: { $in: storedIds }, status: "active" }
      : { _id: { $in: storedIds } };
    const rows = await Country.find(filter).select(COUNTRY_HOME_SELECT).lean();
    const map = new Map(rows.map((r) => [r._id.toString(), r]));
    return storedIds.map((id) => map.get(id.toString())).filter(Boolean);
  }
  return Country.find({ status: "active", isFeatured: true })
    .sort({ sortOrder: -1, createdAt: -1 })
    .limit(8)
    .select(COUNTRY_HOME_SELECT)
    .lean();
}

// Resolve ordered home universities.
async function resolveHomeUniversities(storedIds, publicMode) {
  const COUNTRY_POP = { path: "country", select: "_id name slug flagImage flagImageAlt" };
  if (Array.isArray(storedIds) && storedIds.length > 0) {
    const filter = publicMode
      ? { _id: { $in: storedIds }, status: "active" }
      : { _id: { $in: storedIds } };
    const rows = await University.find(filter)
      .select(UNIVERSITY_HOME_SELECT)
      .populate(COUNTRY_POP)
      .lean();
    const map = new Map(rows.map((r) => [r._id.toString(), r]));
    return storedIds.map((id) => map.get(id.toString())).filter(Boolean);
  }
  return University.find({ status: "active", featured: true })
    .limit(8)
    .select(UNIVERSITY_HOME_SELECT)
    .populate(COUNTRY_POP)
    .lean();
}

// Resolve ordered home blogs.
async function resolveHomeBlogs(storedIds, publicMode) {
  const CATEGORY_POP = { path: "category", select: "_id name" };
  if (Array.isArray(storedIds) && storedIds.length > 0) {
    const filter = publicMode
      ? { _id: { $in: storedIds }, status: "published" }
      : { _id: { $in: storedIds } };
    const rows = await Blog.find(filter)
      .select(BLOG_HOME_SELECT)
      .populate(CATEGORY_POP)
      .lean();
    const map = new Map(rows.map((r) => [r._id.toString(), r]));
    return storedIds.map((id) => map.get(id.toString())).filter(Boolean);
  }
  return Blog.find({ status: "published", featured: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .select(BLOG_HOME_SELECT)
    .populate(CATEGORY_POP)
    .lean();
}

// Validate an array of IDs against a Mongoose model.
async function validateHomeItemIds(ids, Model, maxCount, fieldName) {
  if (!Array.isArray(ids)) return { ok: true, value: [] };
  if (ids.length > maxCount) {
    return { ok: false, error: `${fieldName} can have at most ${maxCount} items` };
  }
  for (let i = 0; i < ids.length; i += 1) {
    if (!mongoose.Types.ObjectId.isValid(ids[i])) {
      return { ok: false, error: `${fieldName}[${i}] is not a valid ID` };
    }
  }
  const uniqueSet = new Set(ids.map((id) => id.toString()));
  if (uniqueSet.size !== ids.length) {
    return { ok: false, error: `${fieldName} must not contain duplicate IDs` };
  }
  const found = await Model.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    return { ok: false, error: `Some ${fieldName} IDs do not exist` };
  }
  return { ok: true, value: ids };
}

function mergeWithDefaults(settings) {
  const source = settings || {};
  return {
    ...DEFAULT_HOME_SETTINGS,
    ...source,
    seo: { ...DEFAULT_HOME_SETTINGS.seo, ...(source.seo || {}) },
    hero: { ...DEFAULT_HOME_SETTINGS.hero, ...(source.hero || {}) },
    stats: Array.isArray(source.stats) && source.stats.length > 0 ? source.stats : DEFAULT_HOME_SETTINGS.stats,
    sections: { ...DEFAULT_HOME_SETTINGS.sections, ...(source.sections || {}) },
  };
}

exports.getPublic = async (req, res, next) => {
  try {
    const settings = await HomeSettings.findOne({ key: "home" }).lean();
    const base = mergeWithDefaults(settings);
    const [homeCountries, homeUniversities, homeBlogs] = await Promise.all([
      resolveHomeCountries(settings?.homeCountries, true),
      resolveHomeUniversities(settings?.homeUniversities, true),
      resolveHomeBlogs(settings?.homeBlogs, true),
    ]);
    res.json({ data: { ...base, homeCountries, homeUniversities, homeBlogs } });
  } catch (err) {
    next(err);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const settings = await HomeSettings.findOne({ key: "home" }).lean();
    const base = mergeWithDefaults(settings);
    const [homeCountries, homeUniversities, homeBlogs] = await Promise.all([
      resolveHomeCountries(settings?.homeCountries, false),
      resolveHomeUniversities(settings?.homeUniversities, false),
      resolveHomeBlogs(settings?.homeBlogs, false),
    ]);
    res.json({ data: { ...base, homeCountries, homeUniversities, homeBlogs } });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const seo = sanitizeSeo(req.body?.seo || {});
    if (!seo.ok) return res.status(400).json(validationError(seo.error));

    const hero = sanitizeHero(req.body?.hero || {});
    if (!hero.ok) return res.status(400).json(validationError(hero.error));

    const stats = sanitizeStats(req.body?.stats);
    if (!stats.ok) return res.status(400).json(validationError(stats.error));

    const sections = sanitizeSections(req.body?.sections || {});

    const updated = await HomeSettings.findOneAndUpdate(
      { key: "home" },
      {
        $set: {
          seo: seo.value,
          hero: hero.value,
          stats: stats.value,
          sections: sections.value,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();

    res.json({ data: mergeWithDefaults(updated) });
  } catch (err) {
    next(err);
  }
};

// PUT /home-items — admin-only curated homepage item control
exports.updateHomeItems = async (req, res, next) => {
  try {
    const { homeCountries, homeUniversities, homeBlogs } = req.body;

    const [countryRes, universityRes, blogRes] = await Promise.all([
      validateHomeItemIds(homeCountries, Country, 8, "homeCountries"),
      validateHomeItemIds(homeUniversities, University, 8, "homeUniversities"),
      validateHomeItemIds(homeBlogs, Blog, 6, "homeBlogs"),
    ]);

    if (!countryRes.ok) return res.status(400).json(validationError(countryRes.error));
    if (!universityRes.ok) return res.status(400).json(validationError(universityRes.error));
    if (!blogRes.ok) return res.status(400).json(validationError(blogRes.error));

    const updated = await HomeSettings.findOneAndUpdate(
      { key: "home" },
      {
        $set: {
          homeCountries: countryRes.value,
          homeUniversities: universityRes.value,
          homeBlogs: blogRes.value,
        },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();

    res.json({
      data: {
        homeCountries: updated.homeCountries || [],
        homeUniversities: updated.homeUniversities || [],
        homeBlogs: updated.homeBlogs || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.DEFAULT_HOME_SETTINGS = DEFAULT_HOME_SETTINGS;
