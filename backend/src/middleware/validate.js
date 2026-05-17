'use strict';

const ApiError = require('../utils/ApiError');

const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});

const validate = (schema) => (req, _res, next) => {
  const validSegments = ['body', 'query', 'params'];
  const object = pick(req, validSegments);
  const toValidate = {};

  validSegments.forEach((segment) => {
    if (schema[segment]) {
      toValidate[segment] = object[segment] || {};
    }
  });

  const compoundSchema = {};
  validSegments.forEach((segment) => {
    if (schema[segment]) compoundSchema[segment] = schema[segment];
  });

  const Joi = require('joi');
  const compiled = Joi.object(compoundSchema).unknown(true);
  const { value, error } = compiled.validate(toValidate, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
