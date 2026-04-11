const slugify = require("slugify");
const Country  = require("../models/Country");

const makeSlug = (name) => slugify(name, { lower: true, strict: true, trim: true });

// Parse sort param: "-sortOrder" → {sortOrder:-1}, "name" → {name:1}
const parseSort = (sort = "-sortOrder") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
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

    const [data, total] = await Promise.all([
      Country.find(filter).sort(parseSort(sort)).skip(skip).limit(limitNum).lean(),
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

    const country = await Country.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: false }
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
