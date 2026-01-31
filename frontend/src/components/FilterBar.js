import React from 'react';

const FilterBar = ({ filters, onFilterChange, taskCount }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6">
          {/* Status Filter */}
          <div className="flex items-center space-x-3 flex-1">
            <label className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
              Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-3 flex-1">
            <label className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
              Priority:
            </label>
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange({ priority: e.target.value })}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-3 flex-1">
            <label className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
              Sort:
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Sorting</option>
              <option value="priority">By Priority</option>
              <option value="dueDate">By Due Date</option>
            </select>
          </div>

          {/* Task Count */}
          <div className="text-gray-900 dark:text-white font-semibold flex items-center justify-center md:justify-start">
            <div className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-lg font-bold">{taskCount}</span>
              <span className="text-sm">{taskCount === 1 ? 'Task' : 'Tasks'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
