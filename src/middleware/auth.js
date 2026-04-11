const jwt = require("jsonwebtoken");

// In-memory token blacklist for logout
const tokenBlacklist = new Set();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Authorization token required" },
    });
  }

  const token = authHeader.split(" ")[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Token has been invalidated" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "amw_secret_key");
    req.admin = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
};

module.exports = { authMiddleware, tokenBlacklist };
