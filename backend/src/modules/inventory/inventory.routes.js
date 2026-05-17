'use strict';

const { Router } = require('express');
const controller = require('./inventory.controller');
const validation = require('./inventory.validation');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/transactions', validate(validation.listTransactions), controller.list);
router.post('/transactions', validate(validation.createTransaction), controller.create);

module.exports = router;
