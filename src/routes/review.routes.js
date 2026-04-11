const router = require("express").Router();
const ctrl = require("../controllers/review.controller");
const { authMiddleware } = require("../middleware/auth");

// Public
router.get("/", ctrl.list);

// Admin — static route BEFORE /:id
router.put("/meta", authMiddleware, ctrl.updateMeta);

// Admin
router.post("/", authMiddleware, ctrl.create);
router.put("/:id", authMiddleware, ctrl.update);
router.delete("/:id", authMiddleware, ctrl.remove);

module.exports = router;
