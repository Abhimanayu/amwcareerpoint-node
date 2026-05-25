const Faq = require("../models/Faq");
const mongoose = require("mongoose");

const ALLOWED_FAQ_PAGES = new Set(["home", "country", "university", "contact", "general", "about"]);
const PAGES_REQUIRING_SLUG = new Set(["country", "university"]);

// Validate MongoDB ObjectId format
const isValidObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch {
    return false;
  }
};

const validationError = (res, details) =>
  res.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details,
    },
  });

const normalizePage = (value) => {
  if (typeof value !== "string") return value;
  return value.toLowerCase().trim();
};

const normalizePageSlug = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;
  const normalized = value.toLowerCase().trim();
  return normalized || null;
};

const isValidFaqPage = (page) => ALLOWED_FAQ_PAGES.has(page);

const parseSort = (sort = "sortOrder") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

const isPositiveInteger = (value) => {
  if (typeof value === "number") return Number.isInteger(value) && value > 0;
  if (typeof value !== "string") return false;
  return /^[1-9]\d*$/.test(value.trim());
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
};

// GET /faqs
// Public. Filter by ?page=home&pageSlug=russia&status=active
exports.list = async (req, res, next) => {
  try {
    const {
      page,
      pageNumber,
      limit    = 50,
      sort     = "sortOrder",
      status,
      faqPage,    // FAQ page scope filter (home/country/university/contact/general/about)
      pageSlug,
    } = req.query;

    // Backward compatibility: some clients send ?page=about for faq page filter.
    // If page is non-numeric and faqPage is not provided, treat page as faqPage.
    let resolvedFaqPage = faqPage;
    if (resolvedFaqPage === undefined) {
      const pageLooksLikeFaqScope = typeof page === "string" && isPositiveInteger(page) === false;
      if (pageLooksLikeFaqScope) {
        resolvedFaqPage = page;
      }
    }

    // Prefer pageNumber for pagination if provided; otherwise use numeric page.
    let pageInput = pageNumber;
    if (pageInput === undefined) {
      pageInput = isPositiveInteger(page) ? page : 1;
    }

    const pageNum  = parsePositiveInt(pageInput, 1);
    const limitNum = Math.min(200, parsePositiveInt(limit, 50));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};

    // Status filter
    if (status === "all")          { /* no filter */ }
    else if (status === "inactive") filter.status = "inactive";
    else                            filter.status = "active";

    // Page filter (which page these FAQs belong to)
    if (resolvedFaqPage !== undefined) {
      const normalizedFaqPage = normalizePage(resolvedFaqPage);
      if (!isValidFaqPage(normalizedFaqPage)) {
        return validationError(res, [{
          field: "faqPage",
          message: "Invalid faqPage. Allowed values: home, country, university, contact, general, about",
        }]);
      }
      filter.page = normalizedFaqPage;
    }

    // PageSlug filter (e.g., specific country or university slug)
    if (pageSlug !== undefined) {
      filter.pageSlug = normalizePageSlug(pageSlug);
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
    const { id } = req.params;
    
    // Validate ID format early
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { 
          code: "INVALID_ID", 
          message: "Invalid FAQ ID format. Must be a valid MongoDB ObjectId." 
        },
      });
    }
    
    const faq = await Faq.findById(id).lean();
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

    if (!body.question?.trim()) {
      return validationError(res, [{ field: "question", message: "Question is required" }]);
    }
    if (!body.answer?.trim()) {
      return validationError(res, [{ field: "answer", message: "Answer is required" }]);
    }

    body.page = normalizePage(body.page);

    if (!body.page) {
      return validationError(res, [{
        field: "page",
        message: "Page is required (home/country/university/contact/general/about)",
      }]);
    }

    if (!isValidFaqPage(body.page)) {
      return validationError(res, [{
        field: "page",
        message: "Invalid page. Allowed values: home, country, university, contact, general, about",
      }]);
    }

    body.pageSlug = normalizePageSlug(body.pageSlug);

    if (PAGES_REQUIRING_SLUG.has(body.page) && !body.pageSlug) {
      return validationError(res, [{
        field: "pageSlug",
        message: "pageSlug is required when page is country or university",
      }]);
    }

    if (!PAGES_REQUIRING_SLUG.has(body.page)) {
      body.pageSlug = null;
    }

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
    const { id } = req.params;
    
    // Validate ID format early
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { 
          code: "INVALID_ID", 
          message: "Invalid FAQ ID format. Must be a valid MongoDB ObjectId." 
        },
      });
    }
    
    const updates = { ...req.body };

    if (Object.hasOwn(updates, "page")) {
      updates.page = normalizePage(updates.page);
    }
    if (Object.hasOwn(updates, "pageSlug")) {
      updates.pageSlug = normalizePageSlug(updates.pageSlug);
    }

    const faq = await Faq.findById(id);
    if (!faq) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "FAQ not found" },
      });
    }

    Object.assign(faq, updates);

    if (!isValidFaqPage(faq.page)) {
      return validationError(res, [{
        field: "page",
        message: "Invalid page. Allowed values: home, country, university, contact, general, about",
      }]);
    }

    if (PAGES_REQUIRING_SLUG.has(faq.page) && !normalizePageSlug(faq.pageSlug)) {
      return validationError(res, [{
        field: "pageSlug",
        message: "pageSlug is required when page is country or university",
      }]);
    }

    if (!PAGES_REQUIRING_SLUG.has(faq.page)) {
      faq.pageSlug = null;
    }

    await faq.save();

    res.json({ data: faq.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /faqs/:id  (Admin)
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID format early
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: { 
          code: "INVALID_ID", 
          message: "Invalid FAQ ID format. Must be a valid MongoDB ObjectId." 
        },
      });
    }
    
    const faq = await Faq.findByIdAndDelete(id);
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
