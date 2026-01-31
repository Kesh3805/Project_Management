const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET comments for a task
router.get('/task/:taskId', commentController.getComments);

// POST create comment
router.post('/task/:taskId', commentController.createComment);

// PUT update comment
router.put('/:commentId', commentController.updateComment);

// DELETE comment
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
