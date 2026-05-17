'use strict';

const Joi = require('joi');
const { TRANSACTION_TYPE_VALUES } = require('../../constants/inventory');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid id');

const createTransaction = {
  body: Joi.object({
    productId: objectId.required(),
    type: Joi.string().valid(...TRANSACTION_TYPE_VALUES).required(),
    quantity: Joi.number().positive().required(),
    note: Joi.string().max(500).allow('', null),
  }),
};

const listTransactions = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    productId: objectId,
    type: Joi.string().valid(...TRANSACTION_TYPE_VALUES),
    source: Joi.string(),
    from: Joi.date(),
    to: Joi.date(),
  }),
};

module.exports = { createTransaction, listTransactions };
