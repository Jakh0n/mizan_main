'use strict';

const { createLogger, format, transports } = require('winston');
const env = require('../config/env');

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';
    return `${timestamp} ${level} ${message}${metaString}`;
  })
);

const prodFormat = format.combine(format.timestamp(), format.json());

const logger = createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: env.isProd ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

module.exports = logger;
