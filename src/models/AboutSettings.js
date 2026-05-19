const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "", maxlength: 70 },
    metaDescription: { type: String, default: "", maxlength: 160 },
    keywords: { type: String, default: "", maxlength: 300 },
    canonicalUrl: { type: String, default: "", maxlength: 300 },
    schemaMarkup: { type: String, default: "" },
  },
  { _id: false },
);

const heroSchema = new mongoose.Schema(
  {
    badge: { type: String, default: "", maxlength: 100 },
    heading: { type: String, default: "", maxlength: 160 },
    subheading: { type: String, default: "", maxlength: 220 },
    description: { type: String, default: "", maxlength: 2000 },
    image: { type: String, default: "" },
    primaryCtaText: { type: String, default: "", maxlength: 60 },
    primaryCtaHref: { type: String, default: "", maxlength: 240 },
    secondaryCtaText: { type: String, default: "", maxlength: 60 },
    secondaryCtaHref: { type: String, default: "", maxlength: 240 },
  },
  { _id: false },
);

const storySchema = new mongoose.Schema(
  {
    heading: { type: String, default: "", maxlength: 160 },
    description: { type: String, default: "", maxlength: 6000 },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const achievementSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true, maxlength: 60 },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    icon: { type: String, default: "", trim: true, maxlength: 80 },
  },
  { _id: false },
);

const valueCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1200 },
    icon: { type: String, default: "", trim: true, maxlength: 80 },
  },
  { _id: false },
);

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, default: "", trim: true, maxlength: 140 },
    bio: { type: String, default: "", trim: true, maxlength: 1200 },
    image: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const teamSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "", maxlength: 160 },
    description: { type: String, default: "", maxlength: 2000 },
    members: {
      type: [teamMemberSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "team.members can have at most 20 items",
      },
    },
  },
  { _id: false },
);

const missionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "", maxlength: 160 },
    description: { type: String, default: "", maxlength: 4000 },
  },
  { _id: false },
);

const sectionToggleSchema = new mongoose.Schema(
  {
    hero: { type: Boolean, default: true },
    story: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    values: { type: Boolean, default: true },
    team: { type: Boolean, default: true },
    mission: { type: Boolean, default: true },
  },
  { _id: false },
);

const aboutSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "about", unique: true, immutable: true },
    seo: { type: seoSchema, default: () => ({}) },
    hero: { type: heroSchema, default: () => ({}) },
    story: { type: storySchema, default: () => ({}) },
    achievements: {
      type: [achievementSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 12,
        message: "achievements can have at most 12 items",
      },
    },
    values: {
      type: [valueCardSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 12,
        message: "values can have at most 12 items",
      },
    },
    team: { type: teamSchema, default: () => ({}) },
    mission: { type: missionSchema, default: () => ({}) },
    sections: { type: sectionToggleSchema, default: () => ({}) },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AboutSettings", aboutSettingsSchema);
