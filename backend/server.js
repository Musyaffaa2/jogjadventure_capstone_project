require("dotenv").config();

// Baru import modules lainnya
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Import routes
const destinationRoutes = require("./routes/destinations");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

// Validasi environment variables yang penting
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  process.exit(1);
}

const app = express();

// Konfigurasi CORS yang benar
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://jogjadventure-capstone-project-brown.vercel.app",
  "https://tourism-backend-production-83a3.up.railway.app"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // PERBAIKAN: Logging untuk debugging
    console.log('CORS Check - Origin:', origin);
    console.log('CORS Check - Allowed Origins:', allowedOrigins);
    
    // Izinkan requests tanpa origin (mobile apps, Postman, dll) di development
    if (!origin && process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS - Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('CORS - Origin NOT allowed:', origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Trust proxy jika menggunakan reverse proxy
app.set("trust proxy", 1);

// Security Middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Terlalu banyak request, coba lagi dalam 15 menit",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: "Terlalu banyak percobaan login, coba lagi dalam 15 menit",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use("/api", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Cookie Parser
app.use(cookieParser());

// Body Parser Middleware
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({
          success: false,
          error: "Invalid JSON format",
        });
        throw new Error("Invalid JSON");
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// PERBAIKAN 2: Request logging middleware yang lebih baik
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Minimal options untuk Mongoose 6+
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.log("❌ MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// Connect to database
connectDB();

// PERBAIKAN 3: Routes dengan logging
app.use("/api/destinations", (req, res, next) => {
  console.log(`Destination route: ${req.method} ${req.path}`);
  next();
}, destinationRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "Tourism API is running!",
    timestamp: Date.now(),
    status: "OK",
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    availableRoutes: [
      "/api/destinations",
      "/api/auth", 
      "/api/profile",
      "/api/health"
    ]
  };

  res.json(healthcheck);
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Jogja Adventure Tourism API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      destinations: "/api/destinations",
      profile: "/api/profile",
      health: "/api/health",
    },
    documentation: "Coming soon...",
  });
});

// PERBAIKAN 4: Test route untuk debugging
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
    origin: req.get('Origin'),
    headers: req.headers
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors.join(", "),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS: Origin not allowed",
      origin: req.get('Origin'),
      allowedOrigins: allowedOrigins
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /api/test",
      "GET /api/health", 
      "GET /api/destinations",
      "POST /api/auth/login",
      "POST /api/auth/register"
    ]
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("💾 MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("💾 MongoDB connection closed.");
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📍 Server URL: ${process.env.NODE_ENV === 'production' ? 'https://tourism-backend-production-83a3.up.railway.app' : `http://localhost:${PORT}`}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("🚨 Unhandled Promise Rejection:", err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;