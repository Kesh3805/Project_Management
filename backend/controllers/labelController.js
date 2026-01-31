const Label = require('../models/Label');
const Task = require('../models/TaskModel');

// GET all labels for user
const getLabels = async (req, res) => {
  try {
    const labels = await Label.find({ createdBy: req.user._id })
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: labels.length,
      data: labels,
      presetColors: Label.PRESET_COLORS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching labels',
      error: error.message
    });
  }
};

// CREATE label
const createLabel = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Label name is required'
      });
    }
    
    // Check for duplicate
    const existing = await Label.findOne({
      name: name.trim(),
      createdBy: req.user._id
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A label with this name already exists'
      });
    }
    
    const label = await Label.create({
      name: name.trim(),
      color: color || '#6366f1',
      description: description?.trim(),
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Label created',
      data: label
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating label',
      error: error.message
    });
  }
};

// UPDATE label
const updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;
    
    const label = await Label.findOne({
      _id: id,
      createdBy: req.user._id
    });
    
    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }
    
    if (name) label.name = name.trim();
    if (color) label.color = color;
    if (description !== undefined) label.description = description?.trim();
    
    await label.save();
    
    res.json({
      success: true,
      message: 'Label updated',
      data: label
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating label',
      error: error.message
    });
  }
};

// DELETE label
const deleteLabel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const label = await Label.findOneAndDelete({
      _id: id,
      createdBy: req.user._id
    });
    
    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }
    
    // Remove label from all tasks
    await Task.updateMany(
      { createdBy: req.user._id, labels: id },
      { $pull: { labels: id } }
    );
    
    res.json({
      success: true,
      message: 'Label deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting label',
      error: error.message
    });
  }
};

// ADD label to task
const addLabelToTask = async (req, res) => {
  try {
    const { taskId, labelId } = req.params;
    
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
    
    const label = await Label.findOne({
      _id: labelId,
      createdBy: req.user._id
    });
    
    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }
    
    if (!task.labels.includes(labelId)) {
      task.labels.push(labelId);
      task.activityLog.push({
        action: 'label_added',
        field: 'labels',
        newValue: label.name,
        performedBy: req.user._id,
        performedByName: req.user.username,
        timestamp: new Date()
      });
      await task.save();
    }
    
    const updatedTask = await Task.findById(taskId).populate('labels');
    
    res.json({
      success: true,
      message: 'Label added to task',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding label',
      error: error.message
    });
  }
};

// REMOVE label from task
const removeLabelFromTask = async (req, res) => {
  try {
    const { taskId, labelId } = req.params;
    
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
    
    const label = await Label.findById(labelId);
    
    task.labels = task.labels.filter(l => l.toString() !== labelId);
    task.activityLog.push({
      action: 'label_removed',
      field: 'labels',
      oldValue: label?.name,
      performedBy: req.user._id,
      performedByName: req.user.username,
      timestamp: new Date()
    });
    await task.save();
    
    const updatedTask = await Task.findById(taskId).populate('labels');
    
    res.json({
      success: true,
      message: 'Label removed from task',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing label',
      error: error.message
    });
  }
};

module.exports = {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToTask,
  removeLabelFromTask
};
