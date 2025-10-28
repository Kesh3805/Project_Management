const axios = require('axios');

class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.github.com';
  }

  // Get authenticated user's repositories
  async getUserRepos() {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: {
          Authorization: `token ${this.accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          sort: 'updated',
          per_page: 100,
          affiliation: 'owner,collaborator'
        }
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url
        },
        description: repo.description,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        private: repo.private,
        archived: repo.archived,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at
      }));
    } catch (error) {
      console.error('GitHub API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch repositories: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get commits from a repository
  async getCommits(owner, repo, branch = 'main', limit = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/commits`,
        {
          headers: {
            Authorization: `token ${this.accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          },
          params: {
            sha: branch,
            per_page: limit
          }
        }
      );

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }
  }

  // Get pull requests from a repository
  async getPullRequests(owner, repo, state = 'open', limit = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/pulls`,
        {
          headers: {
            Authorization: `token ${this.accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          },
          params: {
            state: state,
            per_page: limit
          }
        }
      );

      return response.data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        createdAt: pr.created_at,
        url: pr.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to fetch pull requests: ${error.message}`);
    }
  }

  // Get branches from a repository
  async getBranches(owner, repo) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/branches`,
        {
          headers: {
            Authorization: `token ${this.accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data.map(branch => ({
        name: branch.name,
        protected: branch.protected
      }));
    } catch (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
  }

  // Create a new GitHub repository
  async createRepository(repoData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/user/repos`,
        {
          name: repoData.name,
          description: repoData.description || '',
          private: repoData.private || false,
          auto_init: repoData.auto_init || true,
          has_issues: true,
          has_projects: true,
          has_wiki: true
        },
        {
          headers: {
            Authorization: `token ${this.accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      return {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        owner: {
          login: response.data.owner.login,
          avatar_url: response.data.owner.avatar_url
        },
        description: response.data.description,
        html_url: response.data.html_url,
        default_branch: response.data.default_branch || 'main',
        private: response.data.private,
        created_at: response.data.created_at
      };
    } catch (error) {
      console.error('GitHub API Error:', error.response?.data || error.message);
      throw new Error(`Failed to create repository: ${error.response?.data?.message || error.message}`);
    }
  }

  // Parse commit message for task IDs
  static parseTaskId(commitMessage) {
    // Match patterns like TASK-123, #TASK-123, task-123, etc.
    const patterns = [
      /TASK-(\d+)/i,
      /#TASK-(\d+)/i,
      /task-(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = commitMessage.match(pattern);
      if (match) {
        return `TASK-${match[1].padStart(3, '0')}`;
      }
    }

    return null;
  }

  // Parse commit message for status keywords
  static parseStatus(commitMessage) {
    const message = commitMessage.toLowerCase();
    
    if (message.includes('completed') || message.includes('done') || message.includes('finished')) {
      return 'Completed';
    } else if (message.includes('in progress') || message.includes('working on')) {
      return 'InProgress';
    }
    
    return null;
  }
}

module.exports = GitHubService;
