'use strict';

const { Router } = require('express');
const controller = require('./ai.controller');
const validation = require('./ai.validation');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.post('/parse-text', validate(validation.parseText), controller.parseText);

module.exports = router;
