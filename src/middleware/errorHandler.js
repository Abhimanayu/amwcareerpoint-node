const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `Duplicate value: ${field} already exists`,
        details: [{ field, message: `${field} already exists` }],
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
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details },
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: `Invalid ${err.path}: ${err.value}` },
    });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "File size exceeds 5MB limit" },
    });
  }

  // Multer unsupported type
  if (err.code === "UNSUPPORTED_MEDIA") {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: err.message || "Unsupported file type" },
    });
  }

  // Default — internal error
  res.status(err.status || 500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: err.message || "Internal server error",
    },
  });
};

module.exports = errorHandler;
