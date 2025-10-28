const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      sparse: true // GitHub may not provide email
    },
    avatar: {
      type: String
    },
    accessToken: {
      type: String,
      required: true
    },
    repos: [{
      id: Number,
      name: String,
      fullName: String,
      url: String,
      defaultBranch: String,
      private: Boolean,
      connectedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Add or update repository
userSchema.methods.addRepo = function(repoData) {
  const existingRepo = this.repos.find(r => r.id === repoData.id);
  
  if (existingRepo) {
    // Update existing
    Object.assign(existingRepo, repoData);
  } else {
    // Add new
    this.repos.push(repoData);
  }
  
  return this.save();
};

// Remove repository
userSchema.methods.removeRepo = function(repoId) {
  this.repos = this.repos.filter(r => r.id !== repoId);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
