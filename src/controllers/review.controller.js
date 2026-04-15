const { Review, ReviewMeta } = require("../models/Review");

const parseSort = (sort = "-createdAt") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

// GET /reviews
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt", status } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status === "all")                              { /* no filter */ }
    else if (["pending", "rejected"].includes(status)) filter.status = status;
    else                                               filter.status = "approved";

    const [data, total] = await Promise.all([
      Review.find(filter).sort(parseSort(sort)).skip(skip).limit(limitNum).lean(),
      Review.countDocuments(filter),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// POST /reviews
exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };

    if (!body.studentName || !body.studentName.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "studentName", message: "Student name is required" }],
        },
      });
    }
    if (!body.rating) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "rating", message: "Rating is required" }],
        },
      });
    }
    if (!body.reviewText || !body.reviewText.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "reviewText", message: "Review text is required" }],
        },
      });
    }

    const review = await Review.create(body);
    res.status(201).json({ data: review.toObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /reviews/meta  — must be registered BEFORE /:id
exports.updateMeta = async (req, res, next) => {
  try {
    const { averageRating, totalReviews } = req.body;
    const meta = await ReviewMeta.findOneAndUpdate(
      { key: "global" },
      { $set: { averageRating, totalReviews } },
      { returnDocument: "after", upsert: true }
    );
    res.json({
      data: { averageRating: meta.averageRating, totalReviews: meta.totalReviews },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /reviews/:id
exports.update = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: false }
    );

    if (!review) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Review not found" },
      });
    }

    res.json({ data: review.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /reviews/:id
exports.remove = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Review not found" },
      });
    }
    res.json({ data: { message: "Review deleted successfully" } });
  } catch (err) {
    next(err);
  }
};
