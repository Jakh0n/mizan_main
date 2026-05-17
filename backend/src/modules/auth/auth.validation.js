'use strict';

const Joi = require('joi');

const register = {
  body: Joi.object({
    fullName: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(64).required(),
    businessName: Joi.string().min(2).max(120).required(),
    industry: Joi.string()
      .valid('restaurant', 'cafe', 'market', 'warehouse', 'other')
      .default('other'),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const refresh = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = { register, login, refresh };
