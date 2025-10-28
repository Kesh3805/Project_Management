const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const GitHubService = require('../services/githubService');
const User = require('../models/User');
const Task = require('../models/TaskModel');

// @route   GET /api/github/repos
// @desc    Get user's GitHub repositories
// @access  Private
router.get('/repos', protect, async (req, res) => {
  try {
    console.log('📂 Fetching GitHub repos for user:', req.user.username);
    
    if (!req.user.accessToken) {
      console.error('❌ No GitHub access token found for user');
      return res.status(401).json({
        success: false,
        message: 'GitHub access token not found. Please re-authenticate with GitHub.'
      });
    }

    const githubService = new GitHubService(req.user.accessToken);
    const repos = await githubService.getUserRepos();

    console.log(`✓ Fetched ${repos.length} repositories`);

    res.json({
      success: true,
      count: repos.length,
      data: repos
    });
  } catch (error) {
    console.error('❌ Error fetching repositories:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching repositories',
      error: error.message
    });
  }
});

// @route   POST /api/github/repos
// @desc    Create a new GitHub repository
// @access  Private
router.post('/repos', protect, async (req, res) => {
  try {
    console.log('🆕 Creating GitHub repository for user:', req.user.username);
    
    if (!req.user.accessToken) {
      console.error('❌ No GitHub access token found for user');
      return res.status(401).json({
        success: false,
        message: 'GitHub access token not found. Please re-authenticate with GitHub.'
      });
    }

    const { name, description, private: isPrivate, auto_init } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Repository name is required'
      });
    }

    // Validate repository name (GitHub requirements)
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Repository name can only contain alphanumeric characters, hyphens, underscores, and periods'
      });
    }

    const githubService = new GitHubService(req.user.accessToken);
    const repoData = {
      name,
      description: description || '',
      private: isPrivate || false,
      auto_init: auto_init !== undefined ? auto_init : true
    };

    const repository = await githubService.createRepository(repoData);

    console.log(`✓ Created repository: ${repository.full_name}`);

    res.status(201).json({
      success: true,
      message: 'Repository created successfully',
      data: repository
    });
  } catch (error) {
    console.error('❌ Error creating repository:', error.message);
    
    // Handle specific GitHub API errors
    let statusCode = 500;
    let message = 'Error creating repository';
    
    if (error.message.includes('name already exists')) {
      statusCode = 409;
      message = 'A repository with this name already exists';
    } else if (error.message.includes('validation failed')) {
      statusCode = 422;
      message = 'Invalid repository data';
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message
    });
  }
});

// @route   POST /api/github/repos/connect
// @desc    Connect a repository to user account
// @access  Private
router.post('/repos/connect', protect, async (req, res) => {
  try {
    const { repoId, name, fullName, url, defaultBranch, isPrivate } = req.body;

    if (!repoId || !name || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide repository details'
      });
    }

    const repoData = {
      id: repoId,
      name,
      fullName,
      url,
      defaultBranch: defaultBranch || 'main',
      private: isPrivate || false
    };

    await req.user.addRepo(repoData);

    res.json({
      success: true,
      message: 'Repository connected successfully',
      data: repoData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error connecting repository',
      error: error.message
    });
  }
});

// @route   DELETE /api/github/repos/:repoId
// @desc    Disconnect a repository
// @access  Private
router.delete('/repos/:repoId', protect, async (req, res) => {
  try {
    const repoId = parseInt(req.params.repoId);
    await req.user.removeRepo(repoId);

    res.json({
      success: true,
      message: 'Repository disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error disconnecting repository',
      error: error.message
    });
  }
});

// @route   GET /api/github/repos/:owner/:repo/commits
// @desc    Get commits from a repository
// @access  Private
router.get('/repos/:owner/:repo/commits', protect, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { branch = 'main', limit = 10 } = req.query;

    const githubService = new GitHubService(req.user.accessToken);
    const commits = await githubService.getCommits(owner, repo, branch, limit);

    res.json({
      success: true,
      count: commits.length,
      data: commits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching commits',
      error: error.message
    });
  }
});

// @route   POST /api/github/repos/sync-commits
// @desc    Sync latest commits for a task's repository
// @access  Private
router.post('/repos/sync-commits', protect, async (req, res) => {
  try {
    const { taskId, limit = 5 } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    // Find the task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!task.repo) {
      return res.status(400).json({
        success: false,
        message: 'Task is not linked to a GitHub repository'
      });
    }

    // Parse owner and repo from full_name (e.g., "owner/repo")
    const [owner, repo] = task.repo.split('/');
    const branch = task.branch || 'main';

    const githubService = new GitHubService(req.user.accessToken);
    const commits = await githubService.getCommits(owner, repo, branch, limit);

    if (commits.length > 0) {
      // Update latest commit
      task.latestCommit = commits[0];
      
      // Add to commit history (avoid duplicates)
      commits.forEach(commit => {
        const exists = task.commitHistory.some(c => c.sha === commit.sha);
        if (!exists) {
          task.commitHistory.unshift({
            ...commit,
            syncedAt: new Date()
          });
        }
      });

      // Keep only last 20 commits in history
      if (task.commitHistory.length > 20) {
        task.commitHistory = task.commitHistory.slice(0, 20);
      }

      task.lastSyncedAt = new Date();
      await task.save();

      res.json({
        success: true,
        message: `Synced ${commits.length} commits`,
        data: {
          latestCommit: task.latestCommit,
          commitCount: task.commitHistory.length,
          lastSyncedAt: task.lastSyncedAt
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No commits found',
        data: {
          latestCommit: null,
          commitCount: 0
        }
      });
    }
  } catch (error) {
    console.error('❌ Error syncing commits:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error syncing commits',
      error: error.message
    });
  }
});

// @route   GET /api/github/repos/:owner/:repo/pulls
// @desc    Get pull requests from a repository
// @access  Private
router.get('/repos/:owner/:repo/pulls', protect, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open', limit = 10 } = req.query;

    const githubService = new GitHubService(req.user.accessToken);
    const pullRequests = await githubService.getPullRequests(owner, repo, state, limit);

    res.json({
      success: true,
      count: pullRequests.length,
      data: pullRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pull requests',
      error: error.message
    });
  }
});

// @route   GET /api/github/repos/:owner/:repo/branches
// @desc    Get branches from a repository
// @access  Private
router.get('/repos/:owner/:repo/branches', protect, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const githubService = new GitHubService(req.user.accessToken);
    const branches = await githubService.getBranches(owner, repo);

    res.json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching branches',
      error: error.message
    });
  }
});

// @route   POST /api/github/webhook
// @desc    Handle GitHub webhook events
// @access  Public (GitHub webhooks)
router.post('/webhook', async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`📬 GitHub Webhook: ${event}`);

    // Handle push events
    if (event === 'push') {
      const commits = payload.commits || [];
      const repo = payload.repository.full_name;

      for (const commit of commits) {
        const message = commit.message;
        const taskId = GitHubService.parseTaskId(message);
        const status = GitHubService.parseStatus(message);

        if (taskId) {
          // Find and update task
          const task = await Task.findOne({ taskId });

          if (task) {
            if (status) {
              task.status = status;
              task.lastUpdatedBy = commit.author.username || commit.author.name;
            }

            await task.save();

            console.log(`✓ Updated ${taskId} - Status: ${status || 'unchanged'}`);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

module.exports = router;
