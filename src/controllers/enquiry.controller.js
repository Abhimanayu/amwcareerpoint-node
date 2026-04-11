const Enquiry = require("../models/Enquiry");

// POST /enquiries  (Public)
exports.submit = async (req, res, next) => {
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
    if (!body.email || !body.email.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "email", message: "Email is required" }],
        },
      });
    }
    if (!body.phone || !body.phone.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "phone", message: "Phone is required" }],
        },
      });
    }

    const enquiry = await Enquiry.create(body);
    res.status(201).json({ data: enquiry.toObject() });
  } catch (err) {
    next(err);
  }
};

// GET /enquiries  (Admin)
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, sort = "-createdAt", status } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const parseSort = (s = "-createdAt") => {
      if (s.startsWith("-")) return { [s.slice(1)]: -1 };
      return { [s]: 1 };
    };

    const [data, total] = await Promise.all([
      Enquiry.find(filter).sort(parseSort(sort)).skip(skip).limit(limitNum).lean(),
      Enquiry.countDocuments(filter),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// PUT /enquiries/:id  (Admin — only status and notes)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updates = {};
    if (status    !== undefined) updates.status = status;
    if (notes     !== undefined) updates.notes  = notes;

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: false }
    );

    if (!enquiry) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Enquiry not found" },
      });
    }

    res.json({ data: enquiry.toObject() });
  } catch (err) {
    next(err);
  }
};
