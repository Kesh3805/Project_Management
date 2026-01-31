/**
 * Email Service
 * Handles email notifications
 */

const nodemailer = require('nodemailer');
const { config } = require('../config/config');
const { appLogger } = require('../middleware/logger');

// Create transporter
let transporter = null;

const initializeTransporter = () => {
  if (!config.email.host || !config.email.user) {
    appLogger.warn('Email service not configured - notifications will be logged only');
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

// Initialize on first use
const getTransporter = () => {
  if (!transporter) {
    transporter = initializeTransporter();
  }
  return transporter;
};

// Email templates
const templates = {
  taskDueReminder: (task, user) => ({
    subject: `Reminder: Task "${task.title}" is due soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Task Due Reminder</h2>
        <p>Hi ${user.displayName || 'there'},</p>
        <p>This is a reminder that the following task is due soon:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px;">${task.title}</h3>
          <p style="margin: 0; color: #6B7280;">${task.description || 'No description'}</p>
          <p style="margin: 10px 0 0; color: #EF4444;">
            <strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}
          </p>
        </div>
        <a href="${config.frontendUrl}/tasks/${task._id}" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Task
        </a>
        <p style="margin-top: 30px; color: #9CA3AF; font-size: 12px;">
          You're receiving this because you have email notifications enabled in ProjectHub.
        </p>
      </div>
    `,
  }),

  taskAssigned: (task, assignee, assigner) => ({
    subject: `You've been assigned to: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Task Assignment</h2>
        <p>Hi ${assignee.displayName || 'there'},</p>
        <p>${assigner?.displayName || 'Someone'} has assigned you to a task:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px;">${task.title}</h3>
          <p style="margin: 0; color: #6B7280;">${task.description || 'No description'}</p>
          <p style="margin: 10px 0 0;">
            <strong>Priority:</strong> 
            <span style="color: ${task.priority === 'High' ? '#EF4444' : task.priority === 'Medium' ? '#F59E0B' : '#10B981'}">
              ${task.priority}
            </span>
          </p>
          ${task.dueDate ? `<p style="margin: 5px 0 0;"><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
        </div>
        <a href="${config.frontendUrl}/tasks/${task._id}" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Task
        </a>
      </div>
    `,
  }),

  commentMention: (task, comment, mentionedUser, commenter) => ({
    subject: `${commenter.displayName} mentioned you in: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">You were mentioned</h2>
        <p>Hi ${mentionedUser.displayName || 'there'},</p>
        <p>${commenter.displayName} mentioned you in a comment:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-style: italic;">"${comment.content}"</p>
        </div>
        <p>On task: <strong>${task.title}</strong></p>
        <a href="${config.frontendUrl}/tasks/${task._id}" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Comment
        </a>
      </div>
    `,
  }),

  weeklyDigest: (user, stats) => ({
    subject: `Your Weekly ProjectHub Digest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Weekly Digest</h2>
        <p>Hi ${user.displayName || 'there'},</p>
        <p>Here's your weekly summary:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #10B981;">${stats.completed}</div>
              <div style="color: #6B7280;">Completed</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">${stats.inProgress}</div>
              <div style="color: #6B7280;">In Progress</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #F59E0B;">${stats.pending}</div>
              <div style="color: #6B7280;">Pending</div>
            </div>
          </div>
          ${stats.overdue > 0 ? `<p style="color: #EF4444;"><strong>${stats.overdue}</strong> overdue tasks need attention!</p>` : ''}
        </div>
        <a href="${config.frontendUrl}/dashboard" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Dashboard
        </a>
      </div>
    `,
  }),
};

// Send email
const sendEmail = async (to, template, data) => {
  const transport = getTransporter();
  
  if (!transport) {
    appLogger.info('Email would be sent (service not configured)', { to, template: template.name, data });
    return { success: true, simulated: true };
  }

  try {
    const emailContent = templates[template](...data);
    
    const result = await transport.sendMail({
      from: `"ProjectHub" <${config.email.from}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    appLogger.info('Email sent successfully', { to, messageId: result.messageId });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    appLogger.error('Failed to send email', error, { to, template });
    return { success: false, error: error.message };
  }
};

// Send task due reminder
const sendTaskDueReminder = async (task, user) => {
  if (!user.email) return { success: false, reason: 'No email address' };
  return sendEmail(user.email, 'taskDueReminder', [task, user]);
};

// Send task assigned notification
const sendTaskAssigned = async (task, assignee, assigner) => {
  if (!assignee.email) return { success: false, reason: 'No email address' };
  return sendEmail(assignee.email, 'taskAssigned', [task, assignee, assigner]);
};

// Send comment mention notification
const sendCommentMention = async (task, comment, mentionedUser, commenter) => {
  if (!mentionedUser.email) return { success: false, reason: 'No email address' };
  return sendEmail(mentionedUser.email, 'commentMention', [task, comment, mentionedUser, commenter]);
};

// Send weekly digest
const sendWeeklyDigest = async (user, stats) => {
  if (!user.email) return { success: false, reason: 'No email address' };
  return sendEmail(user.email, 'weeklyDigest', [user, stats]);
};

module.exports = {
  sendEmail,
  sendTaskDueReminder,
  sendTaskAssigned,
  sendCommentMention,
  sendWeeklyDigest,
};
