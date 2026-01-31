/**
 * Request Validation Middleware
 * Uses Joi for schema validation
 */

const Joi = require('joi');
const { AppError, ErrorTypes } = require('./errorHandler');

// Validation schemas
const schemas = {
  // Task schemas
  createTask: Joi.object({
    title: Joi.string().trim().min(1).max(200).required()
      .messages({
        'string.empty': 'Title is required',
        'string.max': 'Title cannot exceed 200 characters',
      }),
    description: Joi.string().trim().max(5000).allow('')
      .messages({
        'string.max': 'Description cannot exceed 5000 characters',
      }),
    status: Joi.string().valid('Pending', 'InProgress', 'Completed').default('Pending'),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    dueDate: Joi.date().iso().allow(null, ''),
    assignee: Joi.string().trim().max(100).allow(''),
    repo: Joi.string().trim().max(200).allow(''),
    branch: Joi.string().trim().max(100).allow(''),
    labels: Joi.array().items(Joi.string().hex().length(24)),
    dependencies: Joi.array().items(Joi.object({
      task: Joi.string().hex().length(24).required(),
      type: Joi.string().valid('blocks', 'blocked-by', 'relates-to').default('relates-to'),
    })),
    recurrence: Joi.object({
      enabled: Joi.boolean().default(false),
      frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
      interval: Joi.number().integer().min(1).max(365),
      endDate: Joi.date().iso(),
    }),
  }),

  updateTask: Joi.object({
    title: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(5000).allow(''),
    status: Joi.string().valid('Pending', 'InProgress', 'Completed'),
    priority: Joi.string().valid('Low', 'Medium', 'High'),
    dueDate: Joi.date().iso().allow(null, ''),
    assignee: Joi.string().trim().max(100).allow(''),
    repo: Joi.string().trim().max(200).allow(''),
    branch: Joi.string().trim().max(100).allow(''),
    labels: Joi.array().items(Joi.string().hex().length(24)),
    dependencies: Joi.array().items(Joi.object({
      task: Joi.string().hex().length(24).required(),
      type: Joi.string().valid('blocks', 'blocked-by', 'relates-to'),
    })),
    recurrence: Joi.object({
      enabled: Joi.boolean(),
      frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
      interval: Joi.number().integer().min(1).max(365),
      endDate: Joi.date().iso(),
    }),
  }).min(1),

  // Comment schemas
  createComment: Joi.object({
    content: Joi.string().trim().min(1).max(10000).required()
      .messages({
        'string.empty': 'Comment content is required',
        'string.max': 'Comment cannot exceed 10000 characters',
      }),
    mentions: Joi.array().items(Joi.string().hex().length(24)),
  }),

  // Label schemas
  createLabel: Joi.object({
    name: Joi.string().trim().min(1).max(50).required()
      .messages({
        'string.empty': 'Label name is required',
        'string.max': 'Label name cannot exceed 50 characters',
      }),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #FF5733)',
      }),
    description: Joi.string().trim().max(200).allow(''),
  }),

  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title', 'dueDate', '-dueDate', 'priority', '-priority'),
  }),

  // Search schema
  search: Joi.object({
    q: Joi.string().trim().min(1).max(200).required(),
    status: Joi.string().valid('Pending', 'InProgress', 'Completed', 'All'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'All'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  // Bulk operations
  bulkUpdate: Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).max(100).required(),
    updates: Joi.object({
      status: Joi.string().valid('Pending', 'InProgress', 'Completed'),
      priority: Joi.string().valid('Low', 'Medium', 'High'),
      assignee: Joi.string().trim().max(100),
      labels: Joi.array().items(Joi.string().hex().length(24)),
    }).min(1).required(),
  }),

  bulkDelete: Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).max(100).required(),
  }),

  // MongoDB ObjectId
  objectId: Joi.object({
    id: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Invalid ID format',
        'string.length': 'Invalid ID format',
      }),
  }),
};

// Validation middleware factory
const validate = (schemaName, property = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new AppError(`Validation schema '${schemaName}' not found`, 500));
    }

    const dataToValidate = property === 'params' ? req.params :
                           property === 'query' ? req.query : req.body;

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('; ');
      return next(new AppError(messages, 400, ErrorTypes.VALIDATION_ERROR));
    }

    // Replace with validated and sanitized values
    if (property === 'params') {
      req.params = value;
    } else if (property === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

// Validate ObjectId parameter
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400, ErrorTypes.VALIDATION_ERROR));
    }
    
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateObjectId,
};
