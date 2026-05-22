const PredictorAccess = require("../models/PredictorAccess");

function calculateDaysRemaining(expiresAt) {
  const now = Date.now();
  const ms = new Date(expiresAt).getTime() - now;
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
}

async function loadActiveAccess(userId) {
  const now = new Date();
  return PredictorAccess.findOne({
    userId,
    isActive: true,
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: -1 })
    .lean();
}

exports.predictorAccessMiddleware = async (req, res, next) => {
  try {
    // Support both admin (from authMiddleware) and predictor students (from predictorAuthMiddleware)
    const user = req.predictorUser || req.admin;
    if (!user?.id) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authorization token required" },
      });
    }

    // Keep admin/superadmin unblocked for support and QA flows.
    if (user.role === "admin" || user.role === "superadmin") {
      req.predictorAccess = {
        hasAccess: true,
        isAdminBypass: true,
        expiresAt: null,
        daysRemaining: null,
      };
      return next();
    }

    const activeAccess = await loadActiveAccess(user.id);
    if (!activeAccess) {
      return res.status(403).json({
        error: {
          code: "PREDICTOR_ACCESS_REQUIRED",
          message: "Active predictor access is required",
        },
      });
    }

    req.predictorAccess = {
      hasAccess: true,
      isAdminBypass: false,
      expiresAt: activeAccess.expiresAt,
      daysRemaining: calculateDaysRemaining(activeAccess.expiresAt),
    };

    return next();
  } catch (err) {
    return next(err);
  }
};

exports.getPredictorAccessStatus = async (user) => {
  if (!user?.id) {
    return { hasAccess: false, expiresAt: null, daysRemaining: 0, isAdminBypass: false };
  }

  if (user.role === "admin" || user.role === "superadmin") {
    return { hasAccess: true, expiresAt: null, daysRemaining: null, isAdminBypass: true };
  }

  const activeAccess = await loadActiveAccess(user.id);
  if (!activeAccess) {
    return { hasAccess: false, expiresAt: null, daysRemaining: 0, isAdminBypass: false };
  }

  return {
    hasAccess: true,
    expiresAt: activeAccess.expiresAt,
    daysRemaining: calculateDaysRemaining(activeAccess.expiresAt),
    isAdminBypass: false,
  };
};
