"use strict";

const express = require("express");

const router = express.Router();

/**
 * DEMO/MOCK payment router — backend-owned.
 * No secrets (Razorpay key/secret) are EVER required in, or sent to, React Native.
 * - Without RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET: returns clearly-marked MOCK intents.
 * - With real credentials: this is the single place to call Razorpay Orders API
 *   + verify webhook signatures (see README "Real Razorpay" section).
 */
router.post("/mock-checkout", (req, res) => {
  const { userId, competitionSlug, amount } = req.body || {};
  if (!userId || !competitionSlug) {
    return res.status(400).json({ error: "userId and competitionSlug are required" });
  }
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    // Placeholder where the real Razorpay Orders API call would live.
    return res.status(501).json({ error: "Real Razorpay not wired — credentials present but order creation not implemented in demo", demo: false });
  }
  return res.json({
    data: {
      demo: true,
      provider: "mock",
      orderId: `mock_order_${Date.now()}`,
      amount: Number(amount) || 0,
      message: "DEMO payment — no real money moved. Configure RAZORPAY_KEY_ID/SECRET (backend only) for production.",
    },
  });
});

module.exports = router;
