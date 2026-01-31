import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import Login from './components/Login';
import GitHubActivityPanel from './components/GitHubActivityPanel';
import Dashboard from './components/Dashboard';
import Comments from './components/Comments';
import Labels from './components/Labels';
import Search from './components/Search';
import Notifications from './components/Notifications';
import BulkActions from './components/BulkActions';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    sortBy: ''
  });
  
  // New feature states
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowDashboard(false);
        setShowLabels(false);
        setShowNotifications(false);
        setShowComments(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCommentsClick = (task) => {
    setSelectedTaskForComments(task);
    setShowComments(true);
  };

  const handleBulkComplete = () => {
    setSelectedTasks([]);
    fetchTasks();
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        onSearchClick={() => setShowSearch(true)}
        onDashboardClick={() => setShowDashboard(true)}
        onLabelsClick={() => setShowLabels(true)}
        onNotificationsClick={() => setShowNotifications(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-bold text-xl transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingTask(null);
                setShowGitHubPanel(false);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{showForm ? 'Cancel' : 'Add Task'}</span>
            </button>
          </div>
          
          <button
            onClick={() => {
              setShowGitHubPanel(!showGitHubPanel);
              setShowForm(false);
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{showGitHubPanel ? 'Hide' : 'Activity'}</span>
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleUpdateTask}
            onSelect={handleTaskSelect}
            selectedTasks={selectedTasks}
            onCommentsClick={handleCommentsClick}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; 2025 ProjectHub. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
      
      {showSearch && (
        <Search 
          onClose={() => setShowSearch(false)} 
          onTaskSelect={(task) => {
            handleEditTask(task);
            setShowSearch(false);
          }}
        />
      )}
      
      {showLabels && <Labels onClose={() => setShowLabels(false)} />}
      
      {showNotifications && (
        <Notifications 
          onClose={() => setShowNotifications(false)}
          onTaskClick={(taskId) => {
            // Could implement task navigation here
          }}
        />
      )}
      
      {showComments && selectedTaskForComments && (
        <Comments
          taskId={selectedTaskForComments._id || selectedTaskForComments.id}
          taskTitle={selectedTaskForComments.title}
          onClose={() => {
            setShowComments(false);
            setSelectedTaskForComments(null);
          }}
        />
      )}

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedTasks={selectedTasks}
        onComplete={handleBulkComplete}
        onClear={() => setSelectedTasks([])}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
