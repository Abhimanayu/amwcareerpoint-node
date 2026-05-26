const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const predictorUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      match: [/^\d{10}$/, "phone must be a 10-digit number"],
    },
    password: { type: String, required: true, minlength: 8 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

predictorUserSchema.index({ phone: 1 }, { sparse: true });

predictorUserSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

predictorUserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("PredictorUser", predictorUserSchema);
