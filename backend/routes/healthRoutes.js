/**
 * Health Check Routes
 * Endpoints for monitoring and load balancer health checks
 */

const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const router = express.Router();
const { getJobStatus } = require('../services/jobService');

// Basic health check
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {},
  };

  // Database check
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    healthCheck.checks.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStates[dbState] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };

    if (dbState !== 1) {
      healthCheck.status = 'unhealthy';
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'unhealthy',
      error: error.message,
    };
    healthCheck.status = 'unhealthy';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

  healthCheck.checks.memory = {
    status: usedMemPercent < 90 ? 'healthy' : 'warning',
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    systemUsedPercent: `${usedMemPercent.toFixed(2)}%`,
  };

  // CPU check
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  
  healthCheck.checks.cpu = {
    status: loadAvg[0] < cpus.length * 0.8 ? 'healthy' : 'warning',
    cores: cpus.length,
    loadAverage: {
      '1min': loadAvg[0].toFixed(2),
      '5min': loadAvg[1].toFixed(2),
      '15min': loadAvg[2].toFixed(2),
    },
  };

  // Background jobs check
  try {
    healthCheck.checks.jobs = {
      status: 'healthy',
      ...getJobStatus(),
    };
  } catch (error) {
    healthCheck.checks.jobs = {
      status: 'unknown',
      error: error.message,
    };
  }

  // Set appropriate status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  
  if (dbReady) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: 'Database not connected' });
  }
});

// Metrics endpoint (basic)
router.get('/metrics', async (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
    system: {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length,
    },
  };

  // Add database stats if available
  try {
    if (mongoose.connection.readyState === 1) {
      const dbStats = await mongoose.connection.db.stats();
      metrics.database = {
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
      };
    }
  } catch (error) {
    metrics.database = { error: 'Unable to fetch database stats' };
  }

  res.json(metrics);
});

module.exports = router;
