const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name:              { type: String, required: true, trim: true },
    email:             { type: String, required: true, trim: true, lowercase: true },
    phone:             { type: String, required: true, trim: true },
    interestedCountry: { type: String, default: "" },
    source:            { type: String, default: "" },
    message:           { type: String, default: "" },
    status:            { type: String, enum: ["new", "contacted", "converted", "closed"], default: "new" },
    notes:             { type: String, default: "" },
  },
  { timestamps: true }
);

enquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", enquirySchema);
