const fs = require("fs");
const path = require("path");
const { uploadBuffer, destroy, getResource } = require("../config/cloudinary");

// Whitelist of allowed folder values
const ALLOWED_FOLDERS = ["countries", "universities", "blogs", "counsellors", "reviews", "general"];

// POST /media/upload
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "No file uploaded",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Sanitize & whitelist folder
    const rawFolder = String(req.body.folder || req.query.folder || "general").trim();
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const folder = ALLOWED_FOLDERS.includes(safeFolder) ? safeFolder : "general";

    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e6);
    const publicIdBase = `${timestamp}-${random}`;

    console.log(`☁️  Uploading to Cloudinary: amw/${folder}/${publicIdBase}`);

    const result = await uploadBuffer(req.file.buffer, {
      folder: `amw/${folder}`,
      public_id: publicIdBase,
      format: ext || undefined,
    });

    console.log(`✅ Cloudinary upload OK: ${result.secure_url}`);

    res.json({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        filename: `${publicIdBase}.${ext || "png"}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        folder,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("❌ Upload error:", err);

    // Surface Cloudinary-specific errors clearly
    if (err.http_code || err.message?.includes("Cloudinary")) {
      return res.status(502).json({
        error: {
          code: "CLOUDINARY_ERROR",
          message: "Image upload to cloud storage failed",
          details: err.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
    next(err);
  }
};

// GET /media/verify/:folder/:filename
// Checks Cloudinary first (by convention public_id = amw/<folder>/<stem>),
// then falls back to local disk for legacy assets.
exports.verify = async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const stem = path.parse(filename).name; // strip extension
    const publicId = `amw/${folder}/${stem}`;

    // 1. Try Cloudinary
    const resource = await getResource(publicId);
    if (resource) {
      return res.json({
        exists: true,
        source: "cloudinary",
        path: `${folder}/${filename}`,
        url: resource.secure_url,
        size: resource.bytes,
        created: resource.created_at,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Fallback: local disk
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, folder, filename);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const baseUrl = String(
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
      ).trim();

      return res.json({
        exists: true,
        source: "local",
        path: `${folder}/${filename}`,
        url: `${baseUrl}/uploads/${folder}/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(404).json({
      exists: false,
      path: `${folder}/${filename}`,
      error: "File not found",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Verify error:", err);
    next(err);
  }
};

// DELETE /media/delete/:folder/:filename
// Deletes from Cloudinary first, then falls back to local disk.
exports.delete = async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const stem = path.parse(filename).name;
    const publicId = `amw/${folder}/${stem}`;

    // 1. Try Cloudinary
    const cloudResult = await destroy(publicId);
    if (cloudResult.result === "ok") {
      return res.json({
        message: "File deleted successfully",
        source: "cloudinary",
        publicId,
        path: `${folder}/${filename}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Fallback: local disk
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found in cloud storage or on disk",
          timestamp: new Date().toISOString(),
        },
      });
    }

    fs.unlinkSync(filePath);
    res.json({
      message: "File deleted successfully",
      source: "local",
      path: `${folder}/${filename}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    next(err);
  }
};
