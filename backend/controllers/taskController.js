const Task = require('../models/TaskModel');
const Joi = require('joi');

// Validation schema
const taskValidationSchema = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High').required(),
  status: Joi.string().valid('Pending', 'InProgress', 'Completed'),
  dueDate: Joi.date().required(),
  assignee: Joi.string().required(),
  repo: Joi.string().allow('', null),
  repoId: Joi.number().allow(null),
  branch: Joi.string().allow('', null),
  // Commit tracking fields
  latestCommit: Joi.object({
    sha: Joi.string(),
    message: Joi.string(),
    author: Joi.string(),
    date: Joi.date(),
    url: Joi.string().uri()
  }).allow(null),
  lastSyncedAt: Joi.date().allow(null)
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
    
    const task = await Task.create(taskData);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
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
    const allowedUpdates = ['title', 'description', 'priority', 'status', 'dueDate', 'assignee', 'repo', 'repoId', 'branch', 'latestCommit', 'lastSyncedAt'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });
    
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

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
