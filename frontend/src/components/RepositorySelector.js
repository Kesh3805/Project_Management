import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RepositorySelector = ({ selectedRepo, selectedBranch, onRepoChange, onBranchChange }) => {
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchBranches(selectedRepo);
    } else {
      setBranches([]);
    }
  }, [selectedRepo]);

  const fetchRepositories = async () => {
    try {
      setLoadingRepos(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/github/repos`);
      setRepos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchBranches = async (repoName) => {
    try {
      setLoadingBranches(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/github/repos/${repoName}/branches`);
      setBranches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Repository Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>GitHub Repository (Optional)</span>
        </label>
        <select
          value={selectedRepo || ''}
          onChange={(e) => onRepoChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
          disabled={loadingRepos}
        >
          <option value="">Select a repository...</option>
          {repos.map((repo) => (
            <option key={repo.name} value={repo.name}>
              {repo.name} {repo.private ? '🔒' : '📖'}
            </option>
          ))}
        </select>
        {loadingRepos && (
          <p className="text-sm text-gray-500 mt-2 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-500"></div>
            <span>Loading repositories...</span>
          </p>
        )}
      </div>

      {/* Branch Selector */}
      {selectedRepo && (
        <div className="fade-in">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Branch (Optional)</span>
          </label>
          <select
            value={selectedBranch || ''}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300"
            disabled={loadingBranches}
          >
            <option value="">Select a branch...</option>
            {branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
          {loadingBranches && (
            <p className="text-sm text-gray-500 mt-2 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-green-500"></div>
              <span>Loading branches...</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;
