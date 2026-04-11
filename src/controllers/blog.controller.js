const slugify = require("slugify");
const { Blog, BlogCategory } = require("../models/Blog");

const makeSlug = (title) => slugify(title, { lower: true, strict: true, trim: true });

const parseSort = (sort = "-createdAt") => {
  if (sort.startsWith("-")) return { [sort.slice(1)]: -1 };
  return { [sort]: 1 };
};

const CATEGORY_POPULATE = { path: "category", select: "_id name" };

// GET /blogs
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt", status, category, featured } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};
    if (status === "all")          { /* no filter */ }
    else if (status === "draft")    filter.status   = "draft";
    else                            filter.status   = "published";

    if (featured === "true") filter.featured = true;

    if (category) {
      // Support category by ObjectId or name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await BlogCategory.findOne({ name: new RegExp(`^${category}$`, "i") }).lean();
        if (cat) filter.category = cat._id;
      }
    }

    const [data, total] = await Promise.all([
      Blog.find(filter)
        .populate(CATEGORY_POPULATE)
        .sort(parseSort(sort))
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// GET /blogs/:slug
exports.detail = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate(CATEGORY_POPULATE)
      .lean();

    if (!blog) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Blog post not found" },
      });
    }

    res.json({ data: blog });
  } catch (err) {
    next(err);
  }
};

// POST /blogs
exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "title", message: "Title is required" }],
        },
      });
    }
    if (!body.content || !body.content.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [{ field: "content", message: "Content is required" }],
        },
      });
    }

    // Validate category if provided
    if (body.category) {
      const cat = await BlogCategory.findById(body.category);
      if (!cat) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "category", message: "Category not found" }],
          },
        });
      }
    }

    const slug = body.slug
      ? slugify(body.slug, { lower: true, strict: true, trim: true })
      : makeSlug(body.title);

    const exists = await Blog.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        error: { code: "VALIDATION_ERROR", message: "A blog with this title already exists" },
      });
    }

    if (Array.isArray(body.tags)) body.tags = body.tags.filter(t => t && t.trim());

    const blog     = await Blog.create({ ...body, slug });
    const populated = await Blog.findById(blog._id).populate(CATEGORY_POPULATE).lean();

    res.status(201).json({ data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /blogs/:id
exports.update = async (req, res, next) => {
  try {
    const { id }  = req.params;
    const updates = { ...req.body };

    if (updates.category) {
      const cat = await BlogCategory.findById(updates.category);
      if (!cat) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [{ field: "category", message: "Category not found" }],
          },
        });
      }
    }

    if (updates.title || updates.slug) {
      updates.slug = updates.slug
        ? slugify(updates.slug, { lower: true, strict: true, trim: true })
        : makeSlug(updates.title);

      const exists = await Blog.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({
          error: { code: "VALIDATION_ERROR", message: "A blog with this slug already exists" },
        });
      }
    }

    if (Array.isArray(updates.tags)) updates.tags = updates.tags.filter(t => t && t.trim());

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: false }
    ).populate(CATEGORY_POPULATE);

    if (!blog) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Blog post not found" },
      });
    }

    res.json({ data: blog.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /blogs/:id
exports.remove = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Blog post not found" },
      });
    }
    res.json({ data: { message: "Blog post deleted successfully" } });
  } catch (err) {
    next(err);
  }
};

// ── Blog Categories ────────────────────────────────────────────────

// GET /blog-categories
exports.listCategories = async (req, res, next) => {
  try {
    const data = await BlogCategory.find().sort({ name: 1 }).lean();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// POST /blog-categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Category name is required" },
      });
    }

    const exists = await BlogCategory.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
    if (exists) {
      return res.status(409).json({
        error: { code: "VALIDATION_ERROR", message: "Category with this name already exists" },
      });
    }

    const category = await BlogCategory.create({ name: name.trim() });
    res.status(201).json({ data: category.toObject() });
  } catch (err) {
    next(err);
  }
};

// PUT /blog-categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Category name is required" },
      });
    }

    const category = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      { $set: { name: name.trim() } },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Category not found" },
      });
    }

    res.json({ data: category.toObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /blog-categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await BlogCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Category not found" },
      });
    }
    res.json({ data: { message: "Category deleted successfully" } });
  } catch (err) {
    next(err);
  }
};
