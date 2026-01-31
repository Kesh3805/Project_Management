/**
 * MERN Project Management Dashboard - Backend Server
 * Production-ready Express.js application
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const compression = require('compression');
const MongoStore = require('connect-mongo');

// Load environment variables first
dotenv.config();

// Import configuration
const { config, validateEnv } = require('./config/config');

// Validate environment in production
if (config.isProd) {
  validateEnv();
}

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const { helmetConfig, mongoSanitizeConfig, xssClean, hppConfig, securityLogger } = require('./middleware/security');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { getRequestLogger, requestIdMiddleware, responseTimeMiddleware, prodFileLogger, errorLogger, appLogger } = require('./middleware/logger');

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const githubRoutes = require('./routes/githubRoutes');
const commentRoutes = require('./routes/commentRoutes');
const labelRoutes = require('./routes/labelRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Import background job service
const { initializeJobs, stopAllJobs } = require('./services/jobService');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
if (config.isProd) {
  app.set('trust proxy', 1);
}

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet - Security headers
app.use(helmetConfig);

// Request ID for tracking
app.use(requestIdMiddleware);

// Response time tracking
app.use(responseTimeMiddleware);

// Security logging
app.use(securityLogger);

// ===========================================
// CORS CONFIGURATION
// ===========================================

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.cors.origin;
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    if (config.isDev) {
      // In development, allow localhost variations
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
}));

// ===========================================
// REQUEST PARSING
// ===========================================

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB query injection prevention
app.use(mongoSanitizeConfig);

// XSS prevention
app.use(xssClean);

// HTTP Parameter Pollution prevention
app.use(hppConfig);

// ===========================================
// LOGGING
// ===========================================

// Request logging
app.use(getRequestLogger());

// File logging in production
if (config.isProd) {
  app.use(prodFileLogger);
  app.use(errorLogger);
}

// ===========================================
// SESSION CONFIGURATION
// ===========================================

const sessionConfig = {
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.database.uri,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native',
    crypto: {
      secret: config.session.secret,
    },
  }),
  cookie: {
    maxAge: config.session.maxAge,
    httpOnly: true,
    secure: config.isProd && config.security.cookieSecure,
    sameSite: config.security.cookieSameSite,
  },
  name: 'projecthub.sid', // Custom session name
};

app.use(session(sessionConfig));

// ===========================================
// PASSPORT AUTHENTICATION
// ===========================================

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// ===========================================
// STATIC FILES
// ===========================================

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend build in production
if (config.isProd) {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// ===========================================
// RATE LIMITING
// ===========================================

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Stricter rate limiting for auth routes
app.use('/api/auth', authLimiter);

// ===========================================
// API ROUTES
// ===========================================

// Health check routes (no auth required)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// ===========================================
// ROOT ENDPOINT
// ===========================================

app.get('/api', (req, res) => {
  res.json({
    message: 'MERN Project Management Dashboard API',
    version: '4.0.0',
    environment: config.env,
    documentation: '/api/docs',
    health: '/health/detailed',
    features: {
      authentication: 'GitHub OAuth',
      database: 'MongoDB',
      github_integration: 'Enabled',
      comments: 'Enabled',
      labels: 'Enabled',
      notifications: 'Enabled',
      search: 'Full-text search',
      bulk_actions: 'Enabled',
      dark_mode: 'Supported',
      file_uploads: 'Enabled',
      background_jobs: 'Enabled',
      email_notifications: 'Enabled',
      rate_limiting: 'Enabled',
      security: 'Helmet, XSS, CSRF protection',
    },
  });
});

// Root redirect
app.get('/', (req, res) => {
  if (config.isProd) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  } else {
    res.redirect('/api');
  }
});

// ===========================================
// SERVE FRONTEND (PRODUCTION)
// ===========================================

if (config.isProd) {
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = config.server.port;

const server = app.listen(PORT, config.server.host, () => {
  appLogger.info('Server started', {
    port: PORT,
    environment: config.env,
    nodeVersion: process.version,
  });
  
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 ProjectHub Server Running                             ║
║                                                            ║
║   URL:         http://localhost:${PORT}                     ║
║   Environment: ${config.env.padEnd(40)}║
║   API Docs:    http://localhost:${PORT}/api                 ║
║   Health:      http://localhost:${PORT}/health/detailed     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Initialize background jobs
  if (!config.isTest) {
    initializeJobs();
  }
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

const gracefulShutdown = (signal) => {
  appLogger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(() => {
    appLogger.info('HTTP server closed');
    
    // Stop background jobs
    stopAllJobs();
    
    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(false, () => {
      appLogger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    appLogger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  appLogger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  appLogger.error('Unhandled Rejection', reason);
});

module.exports = app;
