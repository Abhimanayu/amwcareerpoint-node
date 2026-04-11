const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth");

router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", authMiddleware, ctrl.logout);

module.exports = router;
