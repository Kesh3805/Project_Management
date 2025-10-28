import React from 'react';

const FilterBar = ({ filters, onFilterChange, taskCount }) => {
  return (
    <div className="glass-dark backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-6 scale-in border border-white/10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6">
        {/* Status Filter */}
        <div className="flex items-center space-x-3 flex-1">
          <label className="text-white font-semibold flex items-center space-x-2 whitespace-nowrap">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Status:</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="modern-input flex-1 min-w-0 bg-white/10 border-white/20 text-white focus:border-blue-400"
          >
            <option value="All" className="bg-gray-800">All Status</option>
            <option value="Pending" className="bg-gray-800">⏳ Pending</option>
            <option value="InProgress" className="bg-gray-800">🔄 In Progress</option>
            <option value="Completed" className="bg-gray-800">✅ Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-3 flex-1">
          <label className="text-white font-semibold flex items-center space-x-2 whitespace-nowrap">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Priority:</span>
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
            className="modern-input flex-1 min-w-0 bg-white/10 border-white/20 text-white focus:border-purple-400"
          >
            <option value="All" className="bg-gray-800">All Priorities</option>
            <option value="Low" className="bg-gray-800">🟢 Low</option>
            <option value="Medium" className="bg-gray-800">🟡 Medium</option>
            <option value="High" className="bg-gray-800">🔴 High</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-3 flex-1">
          <label className="text-white font-semibold flex items-center space-x-2 whitespace-nowrap">
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Sort:</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="modern-input flex-1 min-w-0 bg-white/10 border-white/20 text-white focus:border-pink-400"
          >
            <option value="" className="bg-gray-800">No Sorting</option>
            <option value="priority" className="bg-gray-800">📊 By Priority</option>
            <option value="dueDate" className="bg-gray-800">📅 By Due Date</option>
          </select>
        </div>

        {/* Task Count */}
        <div className="text-white font-bold flex items-center justify-center md:justify-start">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2.5 rounded-xl shadow-lg border border-white/20 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-lg font-bold">{taskCount}</span>
            <span className="text-sm opacity-90">{taskCount === 1 ? 'Task' : 'Tasks'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
