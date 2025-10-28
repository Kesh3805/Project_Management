import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import Login from './components/Login';
import GitHubActivityPanel from './components/GitHubActivityPanel';
import GitHubRepoSync from './components/GitHubRepoSync';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showGitHubPanel, setShowGitHubPanel] = useState(false);
  const [showRepoSync, setShowRepoSync] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    sortBy: ''
  });

  // Fetch tasks on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  // Apply filters when tasks or filters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filter by status
    if (filters.status !== 'All') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'All') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Sort tasks
    if (filters.sortBy === 'priority') {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (filters.sortBy === 'dueDate') {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      await fetchTasks();
      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error(err);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await updateTask(id, taskData);
      await fetchTasks();
      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        await fetchTasks();
      } catch (err) {
        setError('Failed to delete task. Please try again.');
        console.error(err);
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container-modern py-8">
        {/* Error Message */}
        {error && (
          <div className="glass-dark backdrop-blur-xl rounded-2xl border border-red-400/30 px-6 py-4 mb-6 fade-in shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-white/80 hover:text-white font-bold text-3xl transition-colors ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingTask(null);
                setShowRepoSync(false);
                setShowGitHubPanel(false);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{showForm ? 'Cancel' : 'Add New Task'}</span>
            </button>
            
            <button
              onClick={() => {
                setShowRepoSync(!showRepoSync);
                setShowForm(false);
                setShowGitHubPanel(false);
              }}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <span className="text-xl">🔗</span>
              <span>{showRepoSync ? 'Hide' : 'Sync'} GitHub Repos</span>
            </button>
          </div>
          
          <button
            onClick={() => {
              setShowGitHubPanel(!showGitHubPanel);
              setShowForm(false);
              setShowRepoSync(false);
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <span className="text-xl">📊</span>
            <span>{showGitHubPanel ? 'Hide' : 'Show'} Activity Dashboard</span>
          </button>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-6 fade-in">
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        )}

        {/* GitHub Repo Sync */}
        {showRepoSync && (
          <div className="mb-6 fade-in">
            <GitHubRepoSync
              onRepoSynced={(task) => {
                fetchTasks(); // Refresh task list
              }}
            />
          </div>
        )}

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          taskCount={filteredTasks.length}
        />

        {/* GitHub Activity Panel */}
        {showGitHubPanel && (
          <div className="mb-6 fade-in">
            <GitHubActivityPanel />
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleUpdateTask}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Project Management Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
