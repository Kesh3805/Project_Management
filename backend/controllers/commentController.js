const Comment = require('../models/Comment');
const Task = require('../models/TaskModel');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET comments for a task
const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verify task belongs to user
    const task = await Task.findOne({
      _id: taskId,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// CREATE comment
const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    // Verify task belongs to user
    const task = await Task.findOne({
      _id: taskId,
      createdBy: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Parse mentions (@username)
    const mentionRegex = /@(\w+)/g;
    const mentionMatches = content.match(mentionRegex) || [];
    const mentionedUsernames = mentionMatches.map(m => m.substring(1));
    
    // Find mentioned users
    const mentionedUsers = await User.find({
      username: { $in: mentionedUsernames }
    });
    
    const comment = await Comment.create({
      task: taskId,
      content: content.trim(),
      author: req.user._id,
      authorName: req.user.username,
      authorAvatar: req.user.avatar,
      mentions: mentionedUsers.map(u => u._id)
    });
    
    // Add to task activity log
    task.activityLog.push({
      action: 'comment_added',
      performedBy: req.user._id,
      performedByName: req.user.username,
      timestamp: new Date()
    });
    await task.save();
    
    // Create notifications for mentioned users
    for (const user of mentionedUsers) {
      await Notification.createNotification({
        recipient: user._id,
        type: 'comment_mention',
        title: 'You were mentioned',
        message: `${req.user.username} mentioned you in a comment on "${task.title}"`,
        task: taskId,
        taskTitle: task.title,
        comment: comment._id,
        sender: req.user._id,
        senderName: req.user.username,
        senderAvatar: req.user.avatar
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// UPDATE comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user._id
    });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or unauthorized'
      });
    }
    
    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();
    
    res.json({
      success: true,
      message: 'Comment updated',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

// DELETE comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      author: req.user._id
    });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or unauthorized'
      });
    }
    
    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment
};
