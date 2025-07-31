const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = 'morgan';
const compression = require('compression');
const path = require('path');
const { validationResult } = require('express-validator');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com", "https://via.placeholder.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increased slightly for better UX during development/testing
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many checkout attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to specific routes
app.use('/api/auth', authLimiter);
app.use('/api/cart/checkout', checkoutLimiter);
app.use('/api/', generalLimiter); // Apply general limiter after specific ones

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Total-Count'],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(require('morgan')('dev'));
} else {
  app.use(require('morgan')('combined'));
}

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// --- API Routes ---

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// --- Error Handling ---

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  res.status(err.status || 500).json(errorResponse);
});


// --- Server and Database Connection ---

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // The Mongoose connect method returns a promise. We await it to ensure connection.
    // Deprecated options like `useNewUrlParser` are no longer needed in Mongoose 6+.
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roys-elegance');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Function to start the server
const startServer = async () => {
  // First, connect to the database
  await connectDB();

  // Then, start the Express server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Roy's Elegance Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown handling
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
};

// Execute the server start
startServer();

module.exports = app;
