const Task = require('../models/TaskModel');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Joi = require('joi');

// Validation schema
const taskValidationSchema = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High').required(),
  status: Joi.string().valid('Pending', 'InProgress', 'Completed').default('Pending'),
  dueDate: Joi.date().required(),
  assignee: Joi.string().required(),
  repo: Joi.string().allow('', null).optional(),
  repoId: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null).optional(),
  branch: Joi.string().allow('', null).optional(),
  // Commit tracking fields
  latestCommit: Joi.object({
    sha: Joi.string().allow('', null).optional(),
    message: Joi.string().allow('', null).optional(),
    author: Joi.string().allow('', null).optional(),
    date: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null).optional(),
    url: Joi.string().uri().allow('', null).optional()
  }).allow(null).optional(),
  lastSyncedAt: Joi.alternatives().try(Joi.date(), Joi.string()).allow(null).optional()
});

// GET all tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, priority, repo, sortBy } = req.query;
    
    // Build query
    let query = { createdBy: req.user._id };
    
    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    // Filter by repository
    if (repo && repo !== 'All') {
      query.repo = repo;
    }
    
    // Execute query
    let tasksQuery = Task.find(query);
    
    // Sort tasks
    if (sortBy === 'priority') {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      const tasks = await tasksQuery;
      tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      return res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } else if (sortBy === 'dueDate') {
      tasksQuery = tasksQuery.sort({ dueDate: 1 });
    } else {
      tasksQuery = tasksQuery.sort({ createdAt: -1 });
    }
    
    const tasks = await tasksQuery;
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// GET task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found`
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// POST create new task
const createTask = async (req, res) => {
  try {
    // Validate input
    const { error } = taskValidationSchema.validate(req.body);
    if (error) {
      console.error('Task validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }
    
    const taskData = {
      ...req.body,
      createdBy: req.user._id,
      lastUpdatedBy: req.user.username
    };
    
    console.log('Creating task with data:', taskData);
    const task = await Task.create(taskData);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// PUT update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found`
      });
    }
    
    // Update fields
    const allowedUpdates = ['title', 'description', 'priority', 'status', 'dueDate', 'assignee', 'repo', 'repoId', 'branch', 'latestCommit', 'lastSyncedAt', 'labels', 'recurrence'];
    
    // Track changes for activity log
    const changes = [];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined && JSON.stringify(task[field]) !== JSON.stringify(req.body[field])) {
        changes.push({
          action: field === 'status' ? 'status_changed' : 'updated',
          field: field,
          oldValue: task[field],
          newValue: req.body[field],
          performedBy: req.user._id,
          performedByName: req.user.username,
          timestamp: new Date()
        });
        task[field] = req.body[field];
      }
    });
    
    // Add changes to activity log
    if (changes.length > 0) {
      task.activityLog = task.activityLog || [];
      task.activityLog.push(...changes);
    }
    
    task.lastUpdatedBy = req.user.username;
    await task.save();
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// DELETE task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found`
      });
    }
    
    // Also delete associated comments
    await Comment.deleteMany({ task: req.params.id });
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// SEARCH tasks
const searchTasks = async (req, res) => {
  try {
    const { q, status, priority, labels } = req.query;
    
    let query = { createdBy: req.user._id };
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (labels) {
      query.labels = { $in: labels.split(',') };
    }
    
    const tasks = await Task.find(query)
      .populate('labels')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching tasks',
      error: error.message
    });
  }
};

// BULK update tasks
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      });
    }
    
    const allowedBulkUpdates = ['status', 'priority', 'assignee', 'labels'];
    const updateData = {};
    
    allowedBulkUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });
    
    updateData.lastUpdatedBy = req.user.username;
    
    const result = await Task.updateMany(
      { _id: { $in: taskIds }, createdBy: req.user._id },
      { $set: updateData }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating tasks',
      error: error.message
    });
  }
};

// BULK delete tasks
const bulkDeleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      });
    }
    
    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      createdBy: req.user._id
    });
    
    // Also delete associated comments
    await Comment.deleteMany({ task: { $in: taskIds } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} tasks deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tasks',
      error: error.message
    });
  }
};

// GET task statistics
const getTaskStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Overall counts
    const totalTasks = await Task.countDocuments({ createdBy: userId });
    const pendingTasks = await Task.countDocuments({ createdBy: userId, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ createdBy: userId, status: 'InProgress' });
    const completedTasks = await Task.countDocuments({ createdBy: userId, status: 'Completed' });
    
    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      createdBy: userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() }
    });
    
    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Tasks completed this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completedThisWeek = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      completedAt: { $gte: weekAgo }
    });
    
    // Tasks completed this month
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const completedThisMonth = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      completedAt: { $gte: monthAgo }
    });
    
    // Weekly trend (last 7 days)
    const weeklyTrend = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          completedAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = await Task.find({
      createdBy: userId,
      status: { $ne: 'Completed' },
      dueDate: { $gte: new Date(), $lte: nextWeek }
    })
      .select('title dueDate priority status')
      .sort({ dueDate: 1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        overview: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          completionRate
        },
        byPriority: tasksByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        productivity: {
          completedThisWeek,
          completedThisMonth,
          weeklyTrend
        },
        upcomingDeadlines
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// ADD dependency
const addDependency = async (req, res) => {
  try {
    const { dependencyTaskId, type } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if dependency task exists
    const dependencyTask = await Task.findOne({
      _id: dependencyTaskId,
      createdBy: req.user._id
    });
    
    if (!dependencyTask) {
      return res.status(404).json({
        success: false,
        message: 'Dependency task not found'
      });
    }
    
    // Check for circular dependency
    if (dependencyTaskId === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'A task cannot depend on itself'
      });
    }
    
    // Add dependency
    task.dependencies = task.dependencies || [];
    const existingDep = task.dependencies.find(d => d.task.toString() === dependencyTaskId);
    
    if (!existingDep) {
      task.dependencies.push({
        task: dependencyTaskId,
        type: type || 'blocked-by'
      });
      
      // Log activity
      task.activityLog.push({
        action: 'dependency_added',
        field: 'dependencies',
        newValue: dependencyTask.title,
        performedBy: req.user._id,
        performedByName: req.user.username,
        timestamp: new Date()
      });
      
      await task.save();
    }
    
    const updatedTask = await Task.findById(task._id)
      .populate('dependencies.task', 'title status taskId');
    
    res.json({
      success: true,
      message: 'Dependency added',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding dependency',
      error: error.message
    });
  }
};

// REMOVE dependency
const removeDependency = async (req, res) => {
  try {
    const { dependencyTaskId } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    task.dependencies = task.dependencies.filter(
      d => d.task.toString() !== dependencyTaskId
    );
    
    // Log activity
    task.activityLog.push({
      action: 'dependency_removed',
      field: 'dependencies',
      performedBy: req.user._id,
      performedByName: req.user.username,
      timestamp: new Date()
    });
    
    await task.save();
    
    res.json({
      success: true,
      message: 'Dependency removed',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing dependency',
      error: error.message
    });
  }
};

// GET task activity log
const getTaskActivity = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).select('activityLog title taskId');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Get comments for activity timeline
    const comments = await Comment.find({ task: req.params.id })
      .sort({ createdAt: -1 });
    
    // Combine and sort by timestamp
    const activity = [
      ...task.activityLog.map(a => ({ ...a.toObject(), type: 'activity' })),
      ...comments.map(c => ({
        type: 'comment',
        action: 'comment_added',
        performedByName: c.authorName,
        timestamp: c.createdAt,
        content: c.content
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  searchTasks,
  bulkUpdateTasks,
  bulkDeleteTasks,
  getTaskStatistics,
  addDependency,
  removeDependency,
  getTaskActivity
};
