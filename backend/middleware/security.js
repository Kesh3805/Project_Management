/**
 * Security Middleware
 * Implements security best practices
 */

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { config } = require('../config/config');

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", config.frontendUrl],
    },
  },
  crossOriginEmbedderPolicy: !config.isDev,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// MongoDB query injection prevention
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key, req }) => {
    console.warn(`Sanitized key "${key}" in request from ${req.ip}`);
  },
});

// XSS prevention
const xssClean = xss();

// HTTP Parameter Pollution prevention
const hppConfig = hpp({
  whitelist: [
    'status',
    'priority',
    'assignee',
    'labels',
    'sort',
    'page',
    'limit',
  ],
});

// Request size limiter middleware
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);
    const maxBytes = parseSize(maxSize);
    
    if (contentLength && contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: `Request too large. Maximum size is ${maxSize}`,
      });
    }
    next();
  };
};

// Parse size string to bytes
function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'b';
  return value * units[unit];
}

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/\/)/,
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  const isSuspicious =
    Object.values(req.query).some(checkValue) ||
    Object.values(req.params).some(checkValue);

  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious request from ${req.ip}: ${req.method} ${req.originalUrl}`);
  }

  next();
};

module.exports = {
  helmetConfig,
  mongoSanitizeConfig,
  xssClean,
  hppConfig,
  requestSizeLimiter,
  securityLogger,
};
