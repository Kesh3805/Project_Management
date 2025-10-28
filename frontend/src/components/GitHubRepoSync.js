import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GitHubRepoSync = ({ onRepoSynced }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncedRepos, setSyncedRepos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGitHubRepos();
  }, []);

  const fetchGitHubRepos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching GitHub repos...');
      
      const response = await api.get('/github/repos');
      console.log('GitHub repos response:', response.data);
      
      if (response.data.success) {
        const repoData = response.data.data || [];
        console.log(`Fetched ${repoData.length} repositories`);
        setRepos(repoData);
      } else {
        setError('Failed to fetch repositories');
      }
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch GitHub repositories';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const syncRepoAsTask = async (repo) => {
    try {
      setSyncing(true);
      
      // First, get the latest commit for this repo
      let latestCommit = null;
      try {
        const [owner, repoName] = repo.full_name.split('/');
        const commitResponse = await api.get(`/github/repos/${owner}/${repoName}/commits`, {
          params: { branch: repo.default_branch || 'main', limit: 1 }
        });
        
        if (commitResponse.data.success && commitResponse.data.data.length > 0) {
          latestCommit = commitResponse.data.data[0];
          console.log('Latest commit:', latestCommit);
        }
      } catch (commitError) {
        console.warn('Could not fetch commit info:', commitError.message);
        // Continue anyway, commit info is optional
      }

      // Create task from repository
      const taskData = {
        title: `[GitHub] ${repo.name}`,
        description: repo.description || `GitHub repository: ${repo.full_name}`,
        priority: repo.private ? 'High' : 'Medium',
        status: repo.archived ? 'Completed' : 'Pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        assignee: repo.owner.login,
        repo: repo.full_name,
        repoId: repo.id,
        branch: repo.default_branch || 'main',
        latestCommit: latestCommit,
        lastSyncedAt: new Date().toISOString()
      };

      console.log('Syncing repo as task:', taskData);
      const response = await api.post('/tasks', taskData);
      
      if (response.data.success) {
        setSyncedRepos([...syncedRepos, repo.id]);
        console.log('Repo synced successfully:', repo.name);
        if (onRepoSynced) onRepoSynced(response.data.data);
        return true;
      }
    } catch (error) {
      console.error('Error syncing repo as task:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message;
      setError(`Failed to sync ${repo.name}: ${errorMsg}`);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const syncAllRepos = async () => {
    setSyncing(true);
    let successCount = 0;
    
    for (const repo of repos) {
      if (!syncedRepos.includes(repo.id)) {
        const success = await syncRepoAsTask(repo);
        if (success) successCount++;
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setSyncing(false);
    alert(`Successfully synced ${successCount} repositories as tasks!`);
  };

  const isRepoSynced = (repoId) => syncedRepos.includes(repoId);

  if (loading) {
    return (
      <div className="glass-dark backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center scale-in border border-white/10">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-white text-lg font-medium">Loading GitHub repositories...</p>
      </div>
    );
  }

  return (
    <div className="glass-dark backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 scale-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-white/30">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <span>GitHub Repository Sync</span>
            </h2>
            <p className="text-white/90 mt-2 ml-16">
              Import your GitHub repositories as tasks
            </p>
          </div>
          <button
            onClick={syncAllRepos}
            disabled={syncing || repos.length === 0}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2 border border-white/30 shadow-lg hover:shadow-xl"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white"></div>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sync All Repos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/10 px-8 py-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center bg-white p-4 rounded-xl border border-gray-200 shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-1">{repos.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Repos</div>
          </div>
          <div className="text-center bg-white p-4 rounded-xl border border-gray-200 shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-1">{syncedRepos.length}</div>
            <div className="text-sm text-gray-600 font-medium">Synced</div>
          </div>
          <div className="text-center bg-white p-4 rounded-xl border border-gray-200 shadow-md">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {repos.filter(r => r.private).length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Private</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-8 mt-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 backdrop-blur-sm rounded-xl px-5 py-4">
          <div className="flex items-center space-x-3 text-white">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Repository List */}
      <div className="p-8">
        {repos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-5xl">📦</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Repositories Found</h3>
            <p className="text-white/70">
              {error ? 'Please check the error message above' : 'Create a repository on GitHub to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className={`bg-white rounded-xl shadow-lg p-5 transition-all duration-300 border-2 ${
                  isRepoSynced(repo.id)
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-xl hover:scale-105'
                }`}
              >
                {/* Repo Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 flex items-center text-lg">
                      <span className="text-2xl mr-2">{repo.private ? '🔒' : '📖'}</span>
                      {repo.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {repo.full_name}
                    </p>
                  </div>
                  {isRepoSynced(repo.id) && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center shadow-lg">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                      Synced
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {repo.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span>{repo.stargazers_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🍴</span>
                    <span>{repo.forks_count}</span>
                  </span>
                  {repo.language && (
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-xs font-medium">{repo.language}</span>
                    </span>
                  )}
                </div>

                {/* Branch */}
                <div className="text-sm text-gray-600 mb-4 flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span className="font-mono text-xs font-medium">{repo.default_branch || 'main'}</span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => syncRepoAsTask(repo)}
                  disabled={syncing || isRepoSynced(repo.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isRepoSynced(repo.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                      : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isRepoSynced(repo.id) ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Already Synced</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Task from Repo</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-t border-white/10 px-8 py-5 rounded-b-3xl">
        <p className="text-sm text-white/80 text-center flex items-center justify-center space-x-2">
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-medium">Tip: Each repository will be created as a task with its own details</span>
        </p>
      </div>
    </div>
  );
};

export default GitHubRepoSync;
