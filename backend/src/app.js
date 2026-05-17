"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const env = require("./config/env");
const routes = require("./routes");
const requestLogger = require("./middleware/requestLogger");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const buildApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl?.split(",").map((s) => s.trim()) || true,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.get("/health", (_req, res) =>
    res.json({
      success: true,
      status: "ok",
      service: "inventory-saas-backend",
    }),
  );

  app.use(env.apiPrefix, apiLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = buildApp;
