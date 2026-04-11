const mongoose = require("mongoose");

const blogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    content:    { type: String, required: true },
    excerpt:    { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category:   { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" },
    author:     { type: String, default: "" },
    tags:       [{ type: String }],
    status:     { type: String, enum: ["published", "draft"], default: "published" },
    featured:   { type: Boolean, default: false },
    seo: {
      metaTitle:       { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords:        { type: String, default: "" },
    },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, featured: 1 });
blogSchema.index({ category: 1 });

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
const Blog         = mongoose.model("Blog", blogSchema);

module.exports = { Blog, BlogCategory };
