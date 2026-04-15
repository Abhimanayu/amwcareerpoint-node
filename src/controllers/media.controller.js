// POST /media/upload
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "No file uploaded" },
      });
    }

    const folder  = String(req.body.folder || "general").trim();
    const baseUrl = String(process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`).trim();
    const url     = `${baseUrl}/uploads/${folder}/${req.file.filename}`;

    res.json({ data: { url } });
  } catch (err) {
    next(err);
  }
};
