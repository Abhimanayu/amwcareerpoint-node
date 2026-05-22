const router = require("express").Router();
const ctrl = require("../controllers/predictor.controller");
const { authMiddleware } = require("../middleware/auth");
const { predictorAuthMiddleware } = require("../middleware/predictorAuth");
const { predictorAccessMiddleware } = require("../middleware/predictorAccess");

// Student endpoints — use predictorAuthMiddleware
router.get("/access", predictorAuthMiddleware, ctrl.getAccessStatus);
router.post("/search", predictorAuthMiddleware, predictorAccessMiddleware, ctrl.search);

// Admin endpoints — use authMiddleware
router.post("/admin/access/grant", authMiddleware, ctrl.grantAccess);
router.post("/admin/access/revoke", authMiddleware, ctrl.revokeAccess);
router.get("/admin/access/active", authMiddleware, ctrl.listActiveAccesses);
router.get("/admin/access/expiring", authMiddleware, ctrl.listExpiringAccesses);
router.get("/admin/access/:userId", authMiddleware, ctrl.getAccessByUser);

module.exports = router;
