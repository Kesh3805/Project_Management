const { AppError, ErrorTypes, catchAsync, errorHandler } = require('../../middleware/errorHandler');

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an operational error with correct properties', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should default to status error for 500+ codes', () => {
      const error = new AppError('Server error', 500);
      
      expect(error.status).toBe('error');
    });
  });

  describe('ErrorTypes', () => {
    it('should have correct error types defined', () => {
      expect(ErrorTypes.VALIDATION_ERROR).toBeDefined();
      expect(ErrorTypes.AUTHENTICATION_ERROR).toBeDefined();
      expect(ErrorTypes.AUTHORIZATION_ERROR).toBeDefined();
      expect(ErrorTypes.NOT_FOUND_ERROR).toBeDefined();
      expect(ErrorTypes.RATE_LIMIT_ERROR).toBeDefined();
    });
  });

  describe('catchAsync', () => {
    it('should pass errors to next function', async () => {
      const mockError = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(mockError);
      const mockNext = jest.fn();
      
      const wrappedFn = catchAsync(asyncFn);
      await wrappedFn({}, {}, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should call the async function with req, res, next', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const mockReq = { body: {} };
      const mockRes = { json: jest.fn() };
      const mockNext = jest.fn();
      
      const wrappedFn = catchAsync(asyncFn);
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });
  });
});
