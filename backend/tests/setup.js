const mongoose = require('mongoose');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.SESSION_SECRET = 'test-session-secret-key-12345';

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock external services
jest.mock('../services/emailService', () => ({
  sendTaskDueReminder: jest.fn().mockResolvedValue({ success: true }),
  sendTaskAssigned: jest.fn().mockResolvedValue({ success: true }),
  sendCommentMention: jest.fn().mockResolvedValue({ success: true }),
  sendWeeklyDigest: jest.fn().mockResolvedValue({ success: true })
}));

// Cleanup after all tests
afterAll(async () => {
  // Close MongoDB connection if open
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    githubId: '12345',
    ...overrides
  }),
  
  createMockTask: (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'medium',
    ...overrides
  })
};
