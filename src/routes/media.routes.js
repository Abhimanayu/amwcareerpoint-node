const router = require("express").Router();
const multer = require("multer");
const ctrl = require("../controllers/media.controller");
const { authMiddleware } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Add multer error handling
const handleUploadErrors = (err, req, res, next) => {
  console.error("🚨 Multer error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        code: "FILE_TOO_LARGE",
        message: "File size too large (max 10MB)",
        maxSize: "10MB",
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err.code === "UNSUPPORTED_MEDIA") {
    return res.status(415).json({
      error: {
        code: "UNSUPPORTED_MEDIA",
        message: err.message,
        supportedTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/bmp",
        ],
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: {
        code: "UPLOAD_ERROR",
        message: err.message,
        type: err.code,
        timestamp: new Date().toISOString(),
      },
    });
  }

  next(err);
};

// Upload endpoint
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  handleUploadErrors,
  ctrl.upload,
);

// File verification endpoint
router.get("/verify/:folder/:filename", ctrl.verify);

// File deletion endpoint (optional - for admin cleanup)
router.delete("/delete/:folder/:filename", authMiddleware, ctrl.delete);

module.exports = router;
