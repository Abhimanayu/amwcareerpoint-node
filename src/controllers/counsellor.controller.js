const Counsellor = require("../models/Counsellor");

const parseSort = (sort = "-sortOrder") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

// GET /counsellors
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-sortOrder", status } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status === "all")           { /* no filter */ }
    else if (status === "inactive")  filter.status = "inactive";
    else                             filter.status = "active";

    const [data, total] = await Promise.all([
      Counsellor.find(filter).sort(parseSort(sort)).skip(skip).limit(limitNum).lean(),
      Counsellor.countDocuments(filter),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// POST /counsellors
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
    if (!body.role || !body.role.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "role", message: "Role is required" }],
        },
      });
    }

    // Filter empty strings from array fields
    if (Array.isArray(body.specializations)) body.specializations = body.specializations.filter(s => s && s.trim());
    if (Array.isArray(body.languages))        body.languages        = body.languages.filter(l => l && l.trim());

    const counsellor = await Counsellor.create(body);
    res.status(201).json({ data: counsellor.toObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /counsellors/:id
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (Array.isArray(updates.specializations)) updates.specializations = updates.specializations.filter(s => s && s.trim());
    if (Array.isArray(updates.languages))        updates.languages        = updates.languages.filter(l => l && l.trim());

    const counsellor = await Counsellor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: false }
    );

    if (!counsellor) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Counsellor not found" },
      });
    }

    res.json({ data: counsellor.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /counsellors/:id
exports.remove = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findByIdAndDelete(req.params.id);
    if (!counsellor) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Counsellor not found" },
      });
    }
    res.json({ data: { message: "Counsellor deleted successfully" } });
  } catch (err) {
    next(err);
  }
};
