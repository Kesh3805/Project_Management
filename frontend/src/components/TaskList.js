import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onEdit, onDelete, onStatusChange, onSelect, selectedTasks = [], onCommentsClick }) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-16 text-center border border-gray-200 dark:border-gray-700">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-6xl">📭</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Tasks Found</h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Create a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task._id || task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onSelect={onSelect}
          isSelected={selectedTasks.includes(task._id || task.id)}
          onCommentsClick={onCommentsClick}
        />
      ))}
    </div>
  );
};

export default TaskList;
