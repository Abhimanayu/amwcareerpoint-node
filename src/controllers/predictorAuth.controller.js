const jwt = require("jsonwebtoken");
const PredictorUser = require("../models/PredictorUser");
const PredictorAccess = require("../models/PredictorAccess");
const {
  predictorTokenBlacklist,
  predictorRefreshTokenBlacklist,
  predictorUserRefreshTokens,
} = require("../middleware/predictorAuth");

const PREDICTOR_JWT_SECRET = process.env.PREDICTOR_JWT_SECRET || process.env.JWT_SECRET || "amw_predictor_secret";
const PREDICTOR_JWT_EXPIRES = process.env.PREDICTOR_JWT_EXPIRES || "15m";
const PREDICTOR_REFRESH_SECRET =
  process.env.PREDICTOR_REFRESH_SECRET || process.env.REFRESH_SECRET || "amw_predictor_refresh_secret";
const PREDICTOR_REFRESH_EXPIRES = process.env.PREDICTOR_REFRESH_EXPIRES || "30d";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isStrongPassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, type: "predictor" },
    PREDICTOR_JWT_SECRET,
    { expiresIn: PREDICTOR_JWT_EXPIRES }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, type: "predictor" },
    PREDICTOR_REFRESH_SECRET,
    { expiresIn: PREDICTOR_REFRESH_EXPIRES }
  );
}

async function getAccessSnapshot(userId) {
  const now = new Date();
  const access = await PredictorAccess.findOne({
    userId,
    isActive: true,
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: -1 })
    .select("expiresAt")
    .lean();

  if (!access) {
    return { hasActiveAccess: false, accessExpiresAt: null };
  }

  return {
    hasActiveAccess: true,
    accessExpiresAt: access.expiresAt,
  };
}

exports.register = async (req, res, next) => {
  try {
    const name = cleanString(req.body?.name);
    const email = cleanString(req.body?.email).toLowerCase();
    const phone = cleanString(req.body?.phone);
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Name must be between 2 and 50 characters" },
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Valid email is required" },
      });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Phone must be a 10-digit number" },
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be 8+ chars and include uppercase, number, and special character",
        },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "confirmPassword must match password" },
      });
    }

    const exists = await PredictorUser.findOne({ email }).select("_id").lean();
    if (exists) {
      return res.status(409).json({
        error: { code: "VALIDATION_ERROR", message: "Email is already registered" },
      });
    }

    const user = await PredictorUser.create({
      name,
      email,
      phone: phone || null,
      password,
    });

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const userId = user._id.toString();
    if (!predictorUserRefreshTokens.has(userId)) {
      predictorUserRefreshTokens.set(userId, new Set());
    }
    predictorUserRefreshTokens.get(userId).add(refreshToken);

    return res.status(201).json({
      data: {
        userId,
        email: user.email,
        token,
        refreshToken,
        message: "Registration successful. Proceed to payment.",
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = cleanString(req.body?.email).toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" },
      });
    }

    const user = await PredictorUser.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const userId = user._id.toString();
    if (!predictorUserRefreshTokens.has(userId)) {
      predictorUserRefreshTokens.set(userId, new Set());
    }
    predictorUserRefreshTokens.get(userId).add(refreshToken);

    const accessSnapshot = await getAccessSnapshot(user._id);

    return res.json({
      data: {
        userId,
        email: user.email,
        name: user.name,
        token,
        refreshToken,
        hasActiveAccess: accessSnapshot.hasActiveAccess,
        accessExpiresAt: accessSnapshot.accessExpiresAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = String(req.body?.refreshToken || "");
    if (!refreshToken) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "refreshToken is required" },
      });
    }

    if (predictorRefreshTokenBlacklist.has(refreshToken)) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Refresh token has been invalidated" },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, PREDICTOR_REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" },
      });
    }

    if (decoded.type !== "predictor") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid token type" },
      });
    }

    const user = await PredictorUser.findById(decoded.id);
    if (!user || user.isActive === false) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" },
      });
    }

    const newToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    predictorRefreshTokenBlacklist.add(refreshToken);

    const userId = user._id.toString();
    if (!predictorUserRefreshTokens.has(userId)) {
      predictorUserRefreshTokens.set(userId, new Set());
    }
    const userTokenSet = predictorUserRefreshTokens.get(userId);
    userTokenSet.delete(refreshToken);
    userTokenSet.add(newRefreshToken);

    return res.json({
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.logout = async (req, res) => {
  predictorTokenBlacklist.add(req.predictorToken);

  const userId = req.predictorUser.id;
  const userTokens = predictorUserRefreshTokens.get(userId);
  if (userTokens) {
    for (const rt of userTokens) {
      predictorRefreshTokenBlacklist.add(rt);
    }
    predictorUserRefreshTokens.delete(userId);
  }

  const refreshToken = String(req.body?.refreshToken || "");
  if (refreshToken) {
    predictorRefreshTokenBlacklist.add(refreshToken);
  }

  return res.json({
    data: { message: "Logged out successfully" },
  });
};

exports.me = async (req, res, next) => {
  try {
    const user = await PredictorUser.findById(req.predictorUser.id)
      .select("_id name email phone createdAt updatedAt")
      .lean();

    if (!user) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Predictor user not found" },
      });
    }

    const accessSnapshot = await getAccessSnapshot(user._id);

    return res.json({
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        hasActiveAccess: accessSnapshot.hasActiveAccess,
        accessExpiresAt: accessSnapshot.accessExpiresAt,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};
