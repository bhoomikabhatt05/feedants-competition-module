"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");

const { createApp } = require("../src/app");
const { connectDB } = require("../src/config/db");
const Competition = require("../src/models/Competition");
const Registration = require("../src/models/Registration");
const { getCompetitionState } = require("../src/utils/lifecycle");

let app, handle, compId;
const H = 3600 * 1000, D = 24 * H;

async function makeComp(overrides = {}) {
  const now = Date.now();
  return Competition.create({
    slug: `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    title: "Test Comp",
    prizePool: 1500,
    entryFee: 99,
    capacity: 2,
    bookedSpots: 0,
    judge: { name: "J" },
    dates: {
      registerBefore: new Date(now + H),
      submissionStarts: new Date(now - H),
      submissionEnds: new Date(now + H),
      resultDate: new Date(now + 2 * H),
    },
    rewards: [{ position: 1, label: "1st Winner", amount: 100 }],
    ...overrides,
  });
}

before(async () => {
  handle = await connectDB();
  app = createApp();
  const c = await makeComp({ slug: "feedants-classical-dance-test", capacity: 20, bookedSpots: 1 });
  compId = c._id.toString();
});

after(async () => {
  await mongoose.connection.db.dropDatabase().catch(() => {});
  await handle.stop();
});

describe("health + detail", () => {
  it("health ok", async () => {
    const r = await request(app).get("/api/health");
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
  });
  it("detail returns computed state", async () => {
    const r = await request(app).get(`/api/competitions/${compId}?userId=u1`);
    assert.equal(r.status, 200);
    assert.equal(r.body.data.spotsLeft, 19);
    assert.ok(r.body.data.state);
  });
  it("unknown slug -> 404", async () => {
    const r = await request(app).get("/api/competitions/nope-not-here?userId=u1");
    assert.equal(r.status, 404);
  });
  it("auth required on register (401, not 500)", async () => {
    const r = await request(app).post(`/api/competitions/${compId}/register`).send({ userId: "!!" });
    assert.equal(r.status, 401);
  });
});

describe("lifecycle states", () => {
  it("covers all six states", async () => {
    const now = Date.now();
    const cases = [
      ["registration_open", { registerBefore: new Date(now + 2 * D), submissionStarts: new Date(now - 5 * D), submissionEnds: new Date(now + 5 * D), resultDate: new Date(now + 10 * D) }, { capacity: 5, bookedSpots: 0 }],
      ["full", { registerBefore: new Date(now + 2 * D), submissionStarts: new Date(now - 5 * D), submissionEnds: new Date(now + 5 * D), resultDate: new Date(now + 10 * D) }, { capacity: 2, bookedSpots: 2 }],
      ["registration_closed", { registerBefore: new Date(now - 2 * D), submissionStarts: new Date(now + 2 * D), submissionEnds: new Date(now + 5 * D), resultDate: new Date(now + 10 * D) }, {}],
      ["submission_open", { registerBefore: new Date(now - 2 * D), submissionStarts: new Date(now - D), submissionEnds: new Date(now + 2 * D), resultDate: new Date(now + 10 * D) }, {}],
      ["submission_closed", { registerBefore: new Date(now - 9 * D), submissionStarts: new Date(now - 8 * D), submissionEnds: new Date(now - 2 * D), resultDate: new Date(now + 5 * D) }, {}],
      ["result_declared", { registerBefore: new Date(now - 20 * D), submissionStarts: new Date(now - 19 * D), submissionEnds: new Date(now - 10 * D), resultDate: new Date(now - D) }, {}],
    ];
    for (const [want, dates, extra] of cases) {
      const c = await makeComp({ dates, ...extra });
      assert.equal(getCompetitionState(c, new Date()), want, `expected ${want}`);
    }
  });
});

describe("registration concurrency + validation", () => {
  it("registers and blocks duplicates (409 DUPLICATE)", async () => {
    const r1 = await request(app).post(`/api/competitions/${compId}/register`).send({ userId: "alice", idempotencyKey: "k1" });
    assert.equal(r1.status, 201);
    const r2 = await request(app).post(`/api/competitions/${compId}/register`).send({ userId: "alice", idempotencyKey: "k1" });
    assert.ok([200, 409].includes(r2.status));
    const r3 = await request(app).post(`/api/competitions/${compId}/register`).send({ userId: "alice" });
    assert.equal(r3.status, 409);
    assert.equal(r3.body.code, "DUPLICATE");
  });

  it("never oversells: capacity 3, 10 concurrent distinct users => exactly 3", async () => {
    const c = await makeComp({ capacity: 3, bookedSpots: 0 });
    const id = c._id.toString();
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        request(app).post(`/api/competitions/${id}/register`).send({ userId: `cap3-user-${Date.now()}-${i}` })
      )
    );
    const ok = results.filter((r) => [200, 201].includes(r.status)).length;
    assert.equal(ok, 3);
    const fresh = await Competition.findById(id);
    assert.equal(fresh.bookedSpots, 3);
    const regs = await Registration.countDocuments({ competition: id, status: "registered" });
    assert.equal(regs, 3);
  });

  it("same user, 10 concurrent requests => exactly 1 registration, bookedSpots +1", async () => {
    const c = await makeComp({ capacity: 10, bookedSpots: 0 });
    const id = c._id.toString();
    const me = `same-${Date.now()}`;
    const results = await Promise.all(
      Array.from({ length: 10 }, () => request(app).post(`/api/competitions/${id}/register`).send({ userId: me }))
    );
    const ok = results.filter((r) => [200, 201].includes(r.status)).length;
    assert.equal(ok, 1);
    const fresh = await Competition.findById(id);
    assert.equal(fresh.bookedSpots, 1);
    const regs = await Registration.countDocuments({ competition: id, userId: me, status: "registered" });
    assert.equal(regs, 1);
  });

  it("rejects registration when closed + full returns FULL code", async () => {
    const c = await makeComp({
      dates: {
        registerBefore: new Date(Date.now() - 1000),
        submissionStarts: new Date(Date.now() - 2000),
        submissionEnds: new Date(Date.now() + H),
        resultDate: new Date(Date.now() + 2 * H),
      },
    });
    const r = await request(app).post(`/api/competitions/${c._id}/register`).send({ userId: "late" });
    assert.equal(r.status, 409);
    const full = await makeComp({ capacity: 1, bookedSpots: 1 });
    const rf = await request(app).post(`/api/competitions/${full._id}/register`).send({ userId: "unlucky" });
    assert.equal(rf.status, 409);
    assert.equal(rf.body.code, "FULL");
  });
});

describe("submission validation", () => {
  it("403 for unregistered, 400 invalid type/size, 200 happy path changes state", async () => {
    const now = Date.now();
    const c = await makeComp({
      capacity: 5,
      dates: {
        registerBefore: new Date(now + H),
        submissionStarts: new Date(now - 1000),
        submissionEnds: new Date(now + H),
        resultDate: new Date(now + 2 * H),
      },
    });
    const id = c._id.toString();
    const bad = await request(app).post(`/api/competitions/${id}/submit`).send({ userId: "ghost", submissionUrl: "https://x.com/v.mp4" });
    assert.equal(bad.status, 403);
    await request(app).post(`/api/competitions/${id}/register`).send({ userId: "performer" });
    const badType = await request(app).post(`/api/competitions/${id}/submit`).send({ userId: "performer", submissionUrl: "https://x.com/v.exe", fileType: "application/x-msdownload" });
    assert.equal(badType.status, 400);
    const badSize = await request(app).post(`/api/competitions/${id}/submit`).send({ userId: "performer", submissionUrl: "https://x.com/v.mp4", fileSizeBytes: 99999999999 });
    assert.equal(badSize.status, 400);
    const ok = await request(app).post(`/api/competitions/${id}/submit`).send({ userId: "performer", submissionUrl: "https://x.com/v.mp4", fileType: "video/mp4", fileSizeBytes: 50 * 1024 * 1024 });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.registration.submissionUrl, "https://x.com/v.mp4");
    assert.ok(ok.body.data.registration.submittedAt);
  });
});

describe("referral + payment mock", () => {
  it("backend generates code; credit only on real registration", async () => {
    const c = await makeComp({ capacity: 10 });
    const id = c._id.toString();
    const r1 = await request(app).get(`/api/competitions/${id}/referral?userId=owner1`);
    assert.equal(r1.status, 200);
    assert.ok(r1.body.data.code);
    const before = r1.body.data.signupCount;
    // Clicking (fetching code) grants nothing
    const r2 = await request(app).get(`/api/competitions/${id}/referral?userId=owner1`);
    assert.equal(r2.body.data.signupCount, before);
    // Real registration with the code credits the owner
    await request(app).post(`/api/competitions/${id}/register`).send({ userId: "friend1", referralCode: r1.body.data.code });
    const r3 = await request(app).get(`/api/competitions/${id}/referral?userId=owner1`);
    assert.equal(r3.body.data.signupCount, before + 1);
    assert.ok(r3.body.data.creditEarned >= 10);
  });
  it("mock payment is clearly DEMO and backend-owned", async () => {
    const r = await request(app).post("/api/payments/mock-checkout").send({ userId: "u", competitionSlug: "x", amount: 99 });
    assert.equal(r.status, 200);
    assert.equal(r.body.data.demo, true);
  });
});
