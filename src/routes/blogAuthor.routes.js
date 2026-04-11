const router = require("express").Router();
const ctrl = require("../controllers/blog.controller");
const { authMiddleware } = require("../middleware/auth");

// Authors (bonus — needed for admin dropdown)
router.get("/", ctrl.listAuthors);
router.post("/", authMiddleware, ctrl.createAuthor);

module.exports = router;
