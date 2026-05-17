'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  if (!env.mongo.uri) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    const conn = await mongoose.connect(env.mongo.uri, {
      autoIndex: !env.isProd,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message });
    throw err;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };
