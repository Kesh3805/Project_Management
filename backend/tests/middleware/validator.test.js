const { validate, validateObjectId, schemas } = require('../../middleware/validator');
const Joi = require('joi');

describe('Validator Middleware', () => {
  describe('validate', () => {
    const mockSchema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().min(0)
    });

    it('should call next() when validation passes', () => {
      const req = { body: { name: 'Test', age: 25 } };
      const res = {};
      const next = jest.fn();

      validate(mockSchema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should return 400 when validation fails', () => {
      const req = { body: { age: -5 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validate(mockSchema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
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

    it('should return 400 for invalid ObjectId', () => {
      const req = { params: { id: 'invalid-id' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateObjectId('id')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('schemas', () => {
    describe('createTask', () => {
      it('should validate a valid task', () => {
        const task = {
          title: 'Test Task',
          description: 'Description',
          status: 'todo',
          priority: 'medium'
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
