import React, { useState } from 'react';
import api from '../services/api';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [syncing, setSyncing] = useState(false);
  
  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    Pending: 'bg-gray-100 text-gray-800',
    InProgress: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800'
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onStatusChange(task.id, { ...task, status: newStatus });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'Completed';
  };

  const handleSyncCommits = async () => {
    if (!task.repo) return;
    
    try {
      setSyncing(true);
      const response = await api.post('/github/repos/sync-commits', {
        taskId: task._id || task.id
      });
      
      if (response.data.success) {
        console.log('Commits synced:', response.data);
        // Refresh the task to show updated commit info
        window.location.reload(); // Simple refresh - you could optimize this
      }
    } catch (error) {
      console.error('Error syncing commits:', error);
      alert('Failed to sync commits: ' + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="modern-card overflow-hidden scale-in group">
      {/* Card Header with Gradient */}
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
        {/* Floating Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white truncate flex-1 pr-4">{task.title}</h3>
          {task.taskId && (
            <span className="bg-white bg-opacity-30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-white border-opacity-40">
              {task.taskId}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white">
        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">{task.description}</p>

        {/* Priority and Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`badge badge-gradient ${
            task.priority === 'High' ? 'from-red-500 to-pink-600' :
            task.priority === 'Medium' ? 'from-yellow-500 to-orange-600' :
            'from-green-500 to-emerald-600'
          }`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {task.priority} Priority
          </span>
          <span className={`badge badge-gradient ${
            task.status === 'Completed' ? 'from-green-500 to-emerald-600' :
            task.status === 'InProgress' ? 'from-blue-500 to-indigo-600' :
            'from-gray-500 to-slate-600'
          }`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {task.status === 'InProgress' ? 'In Progress' : task.status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Assignee */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {task.assignee?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs text-gray-500">Assignee</p>
              <p className="text-sm font-semibold text-gray-800">{task.assignee}</p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOverdue() ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <svg className={`w-4 h-4 ${isOverdue() ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Due Date</p>
              <p className={`text-sm font-semibold ${isOverdue() ? 'text-red-600' : 'text-gray-800'}`}>
                {formatDate(task.dueDate)}
                {isOverdue() && <span className="ml-1 text-xs">⚠️</span>}
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Integration Info */}
        {task.repo && (
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">🔗</span>
              <span className="font-medium text-gray-700">{task.repo}</span>
              {task.branch && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">🌿 {task.branch}</span>
                </>
              )}
            </div>
            
            {/* Latest Commit Info */}
            {task.latestCommit && (
              <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500">📝</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-clamp-2">
                      {task.latestCommit.message}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-gray-500">
                      <span>👤 {task.latestCommit.author}</span>
                      <span>🕒 {new Date(task.latestCommit.date).toLocaleString()}</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                        {task.latestCommit.sha?.substring(0, 7)}
                      </span>
                      {task.latestCommit.url && (
                        <a
                          href={task.latestCommit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:text-blue-600"
                        >
                          View →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Last Synced */}
            {task.lastSyncedAt && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Last synced: {new Date(task.lastSyncedAt).toLocaleString()}</span>
                <button
                  onClick={handleSyncCommits}
                  disabled={syncing}
                  className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
                >
                  {syncing ? '⟳ Syncing...' : '🔄 Sync Commits'}
                </button>
              </div>
            )}
            
            {/* Sync Button if never synced */}
            {!task.lastSyncedAt && (
              <button
                onClick={handleSyncCommits}
                disabled={syncing}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
              >
                {syncing ? '⟳ Syncing commits...' : '🔄 Sync Latest Commits'}
              </button>
            )}
          </div>
        )}

        {/* Status Dropdown */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
          <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Update Status
          </label>
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="modern-select"
          >
            <option value="Pending">📋 Pending</option>
            <option value="InProgress">🔄 In Progress</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
        <button
          onClick={() => onEdit(task)}
          className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="group bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
