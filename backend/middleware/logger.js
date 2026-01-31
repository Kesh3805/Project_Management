/**
 * Logging Middleware
 * Production-ready request logging and monitoring
 */

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { config } = require('../config/config');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom tokens
morgan.token('user-id', (req) => req.user?.id || 'anonymous');
morgan.token('request-id', (req) => req.headers['x-request-id'] || '-');
morgan.token('user-agent-short', (req) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return ua.substring(0, 20);
});

// Custom log format for production
const productionFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent-short" :response-time ms';

// Development format (colorized)
const developmentFormat = ':method :url :status :response-time ms - :res[content-length]';

// Create access log stream for file logging
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Create error log stream
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Request logger for development
const devLogger = morgan(developmentFormat, {
  skip: (req, res) => req.path === '/health' || req.path === '/api/health',
});

// Request logger for production (console)
const prodConsoleLogger = morgan(productionFormat, {
  skip: (req, res) => req.path === '/health' || req.path === '/api/health',
});

// Request logger for production (file)
const prodFileLogger = morgan(productionFormat, {
  stream: accessLogStream,
  skip: (req, res) => req.path === '/health' || req.path === '/api/health',
});

// Error logger (file)
const errorLogger = morgan(productionFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400,
});

// Custom application logger
const appLogger = {
  info: (message, data = {}) => {
    const log = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...data,
    };
    console.log(JSON.stringify(log));
  },

  warn: (message, data = {}) => {
    const log = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...data,
    };
    console.warn(JSON.stringify(log));
  },

  error: (message, error = null, data = {}) => {
    const log = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || null,
      stack: error?.stack || null,
      ...data,
    };
    console.error(JSON.stringify(log));
    
    // Also write to error log file
    fs.appendFileSync(
      path.join(logsDir, 'error.log'),
      JSON.stringify(log) + '\n'
    );
  },

  debug: (message, data = {}) => {
    if (config.isDev) {
      const log = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...data,
      };
      console.debug(JSON.stringify(log));
    }
  },
};

// Request ID middleware
const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Response time tracking
const responseTimeMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      appLogger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });
  
  next();
};

// Get appropriate logger based on environment
const getRequestLogger = () => {
  if (config.isDev) {
    return devLogger;
  }
  return prodConsoleLogger;
};

module.exports = {
  devLogger,
  prodConsoleLogger,
  prodFileLogger,
  errorLogger,
  appLogger,
  requestIdMiddleware,
  responseTimeMiddleware,
  getRequestLogger,
};
