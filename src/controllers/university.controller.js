const slugify = require("slugify");
const University = require("../models/University");
const Country = require("../models/Country");

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true, trim: true });

const parseSort = (sort = "-createdAt") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

const COUNTRY_POPULATE = { path: "country", select: "_id name slug flagImage" };

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

// GET /universities
exports.list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      status,
      country,
      featured,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status === "all") {
      /* no filter */
    } else if (status === "inactive") filter.status = "inactive";
    else filter.status = "active";

    if (featured === "true") filter.featured = true;

    // Filter by country: supports ObjectId or slug
    if (country) {
      if (country.match(/^[0-9a-fA-F]{24}$/)) {
        filter.country = country;
      } else {
        const c = await Country.findOne({ slug: country }).lean();
        if (c) filter.country = c._id;
      }
    }

    const LIST_FIELDS =
      "_id name slug country description logo heroImage annualFees courseDuration medium featured status createdAt";

    const [data, total] = await Promise.all([
      University.find(filter)
        .select(LIST_FIELDS)
        .populate(COUNTRY_POPULATE)
        .sort(parseSort(sort))
        .skip(skip)
        .limit(limitNum)
        .lean(),
      University.countDocuments(filter),
    ]);

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

// GET /universities/:slug
exports.detail = async (req, res, next) => {
  try {
    const university = await University.findOne({ slug: req.params.slug })
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
    if (Array.isArray(body.gallery))
      body.gallery = body.gallery.filter((u) => u && u.trim());
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
    if (Array.isArray(updates.gallery))
      updates.gallery = updates.gallery.filter((u) => u && u.trim());
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
