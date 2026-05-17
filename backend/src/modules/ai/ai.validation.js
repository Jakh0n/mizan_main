'use strict';

const Joi = require('joi');

const parseText = {
  body: Joi.object({
    text: Joi.string().min(2).max(2000).required(),
  }),
};

module.exports = { parseText };
