const Faq = require("../models/Faq");

const parseSort = (sort = "sortOrder") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

// GET /faqs
// Public. Filter by ?page=home&pageSlug=russia&status=active
exports.list = async (req, res, next) => {
  try {
    const {
      page     = 1,
      limit    = 50,
      sort     = "sortOrder",
      status,
      page: faqPage,  // the FAQ "page" filter (home/country/...)
      pageSlug,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};

    // Status filter
    if (status === "all")          { /* no filter */ }
    else if (status === "inactive") filter.status = "inactive";
    else                            filter.status = "active";

    // Page filter (which page these FAQs belong to)
    if (faqPage) filter.page = faqPage;

    // PageSlug filter (e.g., specific country or university slug)
    if (pageSlug !== undefined) {
      filter.pageSlug = pageSlug.toLowerCase();
    }

    const [data, total] = await Promise.all([
      Faq.find(filter).sort(parseSort(sort)).skip(skip).limit(limitNum).lean(),
      Faq.countDocuments(filter),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// GET /faqs/:id
exports.detail = async (req, res, next) => {
  try {
    const faq = await Faq.findById(req.params.id).lean();
    if (!faq) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "FAQ not found" },
      });
    }
    res.json({ data: faq });
  } catch (err) {
    next(err);
  }
};

// POST /faqs  (Admin)
exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };

    if (!body.question || !body.question.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "question", message: "Question is required" }],
        },
      });
    }
    if (!body.answer || !body.answer.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "answer", message: "Answer is required" }],
        },
      });
    }
    if (!body.page) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "page", message: "Page is required (home/country/university/contact/general)" }],
        },
      });
    }

    // Normalise pageSlug
    if (body.pageSlug) body.pageSlug = body.pageSlug.toLowerCase().trim();

    const faq = await Faq.create(body);
    res.status(201).json({ data: faq.toObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /faqs/reorder  (Admin) — must be registered BEFORE /:id
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

    await Faq.bulkWrite(ops);
    res.json({ data: { message: "FAQs reordered successfully" } });
  } catch (err) {
    next(err);
  }
};

// PUT /faqs/:id  (Admin)
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (updates.pageSlug) updates.pageSlug = updates.pageSlug.toLowerCase().trim();

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: false }
    );

    if (!faq) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "FAQ not found" },
      });
    }

    res.json({ data: faq.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /faqs/:id  (Admin)
exports.remove = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "FAQ not found" },
      });
    }
    res.json({ data: { message: "FAQ deleted successfully" } });
  } catch (err) {
    next(err);
  }
};
