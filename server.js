require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

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

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
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
  res.json({
    message: "AMW Career Point API",
    version: "1.0.0",
    baseUrl: `http://localhost:${PORT}/api/v1`,
    status: "running",
    uploadsUrl: `http://localhost:${PORT}/uploads`,
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

// ── Rate limiter — 200 requests per 15 min per IP ─────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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
app.use("/api/v1", limiter);

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
      console.log(
        `🚀 AMW Career Point API running on http://localhost:${PORT}`,
      );
      console.log(`📦 Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`📁 Uploads:  http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
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
