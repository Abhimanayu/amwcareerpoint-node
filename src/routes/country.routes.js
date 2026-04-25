const router = require("express").Router();
const ctrl = require("../controllers/country.controller");
const { authMiddleware } = require("../middleware/auth");

// Public
router.get("/", ctrl.list);

// Admin-only static routes BEFORE /:slug or /:id
router.get("/admin/:id", authMiddleware, ctrl.detailById);
router.put("/reorder", authMiddleware, ctrl.reorder);

// Public
router.get("/:slug", ctrl.detail);

// Admin-only
router.post("/", authMiddleware, ctrl.create);
router.put("/:id", authMiddleware, ctrl.update);
router.delete("/:id", authMiddleware, ctrl.remove);

module.exports = router;
