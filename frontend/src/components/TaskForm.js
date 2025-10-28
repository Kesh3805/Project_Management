import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    status: 'Pending',
    repo: '',
    branch: ''
  });

  const [createRepo, setCreateRepo] = useState(false);
  const [repoData, setRepoData] = useState({
    name: '',
    description: '',
    private: false,
    autoInit: true
  });
  const [creatingRepo, setCreatingRepo] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRepoDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRepoData({ 
      ...repoData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleCreateRepository = async () => {
    if (!repoData.name.trim()) {
      alert('Please enter a repository name');
      return;
    }

    try {
      setCreatingRepo(true);
      const response = await api.post('/github/repos', {
        name: repoData.name,
        description: repoData.description,
        private: repoData.private,
        auto_init: repoData.autoInit
      });

      if (response.data.success) {
        const newRepo = response.data.data;
        // Update form with the new repo details
        setFormData({ 
          ...formData, 
          repo: newRepo.full_name,
          branch: newRepo.default_branch || 'main'
        });
        alert(`Repository "${newRepo.name}" created successfully!`);
        setCreateRepo(false);
        // Reset repo form
        setRepoData({
          name: '',
          description: '',
          private: false,
          autoInit: true
        });
      }
    } catch (error) {
      console.error('Error creating repository:', error);
      alert(error.response?.data?.message || 'Failed to create repository');
    } finally {
      setCreatingRepo(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (task) {
      onSubmit(task.id, formData);
    } else {
      onSubmit(formData);
    }
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      assignee: '',
      status: 'Pending',
      repo: '',
      branch: ''
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 scale-in border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold gradient-text">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Title <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
            placeholder="Enter task title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>Description <span className="text-red-500">*</span></span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 resize-none"
            placeholder="Enter task description"
          />
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Priority <span className="text-red-500">*</span></span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300"
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Status <span className="text-red-500">*</span></span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300"
            >
              <option value="Pending">⏳ Pending</option>
              <option value="InProgress">🔄 In Progress</option>
              <option value="Completed">✅ Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date and Assignee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Due Date <span className="text-red-500">*</span></span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Assignee <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all duration-300"
              placeholder="Enter assignee name"
            />
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <span>GitHub Repository</span>
            </h3>
            <button
              type="button"
              onClick={() => setCreateRepo(!createRepo)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                createRepo 
                  ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md'
              }`}
            >
              {createRepo ? '✕ Cancel' : '+ Create New Repo'}
            </button>
          </div>

          {createRepo ? (
            /* Repository Creation Form */
            <div className="space-y-4 bg-white rounded-xl p-5 border-2 border-blue-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Repository Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={repoData.name}
                  onChange={handleRepoDataChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="my-awesome-project"
                  disabled={creatingRepo}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={repoData.description}
                  onChange={handleRepoDataChange}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="A brief description of your repository"
                  disabled={creatingRepo}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="private"
                      checked={repoData.private}
                      onChange={handleRepoDataChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={creatingRepo}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🔒 Private Repository
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoInit"
                      checked={repoData.autoInit}
                      onChange={handleRepoDataChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={creatingRepo}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      📄 Initialize with README
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleCreateRepository}
                  disabled={creatingRepo || !repoData.name.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingRepo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Repository</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Display current repo or message */
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              {formData.repo ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{formData.repo}</p>
                      <p className="text-sm text-gray-500">Branch: {formData.branch || 'main'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, repo: '', branch: '' })}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-2">
                  No repository linked. Click "Create New Repo" to get started.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{task ? 'Update Task' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
