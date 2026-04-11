const router = require("express").Router();
const ctrl = require("../controllers/blog.controller");
const { authMiddleware } = require("../middleware/auth");

// Categories
router.get("/", ctrl.listCategories);
router.post("/", authMiddleware, ctrl.createCategory);
router.put("/:id", authMiddleware, ctrl.updateCategory);
router.delete("/:id", authMiddleware, ctrl.deleteCategory);

module.exports = router;
