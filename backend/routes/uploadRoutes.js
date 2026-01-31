/**
 * Upload Routes
 * Handles file upload endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, getFileInfo, deleteFile } = require('../services/uploadService');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { uploadLimiter } = require('../middleware/rateLimiter');
const Task = require('../models/TaskModel');

// Upload single file
router.post('/single', protect, uploadLimiter, uploadSingle, catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileInfo = getFileInfo(req.file);
  
  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: fileInfo,
  });
}));

// Upload multiple files
router.post('/multiple', protect, uploadLimiter, uploadMultiple, catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const filesInfo = req.files.map(getFileInfo);
  
  res.status(201).json({
    success: true,
    message: `${req.files.length} files uploaded successfully`,
    data: filesInfo,
  });
}));

// Upload file and attach to task
router.post('/task/:taskId', protect, uploadLimiter, uploadMultiple, catchAsync(async (req, res) => {
  const { taskId } = req.params;
  
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check ownership
  if (task.createdBy.toString() !== req.user.id) {
    throw new AppError('Not authorized to modify this task', 403);
  }

  const filesInfo = req.files.map(getFileInfo);
  
  // Add to task attachments
  if (!task.attachments) {
    task.attachments = [];
  }
  task.attachments.push(...filesInfo);
  
  // Add activity log
  task.activityLog.push({
    action: 'attachments_added',
    field: 'attachments',
    newValue: filesInfo.map(f => f.name).join(', '),
    changedBy: req.user.id,
  });

  await task.save();

  res.status(201).json({
    success: true,
    message: `${req.files.length} files attached to task`,
    data: filesInfo,
  });
}));

// Delete attachment from task
router.delete('/task/:taskId/:filename', protect, catchAsync(async (req, res) => {
  const { taskId, filename } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check ownership
  if (task.createdBy.toString() !== req.user.id) {
    throw new AppError('Not authorized to modify this task', 403);
  }

  // Find and remove attachment
  const attachmentIndex = task.attachments.findIndex(a => a.filename === filename);
  if (attachmentIndex === -1) {
    throw new AppError('Attachment not found', 404);
  }

  const attachment = task.attachments[attachmentIndex];
  task.attachments.splice(attachmentIndex, 1);

  // Add activity log
  task.activityLog.push({
    action: 'attachment_removed',
    field: 'attachments',
    oldValue: attachment.name,
    changedBy: req.user.id,
  });

  await task.save();

  // Delete file from disk
  await deleteFile(filename);

  res.json({
    success: true,
    message: 'Attachment deleted successfully',
  });
}));

module.exports = router;
