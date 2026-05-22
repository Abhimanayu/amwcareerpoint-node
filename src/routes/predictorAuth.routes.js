const router = require("express").Router();
const ctrl = require("../controllers/predictorAuth.controller");
const { predictorAuthMiddleware } = require("../middleware/predictorAuth");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", predictorAuthMiddleware, ctrl.logout);
router.get("/me", predictorAuthMiddleware, ctrl.me);

module.exports = router;
