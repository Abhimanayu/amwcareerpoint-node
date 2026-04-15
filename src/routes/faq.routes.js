const router = require("express").Router();
const ctrl   = require("../controllers/faq.controller");
const { authMiddleware } = require("../middleware/auth");

// Public
router.get("/",        ctrl.list);
router.get("/:id",     ctrl.detail);

// Admin
router.post("/",           authMiddleware, ctrl.create);
router.put("/reorder",     authMiddleware, ctrl.reorder);   // BEFORE /:id
router.put("/:id",         authMiddleware, ctrl.update);
router.delete("/:id",      authMiddleware, ctrl.remove);

module.exports = router;
