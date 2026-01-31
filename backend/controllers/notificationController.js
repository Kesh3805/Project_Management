const Notification = require('../models/Notification');
const Task = require('../models/TaskModel');

// GET notifications for user
const getNotifications = async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    
    let query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// MARK notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.markAsRead();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// MARK all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// DELETE notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// DELETE all notifications
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    
    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
};

// CHECK for due date reminders (to be called by scheduler)
const checkDueDateReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    // Find tasks due within 24 hours that haven't been notified
    const upcomingTasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $lte: tomorrow, $gte: now }
    }).populate('createdBy');
    
    for (const task of upcomingTasks) {
      // Check if reminder already sent today
      const existingReminder = await Notification.findOne({
        recipient: task.createdBy._id,
        task: task._id,
        type: 'due_date_reminder',
        createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
      });
      
      if (!existingReminder) {
        await Notification.createNotification({
          recipient: task.createdBy._id,
          type: 'due_date_reminder',
          title: 'Task Due Soon',
          message: `"${task.title}" is due ${task.dueDate.toLocaleDateString()}`,
          task: task._id,
          taskTitle: task.title
        });
      }
    }
    
    // Find overdue tasks
    const overdueTasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $lt: now }
    }).populate('createdBy');
    
    for (const task of overdueTasks) {
      const existingAlert = await Notification.findOne({
        recipient: task.createdBy._id,
        task: task._id,
        type: 'overdue_alert',
        createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
      });
      
      if (!existingAlert) {
        await Notification.createNotification({
          recipient: task.createdBy._id,
          type: 'overdue_alert',
          title: 'Task Overdue',
          message: `"${task.title}" is overdue!`,
          task: task._id,
          taskTitle: task.title
        });
      }
    }
    
    return { upcomingCount: upcomingTasks.length, overdueCount: overdueTasks.length };
  } catch (error) {
    console.error('Error checking due date reminders:', error);
    throw error;
  }
};

// GET unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  checkDueDateReminders,
  getUnreadCount
};
