"use strict";

const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  { position: { type: Number, required: true }, label: { type: String, required: true }, amount: { type: Number, required: true } },
  { _id: false }
);

const CompetitionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    coverImage: { type: String, default: "" },
    prizeVideoUrl: { type: String, default: "" },
    category: { type: String, default: "Dance" },
    format: { type: String, default: "Multi-Win" },
    certificateNote: { type: String, default: "Winners get certificate" },
    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    bookedSpots: { type: Number, default: 0, min: 0 },
    version: { type: Number, default: 0 }, // optimistic-concurrency helper
    judge: {
      name: { type: String, required: true },
      role: { type: String, default: "Judge" },
      bio: { type: String, default: "" },
      experience: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
      introVideoUrl: { type: String, default: "" },
    },
    dates: {
      registerBefore: { type: Date, required: true },
      submissionStarts: { type: Date, required: true },
      submissionEnds: { type: Date, required: true },
      resultDate: { type: Date, required: true },
    },
    previousWinners: [
      {
        name: String,
        rankLabel: String,
        thumbnailUrl: String,
        videoUrl: String,
      },
    ],
    about: { type: String, default: "" },
    aboutMore: { type: String, default: "" },
    judgingParameters: [{ type: String }],
    rules: [{ type: String }],
    rewards: [RewardSchema],
    referral: {
      link: { type: String, default: "" },
      codePrefix: { type: String, default: "FEED" },
      perSignupReward: { type: Number, default: 10 },
    },
    statusOverride: { type: String, enum: ["", "cancelled"], default: "" },
  },
  { timestamps: true }
);

// Guard: bookedSpots never exceeds capacity at schema level
CompetitionSchema.pre("save", function (next) {
  if (this.bookedSpots > this.capacity) {
    return next(new Error("bookedSpots cannot exceed capacity"));
  }
  next();
});

module.exports = mongoose.model("Competition", CompetitionSchema);
