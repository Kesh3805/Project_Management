const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email', 'repo']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user data from GitHub profile
          const userData = {
            githubId: profile.id,
            username: profile.username || profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            accessToken: accessToken
          };

          // Find or create user
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            // Update existing user
            user.username = userData.username;
            user.email = userData.email || user.email;
            user.avatar = userData.avatar || user.avatar;
            user.accessToken = accessToken;
            await user.updateLastLogin();
          } else {
            // Create new user
            user = await User.create(userData);
          }

          return done(null, user);
        } catch (error) {
          console.error('GitHub OAuth Error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
