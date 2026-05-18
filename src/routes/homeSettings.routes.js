const router = require("express").Router();
const ctrl = require("../controllers/homeSettings.controller");
const { authMiddleware } = require("../middleware/auth");

router.get("/", ctrl.getPublic);
router.get("/admin", authMiddleware, ctrl.getAdmin);
router.put("/home-items", authMiddleware, ctrl.updateHomeItems);
router.put("/", authMiddleware, ctrl.update);

module.exports = router;
