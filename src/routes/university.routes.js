const router = require("express").Router();
const ctrl = require("../controllers/university.controller");
const { authMiddleware } = require("../middleware/auth");

router.get("/", ctrl.list);
router.get("/admin/:id", authMiddleware, ctrl.detailById);
router.get("/:slug", ctrl.detail);
router.post("/", authMiddleware, ctrl.create);
router.put("/:id", authMiddleware, ctrl.update);
router.delete("/:id", authMiddleware, ctrl.remove);

module.exports = router;
