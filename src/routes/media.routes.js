const router = require("express").Router();
const ctrl = require("../controllers/media.controller");
const { authMiddleware } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", authMiddleware, upload.single("file"), ctrl.upload);

module.exports = router;
