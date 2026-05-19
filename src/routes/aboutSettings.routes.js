const router = require("express").Router();
const ctrl = require("../controllers/aboutSettings.controller");
const { authMiddleware } = require("../middleware/auth");

router.get("/", ctrl.getPublic);
router.get("/admin", authMiddleware, ctrl.getAdmin);
router.put("/", authMiddleware, ctrl.update);

module.exports = router;
