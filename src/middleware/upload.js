const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Use memoryStorage instead of diskStorage to avoid folder issues
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log(
    `🔍 Checking file: ${file.originalname}, mimetype: ${file.mimetype}`,
  );

  if (ALLOWED_TYPES.includes(file.mimetype)) {
    console.log("✅ File type accepted");
    cb(null, true);
  } else {
    console.error(`❌ Rejected file type: ${file.mimetype}`);
    const err = new Error(
      `Only image files are allowed. Supported types: ${ALLOWED_TYPES.join(", ")}`,
    );
    err.code = "UNSUPPORTED_MEDIA";
    err.status = 415;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
});

module.exports = upload;
