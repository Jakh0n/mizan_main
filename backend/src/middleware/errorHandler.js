'use strict';

const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', details);
  } else if (error instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  } else if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value for ${field}`);
  } else if (error?.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token');
  } else if (error?.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token expired');
  } else if (!(error instanceof ApiError)) {
    logger.error('Unhandled error', { message: error?.message, stack: error?.stack });
    error = ApiError.internal(error?.message || 'Unexpected error');
  }

  const payload = {
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(env.isProd ? {} : { stack: error.stack }),
  };

  res.status(error.statusCode || 500).json(payload);
};

module.exports = { notFoundHandler, errorHandler };
