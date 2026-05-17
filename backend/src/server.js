'use strict';

const buildApp = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');

const start = async () => {
  await connectDB();
  const app = buildApp();

  const server = app.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}${env.apiPrefix}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message });
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error('Server failed to start', { error: err.message });
  process.exit(1);
});
