const router = require("express").Router();
const ctrl = require("../controllers/predictorPayment.controller");
const { predictorAuthMiddleware } = require("../middleware/predictorAuth");

router.get("/plan", ctrl.getPlan);
router.post("/create-order", predictorAuthMiddleware, ctrl.createOrder);
router.post("/verify", predictorAuthMiddleware, ctrl.verifyPayment);

module.exports = router;
