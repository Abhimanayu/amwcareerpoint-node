const fs = require("fs");
const path = require("path");

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("🔍 Stack trace:", err.stack);

  // Clean up uploaded file if error occurs during processing
  if (req.file && req.file.path) {
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Cleaned up failed upload: ${req.file.path}`);
      }
    } catch (unlinkError) {
      console.error("❌ Failed to clean up file:", unlinkError.message);
    }
  }

  // Clean up multiple files if using upload.array() or upload.fields()
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file) => {
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Cleaned up failed upload: ${file.path}`);
        }
      } catch (unlinkError) {
        console.error("❌ Failed to clean up file:", unlinkError.message);
      }
    });
  }

  // Malformed JSON body
  if (
    err.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && err.status === 400) ||
    (err instanceof SyntaxError && err.message && err.message.includes("JSON"))
  ) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON in request body",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `Duplicate value: ${field} already exists`,
        details: [{ field, message: `${field} already exists` }],
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `Invalid ${err.path}: ${err.value}`,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        code: "FILE_TOO_LARGE",
        message: "File size exceeds 10MB limit",
        maxSize: "10MB",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Multer file count error
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      error: {
        code: "TOO_MANY_FILES",
        message: "Too many files uploaded",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Multer unsupported type
  if (err.code === "UNSUPPORTED_MEDIA") {
    return res.status(415).json({
      error: {
        code: "UNSUPPORTED_MEDIA",
        message: err.message || "Unsupported file type",
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

  // Multer general error
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: {
        code: "UPLOAD_ERROR",
        message: err.message,
        type: err.code,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or malformed token",
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token has expired",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // File system errors
  if (err.code === "ENOENT") {
    return res.status(404).json({
      error: {
        code: "FILE_NOT_FOUND",
        message: "Requested file not found",
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err.code === "EACCES" || err.code === "EPERM") {
    return res.status(403).json({
      error: {
        code: "PERMISSION_DENIED",
        message: "Permission denied accessing file or directory",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Default — internal error
  res.status(err.status || 500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = errorHandler;
