/**
 * Background Jobs Service
 * Handles scheduled tasks and background processing
 */

const cron = require('node-cron');
const Task = require('../models/TaskModel');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendTaskDueReminder, sendWeeklyDigest } = require('./emailService');
const { appLogger } = require('../middleware/logger');

// Store active jobs
const activeJobs = new Map();

/**
 * Check for tasks due soon and create notifications
 */
const checkDueDateReminders = async () => {
  appLogger.info('Running due date reminder check...');
  
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find tasks due within 24 hours that haven't been notified
    const tasks = await Task.find({
      dueDate: {
        $gte: now,
        $lte: tomorrow,
      },
      status: { $ne: 'Completed' },
      dueDateNotified: { $ne: true },
    }).populate('createdBy', 'displayName email');

    appLogger.info(`Found ${tasks.length} tasks due within 24 hours`);

    for (const task of tasks) {
      // Create in-app notification
      await Notification.createNotification({
        recipient: task.createdBy._id,
        type: 'due_date_reminder',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due ${task.dueDate < now ? 'today' : 'tomorrow'}`,
        task: task._id,
      });

      // Send email notification
      if (task.createdBy.email) {
        await sendTaskDueReminder(task, task.createdBy);
      }

      // Mark as notified
      task.dueDateNotified = true;
      await task.save();
    }

    // Also check for overdue tasks
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: 'Completed' },
      overdueNotified: { $ne: true },
    }).populate('createdBy', 'displayName email');

    for (const task of overdueTasks) {
      await Notification.createNotification({
        recipient: task.createdBy._id,
        type: 'task_overdue',
        title: 'Task Overdue',
        message: `Task "${task.title}" is overdue!`,
        task: task._id,
      });

      task.overdueNotified = true;
      await task.save();
    }

    appLogger.info('Due date reminder check completed');
  } catch (error) {
    appLogger.error('Error in due date reminder check', error);
  }
};

/**
 * Process recurring tasks
 */
const processRecurringTasks = async () => {
  appLogger.info('Processing recurring tasks...');
  
  try {
    const now = new Date();
    
    // Find completed tasks with recurrence enabled
    const recurringTasks = await Task.find({
      status: 'Completed',
      'recurrence.enabled': true,
      $or: [
        { 'recurrence.endDate': { $exists: false } },
        { 'recurrence.endDate': { $gte: now } },
      ],
      'recurrence.lastProcessed': {
        $or: [
          { $exists: false },
          { $lt: new Date(now - 60 * 60 * 1000) }, // Not processed in last hour
        ],
      },
    });

    appLogger.info(`Found ${recurringTasks.length} recurring tasks to process`);

    for (const task of recurringTasks) {
      const nextDueDate = calculateNextDueDate(task);
      
      if (nextDueDate) {
        // Create new task instance
        const newTask = new Task({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'Pending',
          dueDate: nextDueDate,
          assignee: task.assignee,
          labels: task.labels,
          repo: task.repo,
          branch: task.branch,
          createdBy: task.createdBy,
          recurrence: task.recurrence,
        });

        await newTask.save();

        // Update original task
        task.recurrence.lastProcessed = now;
        await task.save();

        appLogger.info(`Created recurring task instance: ${newTask._id}`);
      }
    }

    appLogger.info('Recurring task processing completed');
  } catch (error) {
    appLogger.error('Error processing recurring tasks', error);
  }
};

/**
 * Calculate next due date for recurring task
 */
const calculateNextDueDate = (task) => {
  if (!task.dueDate || !task.recurrence) return null;
  
  const { frequency, interval = 1 } = task.recurrence;
  const lastDue = new Date(task.dueDate);
  const nextDue = new Date(lastDue);
  
  switch (frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + interval);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + (7 * interval));
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + interval);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + interval);
      break;
    default:
      return null;
  }
  
  // Check if past end date
  if (task.recurrence.endDate && nextDue > new Date(task.recurrence.endDate)) {
    return null;
  }
  
  return nextDue;
};

/**
 * Send weekly digest emails
 */
const sendWeeklyDigests = async () => {
  appLogger.info('Sending weekly digests...');
  
  try {
    const users = await User.find({ 'preferences.weeklyDigest': true });
    
    for (const user of users) {
      const stats = await getWeeklyStats(user._id);
      await sendWeeklyDigest(user, stats);
    }
    
    appLogger.info(`Sent ${users.length} weekly digest emails`);
  } catch (error) {
    appLogger.error('Error sending weekly digests', error);
  }
};

/**
 * Get weekly stats for a user
 */
const getWeeklyStats = async (userId) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const [completed, inProgress, pending, overdue] = await Promise.all([
    Task.countDocuments({ createdBy: userId, status: 'Completed', updatedAt: { $gte: oneWeekAgo } }),
    Task.countDocuments({ createdBy: userId, status: 'InProgress' }),
    Task.countDocuments({ createdBy: userId, status: 'Pending' }),
    Task.countDocuments({ createdBy: userId, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } }),
  ]);
  
  return { completed, inProgress, pending, overdue };
};

/**
 * Cleanup old notifications
 */
const cleanupOldNotifications = async () => {
  appLogger.info('Cleaning up old notifications...');
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Notification.deleteMany({
      read: true,
      createdAt: { $lt: thirtyDaysAgo },
    });
    
    appLogger.info(`Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    appLogger.error('Error cleaning up notifications', error);
  }
};

/**
 * Database health check
 */
const databaseHealthCheck = async () => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    
    if (state !== 1) {
      appLogger.error('Database connection unhealthy', null, { state });
    }
  } catch (error) {
    appLogger.error('Database health check failed', error);
  }
};

/**
 * Initialize all scheduled jobs
 */
const initializeJobs = () => {
  appLogger.info('Initializing background jobs...');

  // Due date reminders - every hour
  const dueDateJob = cron.schedule('0 * * * *', checkDueDateReminders, {
    scheduled: true,
    timezone: 'UTC',
  });
  activeJobs.set('dueDate', dueDateJob);

  // Recurring tasks - every 6 hours
  const recurringJob = cron.schedule('0 */6 * * *', processRecurringTasks, {
    scheduled: true,
    timezone: 'UTC',
  });
  activeJobs.set('recurring', recurringJob);

  // Weekly digest - every Monday at 9 AM
  const weeklyDigestJob = cron.schedule('0 9 * * 1', sendWeeklyDigests, {
    scheduled: true,
    timezone: 'UTC',
  });
  activeJobs.set('weeklyDigest', weeklyDigestJob);

  // Cleanup old notifications - daily at midnight
  const cleanupJob = cron.schedule('0 0 * * *', cleanupOldNotifications, {
    scheduled: true,
    timezone: 'UTC',
  });
  activeJobs.set('cleanup', cleanupJob);

  // Database health check - every 5 minutes
  const healthCheckJob = cron.schedule('*/5 * * * *', databaseHealthCheck, {
    scheduled: true,
    timezone: 'UTC',
  });
  activeJobs.set('healthCheck', healthCheckJob);

  appLogger.info(`Initialized ${activeJobs.size} background jobs`);
};

/**
 * Stop all jobs
 */
const stopAllJobs = () => {
  for (const [name, job] of activeJobs) {
    job.stop();
    appLogger.info(`Stopped job: ${name}`);
  }
  activeJobs.clear();
};

/**
 * Get job status
 */
const getJobStatus = () => {
  const status = {};
  for (const [name, job] of activeJobs) {
    status[name] = {
      running: job.running || false,
    };
  }
  return status;
};

module.exports = {
  initializeJobs,
  stopAllJobs,
  getJobStatus,
  checkDueDateReminders,
  processRecurringTasks,
  sendWeeklyDigests,
  cleanupOldNotifications,
};
