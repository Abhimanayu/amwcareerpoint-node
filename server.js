require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const path      = require("path");
const rateLimit = require("express-rate-limit");

const connectDB      = require("./src/config/db");
const errorHandler   = require("./src/middleware/errorHandler");

// ── Routes ────────────────────────────────────────────────────────
const authRoutes         = require("./src/routes/auth.routes");
const countryRoutes      = require("./src/routes/country.routes");
const universityRoutes   = require("./src/routes/university.routes");
const blogRoutes         = require("./src/routes/blog.routes");
const blogCategoryRoutes = require("./src/routes/blogCategory.routes");
const enquiryRoutes      = require("./src/routes/enquiry.routes");
const mediaRoutes        = require("./src/routes/media.routes");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin:         process.env.CORS_ORIGIN || "*",
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Rate limiter — 200 requests per 15 min per IP ─────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) =>
    res.status(429).json({
      error: { code: "RATE_LIMITED", message: "Too many requests, please try again later" },
    }),
});
app.use("/api/v1", limiter);

// ── Health Check ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "AMW Career Point API",
    version: "1.0.0",
    baseUrl: `http://localhost:${PORT}/api/v1`,
    status:  "running",
  });
});

app.get("/api/v1", (req, res) => {
  res.json({
    message: "AMW Career Point API v1",
    endpoints: {
      auth:           "/api/v1/auth",
      countries:      "/api/v1/countries",
      universities:   "/api/v1/universities",
      blogs:          "/api/v1/blogs",
      blogCategories: "/api/v1/blog-categories",
      enquiries:      "/api/v1/enquiries",
      media:          "/api/v1/media",
    },
  });
});

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/v1/auth",            authRoutes);
app.use("/api/v1/countries",       countryRoutes);
app.use("/api/v1/universities",    universityRoutes);
app.use("/api/v1/blogs",           blogRoutes);
app.use("/api/v1/blog-categories", blogCategoryRoutes);
app.use("/api/v1/enquiries",       enquiryRoutes);
app.use("/api/v1/media",           mediaRoutes);

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found` },
  });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 AMW Career Point API running on http://localhost:${PORT}`);
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
