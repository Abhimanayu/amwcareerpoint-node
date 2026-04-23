const slugify = require("slugify");
const Country  = require("../models/Country");

const makeSlug = (name) => slugify(name, { lower: true, strict: true, trim: true });

// Parse sort param: "-sortOrder" → {sortOrder:-1}, "name" → {name:1}
const parseSort = (sort = "-sortOrder") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

/**
 * Trim image URL fields to strip hidden \r\n characters that cause 404s.
 */
const trimImageFields = (obj) => {
  const URL_FIELDS = ["flagImage", "heroImage", "bannerImage", "cardImage"];
  for (const field of URL_FIELDS) {
    if (obj[field] && typeof obj[field] === "string") {
      obj[field] = obj[field].trim();
    }
  }
};

/**
 * Validate and sanitize a supportExperience payload.
 * Returns { ok, error } — if ok is false, error contains a 400-ready message.
 */
const sanitizeSupportExperience = (se) => {
  if (!se || typeof se !== "object") return { ok: true, value: se };

  const value = { ...se };

  // eyebrow / title / description — just length guards (schema enforces too)
  if (value.eyebrow     && value.eyebrow.length     > 80)  return { ok: false, error: "supportExperience.eyebrow must be ≤ 80 characters" };
  if (value.title       && value.title.length       > 180) return { ok: false, error: "supportExperience.title must be ≤ 180 characters" };
  if (value.description && value.description.length > 800) return { ok: false, error: "supportExperience.description must be ≤ 800 characters" };

  // progressItems
  if (value.progressItems !== undefined) {
    if (!Array.isArray(value.progressItems)) return { ok: false, error: "supportExperience.progressItems must be an array" };
    if (value.progressItems.length > 6)      return { ok: false, error: "supportExperience.progressItems can have at most 6 items" };

    for (let i = 0; i < value.progressItems.length; i++) {
      const item = value.progressItems[i];
      if (!item || typeof item !== "object") return { ok: false, error: `progressItems[${i}] must be an object` };
      if (!item.label || !String(item.label).trim()) return { ok: false, error: `progressItems[${i}].label is required` };
      const val = Number(item.value);
      if (isNaN(val) || val < 0 || val > 100) return { ok: false, error: `progressItems[${i}].value must be a number between 0 and 100` };
    }
    // clean: drop empty items
    value.progressItems = value.progressItems
      .filter((p) => p && typeof p === "object" && p.label)
      .map((p) => ({ label: String(p.label).trim(), value: Number(p.value), status: p.status ? String(p.status).trim() : "Included" }));
  }

  // supportCards
  if (value.supportCards !== undefined) {
    if (!Array.isArray(value.supportCards)) return { ok: false, error: "supportExperience.supportCards must be an array" };
    if (value.supportCards.length > 4)      return { ok: false, error: "supportExperience.supportCards can have at most 4 items" };

    for (let i = 0; i < value.supportCards.length; i++) {
      const card = value.supportCards[i];
      if (!card || typeof card !== "object") return { ok: false, error: `supportCards[${i}] must be an object` };
      if (!card.title || !String(card.title).trim()) return { ok: false, error: `supportCards[${i}].title is required` };
    }
    // clean
    value.supportCards = value.supportCards
      .filter((c) => c && typeof c === "object" && c.title)
      .map((c) => ({ title: String(c.title).trim(), subtitle: c.subtitle ? String(c.subtitle).trim() : "" }));
  }

  return { ok: true, value };
};

/**
 * Validate and sanitize a studentLife payload.
 */
const sanitizeStudentLife = (sl) => {
  if (!sl || typeof sl !== "object") return { ok: true, value: sl };

  const value = { ...sl };

  if (value.eyebrow     && value.eyebrow.length     > 80)   return { ok: false, error: "studentLife.eyebrow must be ≤ 80 characters" };
  if (value.title       && value.title.length       > 180)  return { ok: false, error: "studentLife.title must be ≤ 180 characters" };
  if (value.description && value.description.length > 1000) return { ok: false, error: "studentLife.description must be ≤ 1000 characters" };

  if (value.cards !== undefined) {
    if (!Array.isArray(value.cards)) return { ok: false, error: "studentLife.cards must be an array" };
    if (value.cards.length > 6)      return { ok: false, error: "studentLife.cards can have at most 6 items" };

    for (let i = 0; i < value.cards.length; i++) {
      const card = value.cards[i];
      if (!card || typeof card !== "object") return { ok: false, error: `studentLife.cards[${i}] must be an object` };
      if (!card.title || !String(card.title).trim()) return { ok: false, error: `studentLife.cards[${i}].title is required` };
    }
    
    value.cards = value.cards
      .filter((c) => c && typeof c === "object" && c.title)
      .map((c) => ({ 
         icon: c.icon ? String(c.icon).trim() : null,
         title: String(c.title).trim(), 
         description: c.description ? String(c.description).trim() : "" 
      }));
  }

  return { ok: true, value };
};

/**
 * Validate and sanitize a documentsChecklist payload.
 */
const sanitizeDocumentsChecklist = (dc) => {
  if (!dc || typeof dc !== "object") return { ok: true, value: dc };

  const value = { ...dc };

  if (value.eyebrow && value.eyebrow.length > 80)  return { ok: false, error: "documentsChecklist.eyebrow must be ≤ 80 characters" };
  if (value.title   && value.title.length   > 180) return { ok: false, error: "documentsChecklist.title must be ≤ 180 characters" };

  if (value.items !== undefined) {
    if (!Array.isArray(value.items)) return { ok: false, error: "documentsChecklist.items must be an array" };
    if (value.items.length > 12)     return { ok: false, error: "documentsChecklist.items can have at most 12 items" };

    for (let i = 0; i < value.items.length; i++) {
      const item = value.items[i];
      if (!item || typeof item !== "object") return { ok: false, error: `documentsChecklist.items[${i}] must be an object` };
      if (!item.label || !String(item.label).trim()) return { ok: false, error: `documentsChecklist.items[${i}].label is required` };
    }
    
    value.items = value.items
      .filter((item) => item && typeof item === "object" && item.label)
      .map((item) => ({ label: String(item.label).trim() }));
  }

  return { ok: true, value };
};

// GET /countries
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-sortOrder", status } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status === "all")          { /* no filter */ }
    else if (status === "inactive") filter.status = "inactive";
    else                            filter.status = "active";

    const LIST_FIELDS = '_id name slug tagline description flagImage heroImage cardImage feeRange duration livingCost currency universityCount sortOrder status isFeatured';

    const [data, total] = await Promise.all([
      Country.find(filter).select(LIST_FIELDS).sort(parseSort(sort)).skip(skip).limit(limitNum).lean(),
      Country.countDocuments(filter),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// GET /countries/:slug
exports.detail = async (req, res, next) => {
  try {
    const country = await Country.findOne({ slug: req.params.slug }).lean();
    if (!country) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Country not found" },
      });
    }
    res.json({ data: country });
  } catch (err) {
    next(err);
  }
};

// POST /countries
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

    const slug = body.slug
      ? slugify(body.slug, { lower: true, strict: true, trim: true })
      : makeSlug(body.name);

    const exists = await Country.findOne({ $or: [{ slug }, { name: body.name }] });
    if (exists) {
      return res.status(409).json({
        error: { code: "VALIDATION_ERROR", message: "A country with this name or slug already exists" },
      });
    }

    // Filter empty strings from array fields
    if (Array.isArray(body.highlights))       body.highlights       = body.highlights.filter(h => h && h.trim());
    if (Array.isArray(body.eligibility))       body.eligibility       = body.eligibility.filter(e => e && e.trim());
    if (Array.isArray(body.features))          body.features          = body.features.filter(f => f && f.title);
    if (Array.isArray(body.admissionProcess))  body.admissionProcess  = body.admissionProcess.filter(s => s && s.title);

    // Validate & sanitize supportExperience
    if (body.supportExperience !== undefined) {
      const result = sanitizeSupportExperience(body.supportExperience);
      if (!result.ok) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: result.error },
        });
      }
      body.supportExperience = result.value;
    }

    // Validate & sanitize studentLife
    if (body.studentLife !== undefined) {
      const result = sanitizeStudentLife(body.studentLife);
      if (!result.ok) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: result.error },
        });
      }
      body.studentLife = result.value;
    }

    // Validate & sanitize documentsChecklist
    if (body.documentsChecklist !== undefined) {
      const result = sanitizeDocumentsChecklist(body.documentsChecklist);
      if (!result.ok) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: result.error },
        });
      }
      body.documentsChecklist = result.value;
    }

    // Trim image URL fields to strip hidden newline characters
    trimImageFields(body);

    const country = await Country.create({ ...body, slug });

    res.status(201).json({ data: country.toObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /countries/reorder  (registered BEFORE /:id)
exports.reorder = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "items array is required" },
      });
    }

    const ops = items.map(({ id, sortOrder }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { sortOrder } } },
    }));

    await Country.bulkWrite(ops);
    res.json({ data: { message: "Countries reordered successfully" } });
  } catch (err) {
    next(err);
  }
};

// PUT /countries/:id
exports.update = async (req, res, next) => {
  try {
    const { id }   = req.params;
    const updates  = { ...req.body };

    if (updates.name || updates.slug) {
      updates.slug = updates.slug
        ? slugify(updates.slug, { lower: true, strict: true, trim: true })
        : makeSlug(updates.name);

      const exists = await Country.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({
          error: { code: "VALIDATION_ERROR", message: "A country with this slug already exists" },
        });
      }
    }

    // Filter empty strings from array fields
    if (Array.isArray(updates.highlights))       updates.highlights       = updates.highlights.filter(h => h && h.trim());
    if (Array.isArray(updates.eligibility))       updates.eligibility       = updates.eligibility.filter(e => e && e.trim());
    if (Array.isArray(updates.features))          updates.features          = updates.features.filter(f => f && f.title);
    if (Array.isArray(updates.admissionProcess))  updates.admissionProcess  = updates.admissionProcess.filter(s => s && s.title);

    // Validate & sanitize supportExperience
    if (updates.supportExperience !== undefined) {
      const result = sanitizeSupportExperience(updates.supportExperience);
      if (!result.ok) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: result.error },
        });
      }
      updates.supportExperience = result.value;
    }

    // Validate & sanitize studentLife
    if (updates.studentLife !== undefined) {
      const result = sanitizeStudentLife(updates.studentLife);
      if (!result.ok) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: result.error },
        });
      }
      updates.studentLife = result.value;
    }

    // Validate & sanitize documentsChecklist
    if (updates.documentsChecklist !== undefined) {
      const result = sanitizeDocumentsChecklist(updates.documentsChecklist);
      if (!result.ok) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: result.error },
        });
      }
      updates.documentsChecklist = result.value;
    }

    // Trim image URL fields to strip hidden newline characters
    trimImageFields(updates);

    const country = await Country.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: "after", runValidators: false }
    );

    if (!country) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Country not found" },
      });
    }

    res.json({ data: country.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /countries/:id
exports.remove = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Country not found" },
      });
    }
    res.json({ data: { message: "Country deleted successfully" } });
  } catch (err) {
    next(err);
  }
};
