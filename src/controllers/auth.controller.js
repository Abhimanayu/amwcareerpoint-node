const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { tokenBlacklist, refreshTokenBlacklist, userRefreshTokens } = require("../middleware/auth");

const JWT_SECRET      = process.env.JWT_SECRET      || "amw_secret_key";
const JWT_EXPIRES     = process.env.JWT_EXPIRES      || "7d";
const REFRESH_SECRET  = process.env.REFRESH_SECRET   || "amw_refresh_secret";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES  || "30d";

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" },
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
    }

    const payload = { id: admin._id, email: admin.email, role: admin.role };
    const token        = jwt.sign(payload, JWT_SECRET,     { expiresIn: JWT_EXPIRES });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    // Track refresh token for this user so logout can invalidate it
    const userId = admin._id.toString();
    if (!userRefreshTokens.has(userId)) {
      userRefreshTokens.set(userId, new Set());
    }
    userRefreshTokens.get(userId).add(refreshToken);

    res.json({
      data: {
        token,
        refreshToken,
        user: {
          _id:   admin._id,
          name:  admin.name,
          email: admin.email,
          role:  admin.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  tokenBlacklist.add(req.token);

  // Blacklist ALL refresh tokens for this user
  const userId = req.admin.id.toString();
  const userTokens = userRefreshTokens.get(userId);
  if (userTokens) {
    for (const rt of userTokens) {
      refreshTokenBlacklist.add(rt);
    }
    userRefreshTokens.delete(userId);
  }

  // Also blacklist any explicitly provided refresh token
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokenBlacklist.add(refreshToken);
  }

  res.json({ data: { message: "Logged out successfully" } });
};

// POST /auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "refreshToken is required" },
      });
    }

    if (refreshTokenBlacklist.has(refreshToken)) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Refresh token has been invalidated" },
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" },
      });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" },
      });
    }

    const payload  = { id: admin._id, email: admin.email, role: admin.role };
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // Rotate refresh token: blacklist the old one, issue a new one
    refreshTokenBlacklist.add(refreshToken);
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    const userId = admin._id.toString();
    if (!userRefreshTokens.has(userId)) {
      userRefreshTokens.set(userId, new Set());
    }
    const userTokens = userRefreshTokens.get(userId);
    userTokens.delete(refreshToken);
    userTokens.add(newRefreshToken);

    res.json({ data: { token: newToken, refreshToken: newRefreshToken } });
  } catch (err) {
    next(err);
  }
};
