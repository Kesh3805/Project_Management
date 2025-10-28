const express = require('express');
const router = express.Router();
const passport = require('passport');
const { sendTokenResponse } = require('../middleware/auth');

// @route   GET /api/auth/github
// @desc    Redirect to GitHub OAuth
// @access  Public
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email', 'repo'] 
}));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate token
    const { generateToken } = require('../middleware/auth');
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token using HTML page to ensure it works
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Send HTML that redirects and stores token
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
      </head>
      <body>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
          <h2>✓ Authentication Successful</h2>
          <p>Redirecting to dashboard...</p>
          <div style="margin: 20px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          // Store token and redirect
          window.location.href = '${frontendUrl}?token=${token}';
        </script>
      </body>
      </html>
    `);
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      githubId: req.user.githubId,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      repos: req.user.repos,
      lastLogin: req.user.lastLogin
    };

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', require('../middleware/auth').protect, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

module.exports = router;
