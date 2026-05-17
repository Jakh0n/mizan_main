"use strict";

const path = require("path");
const dotenv = require("dotenv");

const backendRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing required env variable: ${key}`);
  }
  return value;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 4000,
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",

  mongo: {
    uri: required("MONGO_URI"),
  },

  jwt: {
    accessSecret: required("JWT_SECRET"),
    accessExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
    chatModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || "",
  },

  inventory: {
    lowStockDefaultThreshold:
      Number(process.env.LOW_STOCK_DEFAULT_THRESHOLD) || 5,
  },
};

module.exports = env;
