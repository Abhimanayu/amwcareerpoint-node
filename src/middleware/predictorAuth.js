const jwt = require("jsonwebtoken");
const PredictorUser = require("../models/PredictorUser");

const predictorTokenBlacklist = new Set();
const predictorRefreshTokenBlacklist = new Set();
const predictorUserRefreshTokens = new Map();

const PREDICTOR_JWT_SECRET = process.env.PREDICTOR_JWT_SECRET || process.env.JWT_SECRET || "amw_predictor_secret";

async function predictorAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Authorization token required" },
    });
  }

  const token = authHeader.slice(7);
  if (predictorTokenBlacklist.has(token)) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Token has been invalidated" },
    });
  }

  try {
    const decoded = jwt.verify(token, PREDICTOR_JWT_SECRET);
    if (decoded.type !== "predictor") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid token type" },
      });
    }

    const user = await PredictorUser.findById(decoded.id).select("_id name email phone isActive").lean();
    if (!user || user.isActive === false) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "User not found or inactive" },
      });
    }

    req.predictorUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || null,
    };
    req.predictorToken = token;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
}

module.exports = {
  predictorAuthMiddleware,
  predictorTokenBlacklist,
  predictorRefreshTokenBlacklist,
  predictorUserRefreshTokens,
};
