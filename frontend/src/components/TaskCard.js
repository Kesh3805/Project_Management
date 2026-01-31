import React, { useState } from 'react';
import api from '../services/api';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onSelect, isSelected, onCommentsClick }) => {
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
    <div className={`card card-hover ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Card Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Selection Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(task._id || task.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 pr-4">{task.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {task.taskId && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium">
                {task.taskId}
              </span>
            )}
            {/* Comments Button */}
            {onCommentsClick && (
              <button
                onClick={() => onCommentsClick(task)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                title="Comments"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labels.map((label, idx) => (
              <span
                key={label._id || idx}
                className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: label.color || '#6366f1' }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4">
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{task.description}</p>

        {/* Priority and Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`${
            task.priority === 'High' ? 'badge-danger' :
            task.priority === 'Medium' ? 'badge-warning' :
            'badge-success'
          }`}>
            {task.priority} Priority
          </span>
          <span className={`${
            task.status === 'Completed' ? 'badge-success' :
            task.status === 'InProgress' ? 'badge-primary' :
            'badge-gray'
          }`}>
            {task.status === 'InProgress' ? 'In Progress' : task.status}
          </span>
          {/* Dependencies indicator */}
          {task.dependencies && task.dependencies.length > 0 && (
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Assignee */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {task.assignee?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Assignee</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{task.assignee}</p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOverdue() ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <svg className={`w-4 h-4 ${isOverdue() ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
              <p className={`text-sm font-medium ${isOverdue() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {formatDate(task.dueDate)}
                {isOverdue() && <span className="ml-1 text-xs">⚠️</span>}
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Integration Info */}
        {task.repo && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="font-medium text-gray-900">{task.repo}</span>
              {task.branch && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">{task.branch}</span>
                </>
              )}
            </div>
            
            {/* Latest Commit Info */}
            {task.latestCommit && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-2">
                      {task.latestCommit.message}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-gray-500">
                      <span>{task.latestCommit.author}</span>
                      <span>•</span>
                      <span>{new Date(task.latestCommit.date).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700 text-xs">
                        {task.latestCommit.sha?.substring(0, 7)}
                      </span>
                      {task.latestCommit.url && (
                        <a
                          href={task.latestCommit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Commit →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Last Synced / Sync Button */}
            <div className="flex items-center justify-between text-xs">
              {task.lastSyncedAt && (
                <span className="text-gray-500">Last synced: {new Date(task.lastSyncedAt).toLocaleString()}</span>
              )}
              <button
                onClick={handleSyncCommits}
                disabled={syncing}
                className="btn-ghost text-sm disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : '🔄 Sync Commits'}
              </button>
            </div>
          </div>
        )}

        {/* Status Dropdown */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            Update Status
          </label>
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="select w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => onEdit(task)}
          className="btn-secondary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-danger"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
