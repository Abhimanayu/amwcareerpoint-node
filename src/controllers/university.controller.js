const slugify = require("slugify");
const University = require("../models/University");
const Country = require("../models/Country");

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true, trim: true });

const MAX_UNIVERSITY_LIST_LIMIT = 500;

const parsePositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
};

const normalizeCountrySlugInput = (input) => {
  const raw = String(input || "").trim().toLowerCase();
  return raw;
};

const parseSort = (sort = "sortOrder") => {
  const primary = sort.startsWith("-")
    ? { [sort.slice(1)]: -1 }
    : { [sort]: 1 };
  return { ...primary, createdAt: -1, _id: -1 };
};

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const COUNTRY_POPULATE = { path: "country", select: "_id name slug flagImage" };

const buildListStatusFilter = (status, allowStatusOverride = false) => {
  if (!allowStatusOverride) return { status: "active" };
  if (status === "all") return {};
  if (status === "inactive") return { status: "inactive" };
  return { status: "active" };
};

/**
 * Trim all image URL fields to prevent hidden newline characters (\r\n)
 * that cause 404s when Express tries to serve the static file.
 */
const trimImageFields = (obj) => {
  const URL_FIELDS = ["logo", "heroImage", "bannerImage", "cardImage"];
  for (const field of URL_FIELDS) {
    if (obj[field] && typeof obj[field] === "string") {
      obj[field] = obj[field].trim();
    }
  }
  // gallery is an array of URL strings
  if (Array.isArray(obj.gallery)) {
    obj.gallery = obj.gallery
      .map((u) => (typeof u === "string" ? u.trim() : u))
      .filter((u) => u);
  }
};

const sanitizeGallery = (gallery) => {
  if (!Array.isArray(gallery)) return { ok: true, value: [] };
  const cleaned = gallery
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);
  if (cleaned.length > 4) {
    return { ok: false, error: "gallery can have at most 4 images" };
  }
  return { ok: true, value: cleaned };
};

const resolveCountryIdFromInput = async (countryInput) => {
  const raw = String(countryInput || "").trim();
  if (!raw) return null;

  if (/^[0-9a-fA-F]{24}$/.test(raw)) {
    return raw;
  }

  const normalized = normalizeCountrySlugInput(raw);
  const slugCandidates = new Set([normalized]);

  // Support exact prefixed slug and plain slug formats.
  if (normalized.startsWith("mbbs-in-")) {
    slugCandidates.add(normalized.slice("mbbs-in-".length));
  } else {
    slugCandidates.add(`mbbs-in-${normalized}`);
  }

  const countryDoc = await Country.findOne({
    $or: [
      { slug: { $in: Array.from(slugCandidates).filter(Boolean) } },
      { name: new RegExp(`^${escapeRegex(raw)}$`, "i") },
    ],
  })
    .select("_id")
    .lean();

  return countryDoc ? countryDoc._id : null;
};

const compareBySortObject = (a, b, sortObj) => {
  for (const [field, dir] of Object.entries(sortObj)) {
    const av = a?.[field];
    const bv = b?.[field];
    if (av === bv) continue;
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    if (av > bv) return dir > 0 ? 1 : -1;
    if (av < bv) return dir > 0 ? -1 : 1;
  }
  return 0;
};

const computeSearchScore = (university, searchTerm) => {
  const needle = searchTerm.toLowerCase();
  const name = (university?.name || "").toLowerCase();
  const slug = (university?.slug || "").toLowerCase();
  const description = (university?.description || "").toLowerCase();
  const countryName = (university?.country?.name || "").toLowerCase();

  let score = 0;
  if (name === needle) score += 100;
  if (slug === needle) score += 95;
  if (name.startsWith(needle)) score += 80;
  if (slug.startsWith(needle)) score += 75;
  if (countryName.includes(needle)) score += 60;
  if (name.includes(needle)) score += 50;
  if (slug.includes(needle)) score += 45;
  if (description.includes(needle)) score += 30;
  return score;
};

const listImpl = async (req, res, next, allowStatusOverride = false) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "sortOrder",
      status,
      country,
      featured,
      search,
    } = req.query;

    const pageNum = parsePositiveInt(page, 1);
    const limitNum = Math.min(
      MAX_UNIVERSITY_LIST_LIMIT,
      parsePositiveInt(limit, 10)
    );
    const skip = (pageNum - 1) * limitNum;

    const filter = buildListStatusFilter(status, allowStatusOverride);

    if (featured === "true") filter.featured = true;

    // Filter by country: supports ObjectId, slug (prefixed/non-prefixed), or exact country name.
    if (country) {
      const resolvedCountryId = await resolveCountryIdFromInput(country);
      if (resolvedCountryId) {
        filter.country = resolvedCountryId;
      } else {
        // Preserve filter intent: unresolved country should return zero results, not all universities.
        filter._id = null;
      }
    }

    const searchTerm = typeof search === "string" ? search.trim() : "";
    if (searchTerm) {
      const searchRegex = new RegExp(escapeRegex(searchTerm), "i");
      const matchingCountries = await Country.find({ name: searchRegex })
        .select("_id")
        .lean();
      const countryIds = matchingCountries.map((c) => c._id);

      const searchOr = [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
      ];

      if (countryIds.length > 0) {
        searchOr.push({ country: { $in: countryIds } });
      }

      filter.$or = searchOr;
    }

    const PUBLIC_LIST_FIELDS =
      "_id name slug country logo heroImage annualFees courseDuration hostelFees medium featured status sortOrder createdAt updatedAt";
    const ADMIN_LIST_FIELDS =
      "_id name slug country description logo heroImage annualFees courseDuration hostelFees medium featured status sortOrder createdAt updatedAt";
    const LIST_FIELDS = allowStatusOverride ? ADMIN_LIST_FIELDS : PUBLIC_LIST_FIELDS;

    let data = [];
    let total = 0;
    const sortObj = parseSort(sort);

    if (searchTerm) {
      const allMatched = await University.find(filter)
        .select(LIST_FIELDS)
        .populate(COUNTRY_POPULATE)
        .lean();

      allMatched.forEach((item) => {
        item.__searchScore = computeSearchScore(item, searchTerm);
      });

      allMatched.sort((a, b) => {
        if (b.__searchScore !== a.__searchScore) {
          return b.__searchScore - a.__searchScore;
        }
        return compareBySortObject(a, b, sortObj);
      });

      total = allMatched.length;
      data = allMatched.slice(skip, skip + limitNum);
    } else {
      [data, total] = await Promise.all([
        University.find(filter)
          .select(LIST_FIELDS)
          .populate(COUNTRY_POPULATE)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        University.countDocuments(filter),
      ]);
    }

    // Trim all image URLs to prevent newline characters
    data.forEach((university) => {
      trimImageFields(university);
      // Also trim country flag image if populated
      if (university.country && university.country.flagImage) {
        university.country.flagImage = university.country.flagImage.trim();
      }
    });

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// GET /universities
exports.list = async (req, res, next) => listImpl(req, res, next, false);

// GET /universities/admin/list
exports.listAdmin = async (req, res, next) => listImpl(req, res, next, true);

// GET /universities/:slug
exports.detail = async (req, res, next) => {
  try {
    const university = await University.findOne({
      slug: req.params.slug,
      status: "active",
    })
      .populate(COUNTRY_POPULATE)
      .lean();

    if (!university) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "University not found" },
      });
    }

    // Trim all image URLs to prevent newline characters
    trimImageFields(university);
    // Also trim country flag image if populated
    if (university.country && university.country.flagImage) {
      university.country.flagImage = university.country.flagImage.trim();
    }

    res.json({ data: university });
  } catch (err) {
    next(err);
  }
};

// GET /universities/admin/:id — admin fetch by MongoDB _id
exports.detailById = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id)
      .populate(COUNTRY_POPULATE)
      .lean();

    if (!university) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "University not found" },
      });
    }

    trimImageFields(university);
    if (university.country && university.country.flagImage) {
      university.country.flagImage = university.country.flagImage.trim();
    }

    res.json({ data: university });
  } catch (err) {
    next(err);
  }
};

// POST /universities
exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };

    if (!body.name || !body.name.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "name", message: "Name is required" }],
        },
      });
    }

    if (!body.country) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "country", message: "Country is required" }],
        },
      });
    }

    const countryDoc = await Country.findById(body.country);
    if (!countryDoc) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "country", message: "Country not found" }],
        },
      });
    }

    const slug = body.slug
      ? slugify(body.slug, { lower: true, strict: true, trim: true })
      : makeSlug(body.name);

    const exists = await University.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "A university with this name already exists",
        },
      });
    }

    // Filter empty strings from array fields
    const galleryResult = sanitizeGallery(body.gallery);
    if (!galleryResult.ok) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "gallery", message: galleryResult.error }],
        },
      });
    }
    body.gallery = galleryResult.value;
    if (Array.isArray(body.recognition))
      body.recognition = body.recognition.filter((r) => r && r.trim());
    if (Array.isArray(body.highlights))
      body.highlights = body.highlights.filter((h) => h && h.label);
    if (Array.isArray(body.faqs))
      body.faqs = body.faqs.filter((f) => f && f.question);

    // Trim all image URL fields to remove hidden newline characters
    trimImageFields(body);

    const university = await University.create({ ...body, slug });
    const populated = await University.findById(university._id)
      .populate(COUNTRY_POPULATE)
      .lean();

    res.status(201).json({ data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /universities/:id
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.country) {
      const countryDoc = await Country.findById(updates.country);
      if (!countryDoc) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "country", message: "Country not found" }],
          },
        });
      }
    }

    if (updates.name || updates.slug) {
      updates.slug = updates.slug
        ? slugify(updates.slug, { lower: true, strict: true, trim: true })
        : makeSlug(updates.name);

      const exists = await University.findOne({
        slug: updates.slug,
        _id: { $ne: id },
      });
      if (exists) {
        return res.status(409).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "A university with this slug already exists",
          },
        });
      }
    }

    // Filter empty strings from array fields
    if (Array.isArray(updates.gallery)) {
      const galleryResult = sanitizeGallery(updates.gallery);
      if (!galleryResult.ok) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "gallery", message: galleryResult.error }],
          },
        });
      }
      updates.gallery = galleryResult.value;
    }
    if (Array.isArray(updates.recognition))
      updates.recognition = updates.recognition.filter((r) => r && r.trim());
    if (Array.isArray(updates.highlights))
      updates.highlights = updates.highlights.filter((h) => h && h.label);
    if (Array.isArray(updates.faqs))
      updates.faqs = updates.faqs.filter((f) => f && f.question);

    // Trim all image URL fields to remove hidden newline characters
    trimImageFields(updates);

    const university = await University.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: "after", runValidators: false },
    ).populate(COUNTRY_POPULATE);

    if (!university) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "University not found" },
      });
    }

    res.json({ data: university.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /universities/:id
exports.remove = async (req, res, next) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "University not found" },
      });
    }
    res.json({ data: { message: "University deleted successfully" } });
  } catch (err) {
    next(err);
  }
};
