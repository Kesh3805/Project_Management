const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Statistics - must come before /:id routes
router.get('/stats/overview', taskController.getTaskStatistics);

// Search tasks
router.get('/search/query', taskController.searchTasks);

// Bulk operations
router.put('/bulk/update', taskController.bulkUpdateTasks);
router.delete('/bulk/delete', taskController.bulkDeleteTasks);

// GET all tasks
router.get('/', taskController.getAllTasks);

// GET task by ID
router.get('/:id', taskController.getTaskById);

// GET task activity log
router.get('/:id/activity', taskController.getTaskActivity);

// POST create new task
router.post('/', taskController.createTask);

// PUT update task
router.put('/:id', taskController.updateTask);

// Dependencies
router.post('/:id/dependencies', taskController.addDependency);
router.delete('/:id/dependencies', taskController.removeDependency);

// DELETE task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
