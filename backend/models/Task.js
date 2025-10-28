class Task {
  constructor(id, title, description, priority, dueDate, assignee, status = 'Pending') {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority; // Low, Medium, High
    this.dueDate = dueDate;
    this.assignee = assignee;
    this.status = status; // Pending, InProgress, Completed
  }
  
  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      dueDate: this.dueDate,
      assignee: this.assignee,
      status: this.status
    };
  }
  
  // Validate task
  static validate(task) {
    const errors = [];
    
    if (!task.title) errors.push('Title is required');
    if (!task.description) errors.push('Description is required');
    if (!task.priority) errors.push('Priority is required');
    if (!['Low', 'Medium', 'High'].includes(task.priority)) {
      errors.push('Priority must be Low, Medium, or High');
    }
    if (!task.dueDate) errors.push('Due date is required');
    if (!task.assignee) errors.push('Assignee is required');
    if (!['Pending', 'InProgress', 'Completed'].includes(task.status)) {
      errors.push('Status must be Pending, InProgress, or Completed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Task;
