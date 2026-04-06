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
      expect(ErrorTypes.NOT_FOUND).toBeDefined();
      expect(ErrorTypes.RATE_LIMIT).toBeDefined();
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

  describe('errorHandler middleware', () => {
    const req = { method: 'GET', originalUrl: '/api/test' };

    const createRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    });

    it('should send operational AppError response', () => {
      const res = createRes();
      const err = new AppError('Validation failed', 400, ErrorTypes.VALIDATION_ERROR);

      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          status: 'fail',
          message: 'Validation failed',
          errorCode: ErrorTypes.VALIDATION_ERROR,
        })
      );
    });

    it('should send generic 500 response for non-operational errors', () => {
      const res = createRes();
      const err = new Error('Unexpected failure');

      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          status: 'error',
          errorCode: ErrorTypes.SERVER_ERROR,
        })
      );
    });

    it('should map CastError to validation AppError', () => {
      const res = createRes();
      const err = { name: 'CastError', path: 'id', value: 'bad-id' };

      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: ErrorTypes.VALIDATION_ERROR,
        })
      );
    });

    it('should map duplicate key errors correctly', () => {
      const res = createRes();
      const err = { code: 11000, errmsg: 'duplicate key error dup key: { email: "test@example.com" }' };

      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: ErrorTypes.DUPLICATE_KEY,
        })
      );
    });

    it('should map JWT errors to authentication errors', () => {
      const res = createRes();
      const err = { name: 'JsonWebTokenError', message: 'jwt malformed' };

      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: ErrorTypes.AUTHENTICATION_ERROR,
        })
      );
    });
  });
});
