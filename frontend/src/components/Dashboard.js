import React, { useState, useEffect } from 'react';
import { getTaskStatistics } from '../services/api';

const Dashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await getTaskStatistics();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard Analytics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Tasks"
                value={stats.overview.total}
                icon="📋"
                color="bg-blue-500"
              />
              <StatCard
                title="Completed"
                value={stats.overview.completed}
                icon="✅"
                color="bg-green-500"
                subtitle={`${stats.overview.completionRate}% completion rate`}
              />
              <StatCard
                title="In Progress"
                value={stats.overview.inProgress}
                icon="🔄"
                color="bg-yellow-500"
              />
              <StatCard
                title="Overdue"
                value={stats.overview.overdue}
                icon="⚠️"
                color="bg-red-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Status Distribution */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Task Status</h3>
                <div className="space-y-3">
                  <ProgressBar
                    label="Pending"
                    value={stats.overview.pending}
                    total={stats.overview.total}
                    color="bg-gray-400"
                  />
                  <ProgressBar
                    label="In Progress"
                    value={stats.overview.inProgress}
                    total={stats.overview.total}
                    color="bg-blue-500"
                  />
                  <ProgressBar
                    label="Completed"
                    value={stats.overview.completed}
                    total={stats.overview.total}
                    color="bg-green-500"
                  />
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">By Priority</h3>
                <div className="space-y-3">
                  <ProgressBar
                    label="High Priority"
                    value={stats.byPriority.High || 0}
                    total={stats.overview.total}
                    color="bg-red-500"
                  />
                  <ProgressBar
                    label="Medium Priority"
                    value={stats.byPriority.Medium || 0}
                    total={stats.overview.total}
                    color="bg-yellow-500"
                  />
                  <ProgressBar
                    label="Low Priority"
                    value={stats.byPriority.Low || 0}
                    total={stats.overview.total}
                    color="bg-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Productivity Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{stats.productivity.completedThisWeek}</div>
                <div className="text-green-100">Completed This Week</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{stats.productivity.completedThisMonth}</div>
                <div className="text-blue-100">Completed This Month</div>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-4 text-white">
                <div className="text-3xl font-bold">{stats.overview.completionRate}%</div>
                <div className="text-purple-100">Overall Completion Rate</div>
              </div>
            </div>

            {/* Weekly Trend */}
            {stats.productivity.weeklyTrend.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weekly Completion Trend</h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.productivity.weeklyTrend.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{
                          height: `${Math.max((day.count / Math.max(...stats.productivity.weeklyTrend.map(d => d.count))) * 100, 10)}%`
                        }}
                      ></div>
                      <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                        {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Deadlines */}
            {stats.upcomingDeadlines.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Upcoming Deadlines (Next 7 Days)
                </h3>
                <div className="space-y-2">
                  {stats.upcomingDeadlines.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-600 dark:text-gray-400">{value} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Dashboard;
