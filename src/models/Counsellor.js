const mongoose = require("mongoose");

const counsellorSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    role:            { type: String, required: true, trim: true },
    avatar:          { type: String, default: "" },
    experience:      { type: String, default: "" },
    rating:          { type: Number, default: 5, min: 0, max: 5 },
    bio:             { type: String, default: "" },
    specializations: [{ type: String }],
    languages:       [{ type: String }],
    status:          { type: String, enum: ["active", "inactive"], default: "active" },
    sortOrder:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

counsellorSchema.index({ status: 1, sortOrder: 1 });

module.exports = mongoose.model("Counsellor", counsellorSchema);
