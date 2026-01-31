const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET all notifications
router.get('/', notificationController.getNotifications);

// GET unread count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// PUT mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// DELETE notification
router.delete('/:id', notificationController.deleteNotification);

// DELETE all notifications
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;
