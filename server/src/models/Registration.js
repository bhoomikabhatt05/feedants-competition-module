"use strict";

const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    userId: { type: String, required: true, index: true, maxlength: 128 },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered", index: true },
    idempotencyKey: { type: String, index: true, sparse: true, maxlength: 256 },
    entryFeePaid: { type: Number, required: true, min: 0 },
    // DEMO/MOCK payment — backend-owned. Real Razorpay order/payment ids go here.
    payment: {
      provider: { type: String, default: "mock" }, // "mock" | "razorpay"
      orderId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "paid" },
    },
    referredByCode: { type: String, default: "", maxlength: 64 },
    submissionUrl: { type: String, default: "", maxlength: 2048 },
    submissionFileType: { type: String, default: "", maxlength: 128 },
    submissionFileSizeBytes: { type: Number, default: 0 },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

// One active registration per user per competition (cancelled docs keep history
// but partial index enforces uniqueness only for status === 'registered').
RegistrationSchema.index(
  { competition: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: "registered" } }
);

module.exports = mongoose.model("Registration", RegistrationSchema);
