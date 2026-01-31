import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GitHubActivityPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [allRepos, setAllRepos] = useState([]);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalCommits: 0,
    syncedRepos: 0,
    lastSync: null
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all GitHub repos from user's account
      const reposResponse = await api.get('/github/repos');
      const githubRepos = reposResponse.data.data || [];
      setAllRepos(githubRepos);
      
      // Fetch synced tasks
      const tasksResponse = await api.get('/tasks');
      const allTasks = tasksResponse.data.success ? tasksResponse.data.data : [];
      const githubTasks = allTasks.filter(task => task.repo);
      setTasks(githubTasks);
      
      // Calculate stats
      const totalCommits = githubTasks.reduce((sum, task) => 
        sum + (task.commitHistory?.length || 0), 0
      );
      
      const lastSyncDates = githubTasks
        .map(task => task.lastSyncedAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a));
      
      setStats({
        totalRepos: githubRepos.length,
        totalCommits,
        syncedRepos: githubTasks.length,
        lastSync: lastSyncDates[0] || null
      });

      // Fetch recent activity from all repos
      await fetchRecentActivity(githubRepos.slice(0, 10)); // Get activity from first 10 repos
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async (repos) => {
    if (repos.length === 0) return;
    
    try {
      setLoadingActivity(true);
      const allActivity = [];

      // Fetch commits from each repo (limit to avoid rate limits)
      for (const repo of repos) {
        try {
          const [owner, repoName] = repo.full_name.split('/');
          const commitResponse = await api.get(`/github/repos/${owner}/${repoName}/commits`, {
            params: { branch: repo.default_branch || 'main', limit: 5 }
          });
          
          if (commitResponse.data.success) {
            const commits = commitResponse.data.data || [];
            commits.forEach(commit => {
              allActivity.push({
                type: 'commit',
                repo: repo.full_name,
                repoName: repo.name,
                repoPrivate: repo.private,
                repoLanguage: repo.language,
                ...commit
              });
            });
          }
        } catch (error) {
          console.warn(`Could not fetch commits for ${repo.full_name}:`, error.message);
        }
      }
      
      // Sort by date (newest first)
      allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivity(allActivity.slice(0, 100)); // Show last 100 activities
      
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const syncTaskCommits = async (taskId) => {
    try {
      await api.post('/github/repos/sync-commits', { taskId });
      await fetchAllData(); // Refresh all data
    } catch (error) {
      console.error('Error syncing commits:', error);
    }
  };

  const refreshActivity = async () => {
    setLoadingActivity(true);
    await fetchRecentActivity(allRepos.slice(0, 10));
    setLoadingActivity(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRepoName = (fullName) => {
    return fullName?.split('/')[1] || fullName;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              GitHub Activity Dashboard
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              Monitor all your GitHub repositories and their activities
            </p>
          </div>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh All'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{stats.totalRepos}</div>
            <div className="text-sm text-gray-600">Total Repos</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{stats.syncedRepos}</div>
            <div className="text-sm text-gray-600">Synced as Tasks</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{activity.length}</div>
            <div className="text-sm text-gray-600">Recent Commits</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">
              {stats.lastSync ? formatDate(stats.lastSync) : 'Never'}
            </div>
            <div className="text-sm text-gray-600">Last Task Sync</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
            activeTab === 'activity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab('repositories')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
            activeTab === 'repositories'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Repositories
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading GitHub activity...</p>
          </div>
        ) : allRepos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No GitHub Repositories Found</h3>
            <p className="text-gray-500 mb-4">Connect your GitHub account or create repositories to see activity</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">All Your Repositories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allRepos.slice(0, 12).map((repo) => {
                      const syncedTask = tasks.find(t => t.repo === repo.full_name);
                      
                      return (
                        <div
                          key={repo.id}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            syncedTask 
                              ? 'border-green-300 bg-green-50 hover:border-green-400 hover:shadow-md' 
                              : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 flex items-center">
                                <span className="mr-2">{repo.private ? '�' : '�'}</span>
                                {repo.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">{repo.full_name}</p>
                            </div>
                            {syncedTask && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                ✓ Synced
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                            {repo.description || 'No description'}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="flex items-center">⭐ {repo.stargazers_count || 0}</span>
                            <span className="flex items-center">🍴 {repo.forks_count || 0}</span>
                            {repo.language && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {repo.language}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">🌿 {repo.default_branch || 'main'}</span>
                            <span className="text-gray-400">
                              Updated {formatDate(repo.updated_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Feed Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recent Commits Across All Repositories
                  </h3>
                  <button
                    onClick={refreshActivity}
                    disabled={loadingActivity}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                  >
                    {loadingActivity ? '⟳ Loading...' : '🔄 Refresh Activity'}
                  </button>
                </div>
                
                {loadingActivity ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading commit activity...</p>
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-500">No commit activity found</p>
                    <p className="text-sm text-gray-400 mt-2">Push some commits to your repositories</p>
                  </div>
                ) : (
                  activity.map((item, index) => (
                    <div
                      key={`${item.sha}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                          📝
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-800">{item.repoName}</span>
                              {item.repoPrivate && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Private
                                </span>
                              )}
                              {item.repoLanguage && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {item.repoLanguage}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                          </div>
                          
                          <p className="text-gray-700 font-medium mb-2">
                            {item.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>👤 {item.author}</span>
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {item.sha?.substring(0, 7)}
                              </span>
                            </div>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View on GitHub →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Repositories Tab */}
            {activeTab === 'repositories' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  All GitHub Repositories ({allRepos.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {allRepos.map((repo) => {
                    const syncedTask = tasks.find(t => t.repo === repo.full_name);
                    
                    return (
                      <div
                        key={repo.id}
                        className={`border-2 rounded-lg p-5 transition-all ${
                          syncedTask 
                            ? 'border-green-300 bg-green-50 hover:border-green-400 hover:shadow-lg' 
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{repo.private ? '🔒' : '📖'}</span>
                              <div>
                                <h4 className="text-lg font-bold text-gray-800">{repo.full_name}</h4>
                                {repo.archived && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded mt-1 inline-block">
                                    Archived
                                  </span>
                                )}
                              </div>
                              {syncedTask && (
                                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                                  ✓ Synced as Task
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">
                              {repo.description || 'No description available'}
                            </p>

                            <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 mb-3">
                              {repo.language && (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                  {repo.language}
                                </span>
                              )}
                              <span>⭐ {repo.stargazers_count || 0} stars</span>
                              <span>🍴 {repo.forks_count || 0} forks</span>
                              <span>🌿 {repo.default_branch || 'main'}</span>
                              <span>📅 Updated {formatDate(repo.updated_at)}</span>
                            </div>

                            {syncedTask?.latestCommit && (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-gray-700">Latest Synced Commit</span>
                                  <span className="text-xs text-gray-500">{formatDate(syncedTask.latestCommit.date)}</span>
                                </div>
                                <p className="text-sm text-gray-800 font-medium mb-2">
                                  {syncedTask.latestCommit.message}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">👤 {syncedTask.latestCommit.author}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                      {syncedTask.latestCommit.sha?.substring(0, 7)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View on GitHub →
                              </a>
                              {syncedTask && (
                                <button
                                  onClick={() => syncTaskCommits(syncedTask._id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                  🔄 Sync Commits
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubActivityPanel;
