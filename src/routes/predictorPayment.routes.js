const router = require("express").Router();
const ctrl = require("../controllers/predictorPayment.controller");
const { authMiddleware } = require("../middleware/auth");
const { predictorAuthMiddleware } = require("../middleware/predictorAuth");

router.get("/plan", ctrl.getPlan);
router.post("/create-order", predictorAuthMiddleware, ctrl.createOrder);
router.post("/verify", predictorAuthMiddleware, ctrl.verifyPayment);
router.post("/manual-request", predictorAuthMiddleware, ctrl.createManualRequest);

router.get("/admin/manual-requests", authMiddleware, ctrl.listManualRequests);
router.post("/admin/manual-requests/:paymentId/approve", authMiddleware, ctrl.approveManualRequest);
router.post("/admin/manual-requests/:paymentId/reject", authMiddleware, ctrl.rejectManualRequest);

module.exports = router;
