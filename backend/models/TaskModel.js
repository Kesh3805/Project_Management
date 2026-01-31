const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'InProgress', 'Completed'],
      default: 'Pending',
      required: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    assignee: {
      type: String,
      required: [true, 'Assignee is required']
    },
    // GitHub Integration fields
    repo: {
      type: String,
      trim: true
    },
    repoId: {
      type: mongoose.Schema.Types.Mixed // Allow both Number and String for GitHub repo IDs
    },
    branch: {
      type: String,
      trim: true
    },
    taskId: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined values
    },
    // Version/Commit tracking
    latestCommit: {
      sha: String,
      message: String,
      author: String,
      date: Date,
      url: String
    },
    commitHistory: [{
      sha: String,
      message: String,
      author: String,
      date: Date,
      url: String,
      syncedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastSyncedAt: {
      type: Date
    },
    // User reference
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Activity tracking
    completedAt: {
      type: Date
    },
    lastUpdatedBy: {
      type: String
    },
    // Labels/Tags
    labels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label'
    }],
    // Task Dependencies
    dependencies: [{
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      type: {
        type: String,
        enum: ['blocks', 'blocked-by'],
        default: 'blocked-by'
      }
    }],
    // Attachments
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Recurring task settings
    recurrence: {
      enabled: {
        type: Boolean,
        default: false
      },
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'],
        default: 'weekly'
      },
      interval: {
        type: Number,
        default: 1
      },
      endDate: Date,
      nextOccurrence: Date,
      parentTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    },
    // Activity log
    activityLog: [{
      action: {
        type: String,
        enum: ['created', 'updated', 'status_changed', 'comment_added', 'attachment_added', 'label_added', 'label_removed', 'dependency_added', 'dependency_removed']
      },
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      performedByName: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ createdBy: 1, repo: 1 });
// taskId unique index is already defined in the schema above
taskSchema.index({ dueDate: 1 });
// Text index for search functionality
taskSchema.index({ title: 'text', description: 'text', assignee: 'text' });

// Auto-generate task ID
taskSchema.pre('save', async function(next) {
  if (!this.taskId && this.isNew) {
    // Find the highest existing taskId number
    const lastTask = await mongoose.model('Task')
      .findOne({}, { taskId: 1 })
      .sort({ taskId: -1 })
      .lean();
    
    let nextNumber = 1;
    if (lastTask && lastTask.taskId) {
      // Extract number from taskId (e.g., "TASK-003" -> 3)
      const match = lastTask.taskId.match(/TASK-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    this.taskId = `TASK-${String(nextNumber).padStart(3, '0')}`;
  }
  
  // Set completedAt when status changes to Completed
  if (this.status === 'Completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'Completed') {
    this.completedAt = undefined;
  }
  
  next();
});

// Virtual for checking if overdue
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed') return false;
  return new Date() > this.dueDate;
});

// Include virtuals in JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
