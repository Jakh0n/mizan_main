'use strict';

const Joi = require('joi');
const { UNIT_VALUES } = require('../../constants/inventory');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid id');

const create = {
  body: Joi.object({
    name: Joi.string().min(1).max(160).required(),
    sku: Joi.string().max(64).allow('', null),
    category: Joi.string().max(64).allow('', null),
    unit: Joi.string().valid(...UNIT_VALUES).default('pcs'),
    price: Joi.number().min(0).default(0),
    cost: Joi.number().min(0).default(0),
    stock: Joi.number().min(0).default(0),
    lowStockThreshold: Joi.number().min(0).default(5),
    barcode: Joi.string().max(64).allow('', null),
    description: Joi.string().max(1000).allow('', null),
    aliases: Joi.array().items(Joi.string().max(80)).default([]),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(1).max(160),
    sku: Joi.string().max(64).allow('', null),
    category: Joi.string().max(64).allow('', null),
    unit: Joi.string().valid(...UNIT_VALUES),
    price: Joi.number().min(0),
    cost: Joi.number().min(0),
    lowStockThreshold: Joi.number().min(0),
    barcode: Joi.string().max(64).allow('', null),
    description: Joi.string().max(1000).allow('', null),
    aliases: Joi.array().items(Joi.string().max(80)),
  }).min(1),
};

const getOne = { params: Joi.object({ id: objectId.required() }) };
const remove = { params: Joi.object({ id: objectId.required() }) };

const list = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    search: Joi.string().allow('').max(120),
    category: Joi.string().max(64),
    lowStock: Joi.boolean(),
  }),
};

module.exports = { create, update, getOne, remove, list };
