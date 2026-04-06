const { validate, validateObjectId, schemas } = require('../../middleware/validator');
const { AppError, ErrorTypes } = require('../../middleware/errorHandler');

describe('Validator Middleware', () => {
  describe('validate', () => {
    it('should call next() when validation passes', () => {
      const req = {
        body: {
          title: 'Test Task',
          status: 'Pending',
          priority: 'Medium'
        }
      };
      const res = {};
      const next = jest.fn();

      validate('createTask')(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass AppError to next when validation fails', () => {
      const req = { body: { title: '' } };
      const res = {};
      const next = jest.fn();

      validate('createTask')(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(AppError);
      expect(errorArg.statusCode).toBe(400);
      expect(errorArg.errorCode).toBe(ErrorTypes.VALIDATION_ERROR);
    });

    it('should pass AppError to next when schema is not found', () => {
      const req = { body: { name: 'Test' } };
      const res = {};
      const next = jest.fn();

      validate('missingSchema')(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(AppError);
      expect(errorArg.statusCode).toBe(500);
    });
  });

  describe('validateObjectId', () => {
    it('should call next() for valid ObjectId', () => {
      const req = { params: { id: '507f1f77bcf86cd799439011' } };
      const res = {};
      const next = jest.fn();

      validateObjectId('id')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass AppError to next for invalid ObjectId', () => {
      const req = { params: { id: 'invalid-id' } };
      const res = {};
      const next = jest.fn();

      validateObjectId('id')(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(AppError);
      expect(errorArg.statusCode).toBe(400);
      expect(errorArg.errorCode).toBe(ErrorTypes.VALIDATION_ERROR);
    });
  });

  describe('schemas', () => {
    describe('createTask', () => {
      it('should validate a valid task', () => {
        const task = {
          title: 'Test Task',
          description: 'Description',
          status: 'Pending',
          priority: 'Medium'
        };

        const { error } = schemas.createTask.validate(task);
        expect(error).toBeUndefined();
      });

      it('should reject empty title', () => {
        const task = { title: '' };
        const { error } = schemas.createTask.validate(task);
        expect(error).toBeDefined();
      });
    });

    describe('pagination', () => {
      it('should validate valid pagination', () => {
        const pagination = { page: 1, limit: 20 };
        const { error } = schemas.pagination.validate(pagination);
        expect(error).toBeUndefined();
      });

      it('should reject negative page', () => {
        const pagination = { page: -1 };
        const { error } = schemas.pagination.validate(pagination);
        expect(error).toBeDefined();
      });
    });
  });
});
