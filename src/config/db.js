const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB connected:", mongoose.connection.name);
};

module.exports = connectDB;
