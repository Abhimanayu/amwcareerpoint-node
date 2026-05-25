const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

// ── Startup env validation ────────────────────────────────────────
const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnv.join(", "));
  console.error("   Set them in Hostinger panel → Node.js → Environment Variables");
  console.error("Continuing startup so health endpoints can expose diagnostics.");
}
console.log("✅ All required env vars present");
console.log(`   NODE_ENV   : ${process.env.NODE_ENV || "development"}`);
console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN || "https://amwcareerpoint.com,https://www.amwcareerpoint.com (default)"}`);
console.log(`   BASE_URL   : ${process.env.BASE_URL || "(not set — will default to localhost)"}`);
console.log(`   CLOUDINARY : ${process.env.CLOUDINARY_CLOUD_NAME}`);

const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

// ── Routes ────────────────────────────────────────────────────────
const authRoutes = require("./src/routes/auth.routes");
const countryRoutes = require("./src/routes/country.routes");
const universityRoutes = require("./src/routes/university.routes");
const blogRoutes = require("./src/routes/blog.routes");
const blogCategoryRoutes = require("./src/routes/blogCategory.routes");
const enquiryRoutes = require("./src/routes/enquiry.routes");
const mediaRoutes = require("./src/routes/media.routes");
const faqRoutes = require("./src/routes/faq.routes");
const homeSettingsRoutes = require("./src/routes/homeSettings.routes");
const aboutSettingsRoutes = require("./src/routes/aboutSettings.routes");
const predictorMetadataRoutes = require("./src/routes/predictorMetadata.routes");
const predictorRoutes = require("./src/routes/predictor.routes");
const predictorAuthRoutes = require("./src/routes/predictorAuth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust first proxy (Hostinger/nginx) so rate limiters see real client IP
app.set("trust proxy", 1);

console.log("🔧 Registering immediate health endpoints...");

// ── IMMEDIATE HEALTH ENDPOINTS (BEFORE ANY MIDDLEWARE) ───────────
app.get("/health-test", (req, res) => {
  console.log("🩺 Health test endpoint called!");
  res.json({
    message: "Immediate test works!",
    timestamp: new Date().toISOString(),
  });
});

console.log("✅ Health test endpoint registered at /health-test");

app.get("/health-diagnostics", (req, res) => {
  res.json({
    status: "ok",
    dbReady: Boolean(req.app.locals.dbReady),
    env: {
      MONGODB_URI: Boolean(process.env.MONGODB_URI),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
      CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET),
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/uploads/health", (req, res) => {
  console.log("🩺 API uploads health endpoint called!");
  const uploadsExists = fs.existsSync(path.join(__dirname, "uploads"));
  res.json({
    status: uploadsExists ? "healthy" : "error",
    exists: uploadsExists,
    timestamp: new Date().toISOString(),
  });
});

console.log("✅ API uploads health endpoint registered at /api/uploads/health");

// ── CORS ──────────────────────────────────────────────────────────
const CORS_ORIGIN = process.env.CORS_ORIGIN ||
  "https://amwcareerpoint.com,https://www.amwcareerpoint.com";
// Allow comma-separated list of origins
const allowedOrigins = CORS_ORIGIN === "*"
  ? "*"
  : CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── WORKING HEALTH ENDPOINTS (copied from test server) ────────────
app.get("/test", (req, res) => {
  res.json({ message: "Test works!", timestamp: new Date().toISOString() });
});

app.get("/api/uploads/health", (req, res) => {
  const uploadsExists = fs.existsSync(path.join(__dirname, "uploads"));
  res.json({
    status: uploadsExists ? "healthy" : "error",
    exists: uploadsExists,
    timestamp: new Date().toISOString(),
  });
});

// ── Create uploads directory if missing ───────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
const subDirs = ["general", "countries", "universities", "blogs"];

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Created main uploads directory:", uploadsDir);
  }

  // Create subdirectories
  subDirs.forEach((dir) => {
    const subDir = path.join(uploadsDir, dir);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
      console.log(`📁 Created subdirectory: ${dir}`);
    }
  });

  console.log("✅ All upload directories verified");
} catch (error) {
  console.error("❌ Error creating upload directories:", error.message);
}

// ── Enhanced static file serving ──────────────────────────────────
// Add CORS headers for images
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Serve static files with caching
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d", // Cache for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Add security headers
      res.set("X-Content-Type-Options", "nosniff");
      res.set("X-Frame-Options", "DENY");
    },
  }),
);

// ── Health Check & File Verification (BEFORE rate limiter) ────────
// Basic health check
app.get("/", (req, res) => {
  const publicBase = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.json({
    message: "AMW Career Point API",
    version: "1.0.0",
    baseUrl: `${publicBase}/api/v1`,
    status: "running",
    uploadsUrl: `${publicBase}/uploads`,
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
  });
});

// Uploads health check endpoint (as requested)
app.get("/api/uploads/health", (req, res) => {
  const uploadsExists = fs.existsSync(path.join(__dirname, "uploads"));
  res.json({
    status: uploadsExists ? "healthy" : "error",
    exists: uploadsExists,
    timestamp: new Date().toISOString(),
  });
});

// Detailed uploads health check endpoint
app.get("/api/v1/uploads/health", (req, res) => {
  try {
    const uploadsExists = fs.existsSync(uploadsDir);
    const subdirStatus = {};

    subDirs.forEach((dir) => {
      const subDir = path.join(uploadsDir, dir);
      subdirStatus[dir] = {
        exists: fs.existsSync(subDir),
        path: subDir,
      };
    });

    res.json({
      status: uploadsExists ? "healthy" : "error",
      uploadsDir: uploadsDir,
      exists: uploadsExists,
      subdirectories: subdirStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// File verification endpoint
app.get("/api/v1/verify-file/:folder/:filename", (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(uploadsDir, folder, filename);
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      const stats = fs.statSync(filePath);
      res.json({
        exists: true,
        path: `${folder}/${filename}`,
        url: `${process.env.BASE_URL || `http://localhost:${PORT}`}/uploads/${folder}/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      });
    } else {
      res.status(404).json({
        exists: false,
        path: `${folder}/${filename}`,
        error: "File not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      exists: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ── Rate Limiters ─────────────────────────────────────────────────
// Public read-only GET routes — generous limit for normal browsing
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later",
      },
    }),
});

// Auth routes — strict to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many login attempts, please try again after 15 minutes",
      },
    }),
});



// Enquiry submissions — strict on POST to prevent spam, admin reads use general limiter
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many enquiry submissions, please try again later",
      },
    }),
});

// General API fallback — skip requests already handled by a specific limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req._rateLimitApplied === true,
  handler: (req, res) =>
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later",
      },
    }),
});

// Helper: marks the request so the general apiLimiter skips it
const markLimited = (req, res, next) => { req._rateLimitApplied = true; next(); };

// Cache headers for public GET list/detail endpoints (browser 60s, CDN 120s)
const publicCacheHeaders = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  res.set("Vary", "Accept-Encoding");
  next();
};

// ── Apply specific limiters FIRST (before general fallback) ───────
// Auth
app.use("/api/v1/auth/login", markLimited, authLimiter);
app.use("/api/v1/auth/refresh", markLimited, authLimiter);
app.use("/api/v1/predictor/auth/login", markLimited, authLimiter);
app.use("/api/v1/predictor/auth/refresh", markLimited, authLimiter);

// Enquiry — strict limiter only on POST (contact form), admin reads use general limiter
app.post("/api/v1/enquiries", markLimited, enquiryLimiter);

// Public GET content routes — rate limit + cache headers (GET only)
const publicGetPaths = [
  "/api/v1/countries",
  "/api/v1/universities",
  "/api/v1/blogs",
  "/api/v1/blog-categories",
  "/api/v1/faqs",
  "/api/v1/home-settings",
  "/api/v1/about-settings",
  "/api/v1/predictor/metadata",
];
publicGetPaths.forEach((routePath) => {
  const middlewares = [markLimited, publicReadLimiter];

  // FAQ responses are used by admin immediately after mutations.
  // Keep them uncached to prevent stale list/detail reads.
  if (routePath === "/api/v1/faqs") {
    app.get(routePath, ...middlewares);
    app.get(`${routePath}/:slug`, ...middlewares);
    return;
  }

  app.get(routePath, ...middlewares, publicCacheHeaders);
  app.get(`${routePath}/:slug`, ...middlewares, publicCacheHeaders);
});

// General fallback limiter for all other /api/v1 routes (admin, media, etc.)
app.use("/api/v1", apiLimiter);

app.get("/api/v1", (req, res) => {
  res.json({
    message: "AMW Career Point API v1",
    endpoints: {
      auth: "/api/v1/auth",
      countries: "/api/v1/countries",
      universities: "/api/v1/universities",
      blogs: "/api/v1/blogs",
      blogCategories: "/api/v1/blog-categories",
      enquiries: "/api/v1/enquiries",
      media: "/api/v1/media",
      faqs: "/api/v1/faqs",
      homeSettings: "/api/v1/home-settings",
      aboutSettings: "/api/v1/about-settings",
      predictorMetadata: "/api/v1/predictor/metadata",
      predictorAuth: "/api/v1/predictor/auth",
      predictor: "/api/v1/predictor",
    },
  });
});

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/countries", countryRoutes);
app.use("/api/v1/universities", universityRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/blog-categories", blogCategoryRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/home-settings", homeSettingsRoutes);
app.use("/api/v1/about-settings", aboutSettingsRoutes);
app.use("/api/v1/predictor/metadata", predictorMetadataRoutes);
app.use("/api/v1/predictor/auth", predictorAuthRoutes);
app.use("/api/v1/predictor", predictorRoutes);

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      const publicBase = process.env.BASE_URL || `http://localhost:${PORT}`;
      console.log(`🚀 AMW Career Point API running on port ${PORT}`);
      console.log(`📦 Public API : ${publicBase}/api/v1`);
      console.log(`📁 Public Uploads: ${publicBase}/uploads`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    app.locals.dbReady = false;
    app.listen(PORT, () => {
      const publicBase = process.env.BASE_URL || `http://localhost:${PORT}`;
      console.log(`AMW Career Point API running without MongoDB on port ${PORT}`);
      console.log(`Public API : ${publicBase}/api/v1`);
    });
  }
}

startServer();

// ── Prevent silent crashes ────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  console.error(err.stack);
  // Don't exit — keep server running
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  // Don't exit — keep server running
});
