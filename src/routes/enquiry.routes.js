const router = require("express").Router();
const ctrl = require("../controllers/enquiry.controller");
const { authMiddleware } = require("../middleware/auth");

// Public
router.post("/", ctrl.submit);

// Admin
router.get("/", authMiddleware, ctrl.list);
router.put("/:id", authMiddleware, ctrl.updateStatus);
router.delete("/:id", authMiddleware, ctrl.remove);

module.exports = router;
