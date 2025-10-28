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
      type: Number
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
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ createdBy: 1, repo: 1 });
taskSchema.index({ taskId: 1 });
taskSchema.index({ dueDate: 1 });

// Auto-generate task ID
taskSchema.pre('save', async function(next) {
  if (!this.taskId && this.isNew) {
    const count = await mongoose.model('Task').countDocuments();
    this.taskId = `TASK-${String(count + 1).padStart(3, '0')}`;
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
