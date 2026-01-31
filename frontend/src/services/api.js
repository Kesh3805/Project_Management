import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== TASKS ====================

// Get all tasks
export const getTasks = async (params = {}) => {
  try {
    const response = await api.get('/tasks', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Get task by ID
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Create new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update task
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Search tasks
export const searchTasks = async (query, filters = {}) => {
  try {
    const response = await api.get('/tasks/search/query', { 
      params: { q: query, ...filters } 
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw error;
  }
};

// Get task statistics
export const getTaskStatistics = async () => {
  try {
    const response = await api.get('/tasks/stats/overview');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// Bulk update tasks
export const bulkUpdateTasks = async (taskIds, updates) => {
  try {
    const response = await api.put('/tasks/bulk/update', { taskIds, updates });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    throw error;
  }
};

// Bulk delete tasks
export const bulkDeleteTasks = async (taskIds) => {
  try {
    const response = await api.delete('/tasks/bulk/delete', { data: { taskIds } });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting tasks:', error);
    throw error;
  }
};

// Add task dependency
export const addTaskDependency = async (taskId, dependencyTaskId, type = 'blocked-by') => {
  try {
    const response = await api.post(`/tasks/${taskId}/dependencies`, { 
      dependencyTaskId, 
      type 
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding dependency:', error);
    throw error;
  }
};

// Remove task dependency
export const removeTaskDependency = async (taskId, dependencyTaskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}/dependencies`, { 
      data: { dependencyTaskId } 
    });
    return response.data.data;
  } catch (error) {
    console.error('Error removing dependency:', error);
    throw error;
  }
};

// Get task activity
export const getTaskActivity = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/activity`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }
};

// ==================== COMMENTS ====================

// Get comments for a task
export const getComments = async (taskId) => {
  try {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Create comment
export const createComment = async (taskId, content) => {
  try {
    const response = await api.post(`/comments/task/${taskId}`, { content });
    return response.data.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Update comment
export const updateComment = async (commentId, content) => {
  try {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete comment
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// ==================== LABELS ====================

// Get all labels
export const getLabels = async () => {
  try {
    const response = await api.get('/labels');
    return response.data;
  } catch (error) {
    console.error('Error fetching labels:', error);
    throw error;
  }
};

// Create label
export const createLabel = async (labelData) => {
  try {
    const response = await api.post('/labels', labelData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating label:', error);
    throw error;
  }
};

// Update label
export const updateLabel = async (id, labelData) => {
  try {
    const response = await api.put(`/labels/${id}`, labelData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating label:', error);
    throw error;
  }
};

// Delete label
export const deleteLabel = async (id) => {
  try {
    const response = await api.delete(`/labels/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting label:', error);
    throw error;
  }
};

// Add label to task
export const addLabelToTask = async (taskId, labelId) => {
  try {
    const response = await api.post(`/labels/task/${taskId}/${labelId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error adding label to task:', error);
    throw error;
  }
};

// Remove label from task
export const removeLabelFromTask = async (taskId, labelId) => {
  try {
    const response = await api.delete(`/labels/task/${taskId}/${labelId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error removing label from task:', error);
    throw error;
  }
};

// ==================== NOTIFICATIONS ====================

// Get notifications
export const getNotifications = async (limit = 50, unreadOnly = false) => {
  try {
    const response = await api.get('/notifications', { 
      params: { limit, unreadOnly } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread count
export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  try {
    const response = await api.delete('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

export default api;
