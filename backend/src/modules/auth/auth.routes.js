'use strict';

const { Router } = require('express');
const controller = require('./auth.controller');
const validation = require('./auth.validation');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = Router();

router.post('/register', authLimiter, validate(validation.register), controller.register);
router.post('/login', authLimiter, validate(validation.login), controller.login);
router.post('/refresh', validate(validation.refresh), controller.refresh);
router.get('/me', authenticate, controller.me);

module.exports = router;
