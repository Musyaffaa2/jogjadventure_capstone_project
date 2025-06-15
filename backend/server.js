// server.js

// Load environment variables PERTAMA KALI
require('dotenv').config();

// Baru import modules lainnya
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const destinationRoutes = require('./routes/destinations');
const authRoutes = require('./routes/auth');
const profileRoutes = require("./routes/profile");

// Validasi environment variables yang penting
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Daftar domain yang diizinkan
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite default port
      'http://localhost:3001', // React alternative port
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);

    // Izinkan requests tanpa origin (mobile apps, Postman, dll) di development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Penting untuk cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Trust proxy jika menggunakan reverse proxy (Nginx, load balancer, dll)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable jika ada masalah dengan embedding
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 requests per IP per window
  message: {
    success: false,
    error: 'Terlalu banyak request, coba lagi dalam 15 menit'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting khusus untuk auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 attempts per IP per window
  message: {
    success: false,
    error: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS Configuration


// Cookie Parser (untuk refresh tokens)
app.use(cookieParser());

// Body Parser Middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON format'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Request logging middleware (untuk development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// MongoDB Connection dengan retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Hapus options deprecated, gunakan yang minimal saja
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Connect to database
connectDB();

// Routes dengan prefix yang konsisten
app.use('/api/destinations', destinationRoutes);
// app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Health check dengan informasi lebih lengkap
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'Tourism API is running!',
    timestamp: Date.now(),
    status: 'OK',
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  };

  res.json(healthcheck);
});

// API Documentation endpoint (opsional)
app.get('/api', (req, res) => {
  res.json({
    message: 'Jogja Adventure Tourism API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      destinations: '/api/destinations',
      profile: '/api/profile',
      health: '/api/health'
    },
    documentation: 'Coming soon...'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: errors.join(', ')
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed'
    });
  }

  // Default error response
  res.status(err.status || 500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler untuk semua routes yang tidak ditemukan
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('💾 MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('💾 MongoDB connection closed.');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;