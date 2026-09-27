"use strict";

const mongoose = require("mongoose");

let memoryServer = null;
let mode = "unknown";

function getMode() {
  return mode;
}

/**
 * MongoDB connection.
 * - Production (NODE_ENV=production) REQUIRES MONGODB_URI (real MongoDB/Atlas).
 *   The in-memory server is NEVER used in production.
 * - Development/test without MONGODB_URI falls back to mongodb-memory-server
 *   so the assignment runs on machines without mongod/docker.
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    mode = "external";
    console.log("[db] connected to MongoDB (MONGODB_URI)");
    return { stop: async () => mongoose.disconnect() };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI is required in production (in-memory fallback is dev/test only)");
  }
  console.warn("[db] MONGODB_URI unset — using in-memory MongoDB DEV FALLBACK (not for production)");
  const { MongoMemoryServer } = require("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  mode = "memory-fallback";
  return { stop: async () => { await mongoose.disconnect(); await memoryServer.stop(); } };
}

module.exports = { connectDB, getMode };
