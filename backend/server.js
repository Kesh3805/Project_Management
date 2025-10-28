const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport')(passport);

// Routes
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const githubRoutes = require('./routes/githubRoutes');

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MERN Project Management Dashboard API',
    version: '2.0.0',
    features: {
      authentication: 'GitHub OAuth',
      database: 'MongoDB',
      github_integration: 'Enabled'
    },
    endpoints: {
      auth: {
        'GET /api/auth/github': 'Login with GitHub',
        'GET /api/auth/me': 'Get current user',
        'POST /api/auth/logout': 'Logout'
      },
      tasks: {
        'GET /api/tasks': 'Get all tasks',
        'GET /api/tasks/:id': 'Get task by ID',
        'POST /api/tasks': 'Create new task',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task'
      },
      github: {
        'GET /api/github/repos': 'Get user repositories',
        'POST /api/github/repos/connect': 'Connect repository',
        'GET /api/github/repos/:owner/:repo/commits': 'Get commits',
        'GET /api/github/repos/:owner/:repo/pulls': 'Get pull requests',
        'POST /api/github/webhook': 'GitHub webhook handler'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
