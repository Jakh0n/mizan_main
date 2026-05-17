'use strict';

const morgan = require('morgan');
const logger = require('../utils/logger');
const env = require('../config/env');

const stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

const format = env.isProd ? 'combined' : 'dev';

const requestLogger = morgan(format, {
  stream,
  skip: (req) => req.url === '/health',
});

module.exports = requestLogger;
