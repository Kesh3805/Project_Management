import React, { useState } from 'react';
import { bulkUpdateTasks, bulkDeleteTasks } from '../services/api';

const BulkActions = ({ selectedTasks, onComplete, onClear }) => {
  const [loading, setLoading] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const count = selectedTasks.length;

  if (count === 0) return null;

  const handleBulkStatusUpdate = async (status) => {
    try {
      setLoading(true);
      await bulkUpdateTasks(selectedTasks, { status });
      onComplete();
    } catch (err) {
      console.error('Error updating tasks:', err);
      alert('Failed to update tasks');
    } finally {
      setLoading(false);
      setShowStatusDropdown(false);
    }
  };

  const handleBulkPriorityUpdate = async (priority) => {
    try {
      setLoading(true);
      await bulkUpdateTasks(selectedTasks, { priority });
      onComplete();
    } catch (err) {
      console.error('Error updating tasks:', err);
      alert('Failed to update tasks');
    } finally {
      setLoading(false);
      setShowPriorityDropdown(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${count} task${count > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      setLoading(true);
      await bulkDeleteTasks(selectedTasks);
      onComplete();
    } catch (err) {
      console.error('Error deleting tasks:', err);
      alert('Failed to delete tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-gray-900 dark:bg-gray-700 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
        {/* Selected count */}
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {count}
          </span>
          <span className="text-gray-300">task{count > 1 ? 's' : ''} selected</span>
        </div>

        <div className="w-px h-8 bg-gray-600"></div>

        {/* Status Update */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowPriorityDropdown(false);
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showStatusDropdown && (
            <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 min-w-[160px]">
              {['Pending', 'InProgress', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {status === 'InProgress' ? 'In Progress' : status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Update */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPriorityDropdown(!showPriorityDropdown);
              setShowStatusDropdown(false);
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Priority
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPriorityDropdown && (
            <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 min-w-[140px]">
              {['High', 'Medium', 'Low'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => handleBulkPriorityUpdate(priority)}
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    priority === 'High' ? 'bg-red-500' :
                    priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={handleBulkDelete}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>

        <div className="w-px h-8 bg-gray-600"></div>

        {/* Clear selection */}
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActions;
