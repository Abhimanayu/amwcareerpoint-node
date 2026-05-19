const AboutSettings = require("../models/AboutSettings");

const DEFAULT_ABOUT_SETTINGS = {
  seo: {
    metaTitle: "About AMW Career Point",
    metaDescription: "Know AMW Career Point's mission, values, team, and achievements in MBBS abroad counselling.",
    keywords: "",
    canonicalUrl: "https://amwcareerpoint.com/about",
    schemaMarkup: "",
  },
  hero: {
    badge: "About Us",
    heading: "Guiding Medical Aspirants Since 2009",
    subheading: "Trusted MBBS abroad counselling for students and parents.",
    description: "",
    image: "",
    primaryCtaText: "Contact Us",
    primaryCtaHref: "/contact",
    secondaryCtaText: "Explore Universities",
    secondaryCtaHref: "/universities",
  },
  story: {
    heading: "Our Story",
    description: "",
    image: "",
  },
  achievements: [],
  values: [],
  team: {
    heading: "Our Team",
    description: "",
    members: [],
  },
  mission: {
    heading: "Our Mission",
    description: "",
  },
  sections: {
    hero: true,
    story: true,
    achievements: true,
    values: true,
    team: true,
    mission: true,
  },
};

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function mergeWithDefaults(settings) {
  const src = settings || {};
  return {
    ...DEFAULT_ABOUT_SETTINGS,
    ...src,
    seo: { ...DEFAULT_ABOUT_SETTINGS.seo, ...(src.seo || {}) },
    hero: { ...DEFAULT_ABOUT_SETTINGS.hero, ...(src.hero || {}) },
    story: { ...DEFAULT_ABOUT_SETTINGS.story, ...(src.story || {}) },
    team: {
      ...DEFAULT_ABOUT_SETTINGS.team,
      ...(src.team || {}),
      members: Array.isArray(src?.team?.members) ? src.team.members : [],
    },
    mission: { ...DEFAULT_ABOUT_SETTINGS.mission, ...(src.mission || {}) },
    sections: { ...DEFAULT_ABOUT_SETTINGS.sections, ...(src.sections || {}) },
    achievements: Array.isArray(src.achievements) ? src.achievements : [],
    values: Array.isArray(src.values) ? src.values : [],
  };
}

function sanitizeAchievements(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      value: cleanString(item?.value),
      label: cleanString(item?.label),
      icon: cleanString(item?.icon),
    }))
    .filter((item) => item.value && item.label)
    .slice(0, 12);
}

function sanitizeValues(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      title: cleanString(item?.title),
      description: cleanString(item?.description),
      icon: cleanString(item?.icon),
    }))
    .filter((item) => item.title)
    .slice(0, 12);
}

function sanitizeTeamMembers(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      name: cleanString(item?.name),
      role: cleanString(item?.role),
      bio: cleanString(item?.bio),
      image: cleanString(item?.image),
    }))
    .filter((item) => item.name)
    .slice(0, 20);
}

function sanitizeSections(sections = {}) {
  const out = {};
  for (const key of Object.keys(DEFAULT_ABOUT_SETTINGS.sections)) {
    out[key] = typeof sections[key] === "boolean"
      ? sections[key]
      : DEFAULT_ABOUT_SETTINGS.sections[key];
  }
  return out;
}

function sanitizePayload(body = {}) {
  return {
    seo: {
      metaTitle: cleanString(body?.seo?.metaTitle),
      metaDescription: cleanString(body?.seo?.metaDescription),
      keywords: cleanString(body?.seo?.keywords),
      canonicalUrl: cleanString(body?.seo?.canonicalUrl),
      schemaMarkup: cleanString(body?.seo?.schemaMarkup),
    },
    hero: {
      badge: cleanString(body?.hero?.badge),
      heading: cleanString(body?.hero?.heading),
      subheading: cleanString(body?.hero?.subheading),
      description: cleanString(body?.hero?.description),
      image: cleanString(body?.hero?.image),
      primaryCtaText: cleanString(body?.hero?.primaryCtaText),
      primaryCtaHref: cleanString(body?.hero?.primaryCtaHref),
      secondaryCtaText: cleanString(body?.hero?.secondaryCtaText),
      secondaryCtaHref: cleanString(body?.hero?.secondaryCtaHref),
    },
    story: {
      heading: cleanString(body?.story?.heading),
      description: cleanString(body?.story?.description),
      image: cleanString(body?.story?.image),
    },
    achievements: sanitizeAchievements(body?.achievements),
    values: sanitizeValues(body?.values),
    team: {
      heading: cleanString(body?.team?.heading),
      description: cleanString(body?.team?.description),
      members: sanitizeTeamMembers(body?.team?.members),
    },
    mission: {
      heading: cleanString(body?.mission?.heading),
      description: cleanString(body?.mission?.description),
    },
    sections: sanitizeSections(body?.sections || {}),
  };
}

exports.getPublic = async (req, res, next) => {
  try {
    const settings = await AboutSettings.findOne({ key: "about" }).lean();
    res.json({ data: mergeWithDefaults(settings) });
  } catch (err) {
    next(err);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const settings = await AboutSettings.findOne({ key: "about" }).lean();
    res.json({ data: mergeWithDefaults(settings) });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const payload = sanitizePayload(req.body || {});
    const updated = await AboutSettings.findOneAndUpdate(
      { key: "about" },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    ).lean();

    res.json({ data: mergeWithDefaults(updated) });
  } catch (err) {
    next(err);
  }
};
