// step-by-step-server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

console.log('🔍 Adding middleware step by step...');

// Step 0: Trust Proxy
console.log('Step 0: Trust proxy...');
app.set("trust proxy", 1);
console.log('✅ Trust proxy OK');

// Step 1: Basic middleware
console.log('Step 1: Basic middleware...');
app.use(cookieParser());

// JSON with verify function (SUSPECT!)
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
console.log('✅ Basic middleware with JSON verify OK');

// Step 2: CORS (SUSPECT)
console.log('Step 2: CORS...');
try {
  app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3001",
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        "https://your-app-name.onrender.com",
      ].filter(Boolean);

      if (!origin && process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  console.log('✅ CORS OK');
} catch (error) {
  console.error('❌ CORS Error:', error.message);
  process.exit(1);
}

// Step 3: Rate Limiting (SUSPECT)
console.log('Step 3: Rate limiting...');
try {
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

  app.use("/api", limiter);
  console.log('✅ General rate limiter OK');
  
  app.use("/api/auth/login", authLimiter);
  console.log('✅ Auth login limiter OK');
  
  app.use("/api/auth/register", authLimiter);
  console.log('✅ Auth register limiter OK');
  
} catch (error) {
  console.error('❌ Rate Limiting Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Step 3.5: Helmet (SUSPECT!)
console.log('Step 3.5: Helmet...');
try {
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
  console.log('✅ Helmet OK');
} catch (error) {
  console.error('❌ Helmet Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Step 3.6: Request Logging (SUSPECT!)
console.log('Step 3.6: Request logging...');
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}
console.log('✅ Request logging OK');

// Step 3.7: MongoDB Connection (SUSPECT!)
console.log('Step 3.7: MongoDB connection...');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {});
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Step 4: Routes
console.log('Step 4: Routes...');
try {
  const authRoutes = require("./routes/auth");
  const destinationRoutes = require("./routes/destinations");
  const profileRoutes = require("./routes/profile");

  app.use("/api/auth", authRoutes);
  app.use("/api/destinations", destinationRoutes);
  app.use("/api/profile", profileRoutes);
  
  console.log('✅ All routes OK');
} catch (error) {
  console.error('❌ Routes Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

const PORT = 4444;
app.listen(PORT, () => {
  console.log(`✅ Step-by-step server running on port ${PORT}`);
});