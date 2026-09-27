"use strict";

const express = require("express");
const Competition = require("../models/Competition");
const Registration = require("../models/Registration");
const Referral = require("../models/Referral");
const { toCompetitionDTO, getCompetitionState } = require("../utils/lifecycle");

const router = express.Router();

/**
 * Demo authentication: the mobile app persists a per-device `userId`
 * (see mobile/src/api.js getUserId). Every protected endpoint requires it.
 * Production would replace this with JWT verification (Authorization: Bearer).
 */
function requireUserId(value) {
  if (typeof value !== "string") return null;
  const id = value.trim();
  if (!/^[A-Za-z0-9_-]{3,128}$/.test(id)) return null;
  return id;
}

function makeReferralCode(prefix, userId) {
  const clean = String(userId).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12) || "USER";
  return `${prefix || "FEED"}-${clean}`;
}

async function getOrCreateReferral(comp, userId) {
  const code = makeReferralCode(comp.referral && comp.referral.codePrefix, userId);
  let ref = await Referral.findOne({ competition: comp._id, ownerUserId: userId });
  if (!ref) {
    try {
      ref = await Referral.create({ competition: comp._id, ownerUserId: userId, code });
    } catch (e) {
      if (e && e.code === 11000) ref = await Referral.findOne({ competition: comp._id, ownerUserId: userId });
      else throw e;
    }
  }
  return ref;
}

async function loadCompetition(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const query = /^[0-9a-fA-F]{24}$/.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const comp = await Competition.findOne(query);
    if (!comp) return res.status(404).json({ error: "Competition not found" });
    req.competition = comp;
    next();
  } catch (e) { next(e); }
}

async function loadMyRegistration(compId, userId) {
  if (!userId) return null;
  return Registration.findOne({ competition: compId, userId, status: "registered" });
}

// GET /api/competitions
router.get("/", async (req, res, next) => {
  try {
    const comps = await Competition.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ data: comps.map((c) => toCompetitionDTO(c, null)) });
  } catch (e) { next(e); }
});

// GET /api/competitions/mine?userId=xxx — the caller's participation across competitions
// (registered BEFORE /:idOrSlug so "mine" is never treated as a slug).
router.get("/mine", async (req, res, next) => {
  try {
    const userId = requireUserId(String(req.query.userId || ""));
    if (!userId) return res.status(401).json({ error: "Authentication required (valid userId)" });
    const regs = await Registration.find({ competition: { $exists: true }, userId })
      .populate("competition")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({
      data: regs
        .filter((r) => r.competition)
        .map((r) => ({
          competition: toCompetitionDTO(r.competition, r.status === "registered" ? r : null),
          status: r.status,
          submissionUrl: r.submissionUrl || "",
          submittedAt: r.submittedAt || null,
          updatedAt: r.updatedAt,
        })),
    });
  } catch (e) { next(e); }
});

// GET /api/competitions/:idOrSlug?userId=xxx
router.get("/:idOrSlug", loadCompetition, async (req, res, next) => {
  try {
    const raw = req.query.userId;
    const userId = raw ? requireUserId(String(raw)) : null;
    const reg = userId ? await loadMyRegistration(req.competition._id, userId) : null;
    const ref = userId ? await getOrCreateReferral(req.competition, userId).catch(() => null) : null;
    res.json({ data: toCompetitionDTO(req.competition, reg, { referralCode: ref ? ref.code : "" }) });
  } catch (e) { next(e); }
});

// GET /api/competitions/:idOrSlug/testimonials — public demo/sample reviews
router.get("/:idOrSlug/testimonials", loadCompetition, async (req, res, next) => {
  try {
    const Testimonial = require("../models/Testimonial");
    const items = await Testimonial.find({ competition: req.competition._id })
      .sort({ createdAt: 1 })
      .limit(20);
    res.json({
      data: items.map((t) => ({
        name: t.name,
        text: t.text,
        rating: t.rating,
        isDemo: t.isDemo,
      })),
    });
  } catch (e) { next(e); }
});

// GET /api/competitions/:idOrSlug/referral?userId=xxx — backend-generated code
router.get("/:idOrSlug/referral", loadCompetition, async (req, res, next) => {
  try {
    const userId = requireUserId(String(req.query.userId || ""));
    if (!userId) return res.status(401).json({ error: "Authentication required (valid userId)" });
    const ref = await getOrCreateReferral(req.competition, userId);
    const perSignup = (req.competition.referral && req.competition.referral.perSignupReward) || 10;
    res.json({ data: { code: ref.code, signupCount: ref.signupCount, creditEarned: ref.creditEarned, perSignupReward: perSignup } });
  } catch (e) { next(e); }
});

/**
 * POST /api/competitions/:idOrSlug/register  { userId, idempotencyKey?, referralCode? }
 * Concurrency-safe: single atomic findOneAndUpdate that only succeeds when
 *   bookedSpots < capacity AND registration window still open (checked in query).
 * Duplicate registration is blocked by partial unique index; idempotent retries
 * with the same idempotencyKey return the original registration.
 * Status codes: 201 created, 200 idempotent replay, 400 validation,
 * 401 bad auth, 404 unknown competition, 409 full/closed/duplicate.
 */
router.post("/:idOrSlug/register", loadCompetition, async (req, res, next) => {
  try {
    const userId = requireUserId((req.body || {}).userId);
    if (!userId) return res.status(401).json({ error: "Authentication required (valid userId)" });
    const { idempotencyKey, referralCode } = req.body || {};
    if (idempotencyKey && (typeof idempotencyKey !== "string" || idempotencyKey.length > 256)) {
      return res.status(400).json({ error: "Invalid idempotencyKey" });
    }
    const comp = req.competition;
    const now = new Date();
    const state = getCompetitionState(comp, now);
    if (state !== "registration_open") {
      return res.status(409).json({ error: state === "full" ? "Competition is full" : `Registration not open (state=${state})`, state, code: state === "full" ? "FULL" : state === "registration_closed" ? "CLOSED" : "NOT_OPEN" });
    }

    if (idempotencyKey) {
      const existing = await Registration.findOne({ competition: comp._id, userId, idempotencyKey });
      if (existing) {
        const fresh = await Competition.findById(comp._id);
        const ref = await getOrCreateReferral(fresh, userId).catch(() => null);
        return res.json({ data: toCompetitionDTO(fresh, existing, { referralCode: ref ? ref.code : "" }), deduped: true });
      }
    }

    const already = await Registration.findOne({ competition: comp._id, userId, status: "registered" });
    if (already) {
      return res.status(409).json({ error: "Already registered", state, code: "DUPLICATE" });
    }

    // Atomic seat claim — the core anti-oversell guard under thousands of
    // concurrent users. Only one winner per seat even with parallel requests.
    const updated = await Competition.findOneAndUpdate(
      {
        _id: comp._id,
        bookedSpots: { $lt: comp.capacity },
        "dates.registerBefore": { $gt: now },
        statusOverride: { $ne: "cancelled" },
      },
      { $inc: { bookedSpots: 1, version: 1 } },
      { new: true }
    );
    if (!updated) {
      const fresh = await Competition.findById(comp._id);
      const s = getCompetitionState(fresh, new Date());
      return res.status(409).json({ error: s === "full" ? "Competition is full" : `Registration not open (state=${s})`, state: s, code: s === "full" ? "FULL" : "CLOSED" });
    }

    try {
      const reg = await Registration.create({
        competition: comp._id,
        userId,
        status: "registered",
        idempotencyKey: idempotencyKey || undefined,
        entryFeePaid: comp.entryFee,
        payment: { provider: process.env.RAZORPAY_KEY_ID ? "razorpay" : "mock", status: "paid" },
        referredByCode: typeof referralCode === "string" ? referralCode.slice(0, 64) : "",
      });
      // Referral credit ONLY on completed registration with another user's valid code.
      if (reg.referredByCode) {
        const ownerRef = await Referral.findOne({ competition: comp._id, code: reg.referredByCode });
        if (ownerRef && ownerRef.ownerUserId !== userId) {
          const perSignup = (comp.referral && comp.referral.perSignupReward) || 10;
          await Referral.updateOne(
            { _id: ownerRef._id },
            { $inc: { signupCount: 1, creditEarned: perSignup } }
          );
        }
      }
      const ref = await getOrCreateReferral(updated, userId).catch(() => null);
      return res.status(201).json({ data: toCompetitionDTO(updated, reg, { referralCode: ref ? ref.code : "" }) });
    } catch (err) {
      // Lost the uniqueness race (double-click / retry): release the seat.
      await Competition.findByIdAndUpdate(comp._id, { $inc: { bookedSpots: -1, version: 1 } });
      if (err && err.code === 11000) {
        const existing = await Registration.findOne({ competition: comp._id, userId, status: "registered" });
        const fresh = await Competition.findById(comp._id);
        return res.status(409).json({ error: "Already registered", code: "DUPLICATE", data: existing ? toCompetitionDTO(fresh, existing) : undefined });
      }
      throw err;
    }
  } catch (e) { next(e); }
});

// POST /api/competitions/:idOrSlug/cancel  { userId } — releases seat
router.post("/:idOrSlug/cancel", loadCompetition, async (req, res, next) => {
  try {
    const userId = requireUserId((req.body || {}).userId);
    if (!userId) return res.status(401).json({ error: "Authentication required (valid userId)" });
    const reg = await Registration.findOneAndUpdate(
      { competition: req.competition._id, userId, status: "registered" },
      { $set: { status: "cancelled" } },
      { new: true }
    );
    if (!reg) return res.status(404).json({ error: "No active registration" });
    const updated = await Competition.findByIdAndUpdate(
      req.competition._id, { $inc: { bookedSpots: -1, version: 1 } }, { new: true }
    );
    res.json({ data: toCompetitionDTO(updated, null) });
  } catch (e) { next(e); }
});

const ALLOWED_SUBMISSION_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_SUBMISSION_EXTS = [".mp4", ".mov", ".webm"];
const MAX_SUBMISSION_BYTES = 500 * 1024 * 1024; // 500 MB

// POST /api/competitions/:idOrSlug/submit  { userId, submissionUrl, fileType?, fileSizeBytes? }
// NOTE (demo limitation): no cloud storage is provisioned — the backend validates
// and records the submission URL/metadata. Production would use signed S3/GCS URLs.
router.post("/:idOrSlug/submit", loadCompetition, async (req, res, next) => {
  try {
    const userId = requireUserId((req.body || {}).userId);
    if (!userId) return res.status(401).json({ error: "Authentication required (valid userId)" });
    const { submissionUrl, fileType, fileSizeBytes } = req.body || {};
    if (!submissionUrl || typeof submissionUrl !== "string" || !/^https?:\/\/.+/i.test(submissionUrl) || submissionUrl.length > 2048) {
      return res.status(400).json({ error: "Valid submissionUrl (http/https, max 2048 chars) is required", code: "INVALID_URL" });
    }
    const lower = submissionUrl.split("?")[0].toLowerCase();
    const extOk = ALLOWED_SUBMISSION_EXTS.some((e) => lower.endsWith(e));
    if (fileType && !ALLOWED_SUBMISSION_TYPES.includes(fileType)) {
      return res.status(400).json({ error: `Unsupported file type. Allowed: ${ALLOWED_SUBMISSION_TYPES.join(", ")}`, code: "INVALID_TYPE" });
    }
    if (!fileType && !extOk) {
      return res.status(400).json({ error: `URL must end with ${ALLOWED_SUBMISSION_EXTS.join(", ")} or provide a valid fileType`, code: "INVALID_TYPE" });
    }
    if (fileSizeBytes !== undefined) {
      const n = Number(fileSizeBytes);
      if (!Number.isFinite(n) || n <= 0 || n > MAX_SUBMISSION_BYTES) {
        return res.status(400).json({ error: `fileSizeBytes must be 1–${MAX_SUBMISSION_BYTES}`, code: "INVALID_SIZE" });
      }
    }
    const now = new Date();
    const ss = new Date(req.competition.dates.submissionStarts).getTime();
    const se = new Date(req.competition.dates.submissionEnds).getTime();
    const rd = new Date(req.competition.dates.resultDate).getTime();
    if (!(now.getTime() >= ss && now.getTime() < se && now.getTime() < rd)) {
      const state = getCompetitionState(req.competition, now);
      return res.status(409).json({ error: `Submissions not open (state=${state})`, state, code: "WINDOW_CLOSED" });
    }
    const reg = await Registration.findOneAndUpdate(
      { competition: req.competition._id, userId, status: "registered" },
      { $set: { submissionUrl, submissionFileType: fileType || "", submissionFileSizeBytes: Number(fileSizeBytes) || 0, submittedAt: new Date() } },
      { new: true }
    );
    if (!reg) return res.status(403).json({ error: "Only registered participants can submit", code: "NOT_REGISTERED" });
    res.json({ data: toCompetitionDTO(req.competition, reg) });
  } catch (e) { next(e); }
});

module.exports = router;
