"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const competitions = require("./routes/competitions");
const { getMode } = require("./config/db");

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "256kb" }));

  // CORS: allow configured origins; default permissive for local dev/Expo only.
  const origins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: origins.length ? origins : true,
      methods: ["GET", "POST", "OPTIONS"],
    })
  );

  // Abuse protection for write routes under high concurrency
  const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
  app.use("/api/competitions", writeLimiter);
  app.use("/api/payments", writeLimiter);

  app.get("/api/health", (req, res) =>
    res.json({ ok: true, time: new Date().toISOString(), dbMode: getMode(), env: process.env.NODE_ENV || "development" })
  );
  app.use("/api/competitions", competitions);
  app.use("/api/payments", require("./routes/payments"));

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  // Safe error responses: never leak stacks/traces to clients
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("[api-error]", err.message);
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    res.status(status).json({ error: status === 500 ? "Internal error" : err.message || "Request failed" });
  });
  return app;
}

module.exports = { createApp };
