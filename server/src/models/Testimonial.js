"use strict";

const mongoose = require("mongoose");

/**
 * Minimal testimonials backing the "Hear From Our Users" card.
 * Seed rows are clearly-marked demo/sample content (isDemo: true) —
 * never presented as verified customers.
 */
const TestimonialSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    name: { type: String, required: true, maxlength: 128 },
    text: { type: String, required: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isDemo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", TestimonialSchema);
