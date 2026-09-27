"use strict";

require("dotenv").config();
const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  const Competition = require("./models/Competition");
  const { ensureSeeded } = require("./seedData");
  await ensureSeeded(Competition);
  const app = createApp();
  app.listen(PORT, () => console.log(`[server] Feedants API listening on :${PORT}`));
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { main };
