"use strict";

require("dotenv").config();
const { connectDB } = require("./config/db");
const Competition = require("./models/Competition");
const { seedDoc } = require("./seedData");

async function main() {
  await connectDB();
  await Competition.deleteMany({ slug: "feedants-classical-dance" });
  const doc = await Competition.create(seedDoc());
  console.log("[seed] competition:", doc.slug, doc._id.toString());
  console.log("[seed] NOTE: with the in-memory dev fallback each process has its own DB — the running server auto-seeds itself on boot, so no separate seed step is needed for local dev.");
  const mongoose = require("mongoose");
  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
