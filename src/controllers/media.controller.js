const fs = require("fs");
const path = require("path");

// POST /media/upload
exports.upload = async (req, res, next) => {
  console.log("🚨 MEDIA CONTROLLER CALLED - NEW VERSION");
  try {
    console.log("📤 Upload request received:");
    console.log("  Body:", req.body);
    console.log(
      "  File info:",
      req.file
        ? {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? "Buffer present" : "No buffer",
          }
        : "No file",
    );

    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "No file uploaded",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle folder and file saving manually
    // Support folder from body, query param, or default to "general"
    const folder = String(req.body.folder || req.query.folder || "general").trim();
    // Sanitize folder name to prevent path traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = path.extname(req.file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e6);
    const filename = `${timestamp}-${random}${ext}`;

    // Create target directory
    const uploadsDir = path.join(__dirname, "../../uploads");
    const targetDir = path.join(uploadsDir, safeFolder);

    console.log(`🗂️ Saving file manually:`);
    console.log(`  Folder: ${safeFolder}`);
    console.log(`  Target dir: ${targetDir}`);
    console.log(`  Filename: ${filename}`);

    // Ensure directory exists
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Created directory: ${targetDir}`);
      }
    } catch (dirError) {
      console.error("❌ Error creating directory:", dirError);
      return res.status(500).json({
        error: {
          code: "DIRECTORY_ERROR",
          message: "Failed to create upload directory",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Save file from buffer
    const filePath = path.join(targetDir, filename);
    try {
      fs.writeFileSync(filePath, req.file.buffer);
      console.log(`✅ File saved to: ${filePath}`);
    } catch (saveError) {
      console.error("❌ Error saving file:", saveError);
      return res.status(500).json({
        error: {
          code: "FILE_SAVE_ERROR",
          message: "Failed to save uploaded file",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify file was actually saved
    if (!fs.existsSync(filePath)) {
      console.log("❌ File verification failed - not found at:", filePath);
      return res.status(500).json({
        error: {
          code: "FILE_VERIFICATION_ERROR",
          message: "File save verification failed",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const baseUrl = String(
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    ).trim();
    const url = `${baseUrl}/uploads/${safeFolder}/${filename}`;

    console.log(`✅ Upload completed successfully:`);
    console.log(`  File path: ${filePath}`);
    console.log(`  Public URL: ${url}`);
    console.log(`  File size: ${req.file.size} bytes`);

    // Return comprehensive response
    res.json({
      data: {
        url,
        filename: filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        folder: safeFolder,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    next(err);
  }
};

// GET /media/verify/:folder/:filename
exports.verify = async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, folder, filename);

    console.log(`🔍 Verifying file: ${folder}/${filename}`);
    console.log(`  Full path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log("❌ File not found");
      return res.status(404).json({
        exists: false,
        path: `${folder}/${filename}`,
        error: "File not found",
        timestamp: new Date().toISOString(),
      });
    }

    const stats = fs.statSync(filePath);
    const baseUrl = String(
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    ).trim();

    console.log("✅ File found");
    res.json({
      exists: true,
      path: `${folder}/${filename}`,
      url: `${baseUrl}/uploads/${folder}/${filename}`,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Verify error:", err);
    next(err);
  }
};

// DELETE /media/delete/:folder/:filename - Optional cleanup endpoint
exports.delete = async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, folder, filename);

    console.log(`🗑️ Deleting file: ${folder}/${filename}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found",
          timestamp: new Date().toISOString(),
        },
      });
    }

    fs.unlinkSync(filePath);
    console.log(`✅ File deleted: ${filePath}`);

    res.json({
      message: "File deleted successfully",
      path: `${folder}/${filename}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    next(err);
  }
};
