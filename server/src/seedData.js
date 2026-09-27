"use strict";

const H = 3600 * 1000;
const D = 24 * H;

function base() {
  return {
    title: "Feedants Classical Dance",
    category: "Dance",
    format: "Multi-Win",
    certificateNote: "Winners get certificate",
    prizePool: 1500,
    entryFee: 99,
    capacity: 20,
    bookedSpots: 1,
    judge: {
      name: "Manju Dubey",
      role: "Judge",
      bio: "Professional Kathak Dancer",
      experience: "12+ Years of Experience",
      avatarUrl: "https://i.pravatar.cc/200?img=47",
      introVideoUrl: "https://example.com/intro.mp4",
    },
    previousWinners: [
      { name: "Riya Shah", rankLabel: "1st Winner", thumbnailUrl: "https://i.pravatar.cc/200?img=32", videoUrl: "https://example.com/w1.mp4" },
      { name: "Aarav Mehta", rankLabel: "1st Winner", thumbnailUrl: "https://i.pravatar.cc/200?img=12", videoUrl: "https://example.com/w2.mp4" },
      { name: "Neha Verma", rankLabel: "2nd Winner", thumbnailUrl: "https://i.pravatar.cc/200?img=45", videoUrl: "https://example.com/w3.mp4" },
      { name: "Ishita Chou", rankLabel: "3rd Winner", thumbnailUrl: "https://i.pravatar.cc/200?img=26", videoUrl: "https://example.com/w4.mp4" },
    ],
    about: "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent.",
    aboutMore: " Express your passion through traditional dance. Record a 2–5 min classical performance, upload it during the submission window, and get judged by experts.",
    judgingParameters: ["Technique & Posture (30)", "Rhythm & Timing (25)", "Expression & Stage Presence (25)", "Costume & Authenticity (20)"],
    rules: [
      "Open to all age groups; solo entries only.",
      "Performance must be 2–5 minutes, classical styles only.",
      "Only contributions from paid participants will be considered for judging.",
      "One entry per registered user; plagiarism leads to disqualification.",
      "Refund as per policy if the competition is cancelled.",
    ],
    rewards: [
      { position: 1, label: "1st Winner", amount: 550 },
      { position: 2, label: "2nd Winner", amount: 300 },
      { position: 3, label: "3rd Winner", amount: 240 },
      { position: 4, label: "4th Winner", amount: 200 },
      { position: 5, label: "5th Winner", amount: 130 },
      { position: 6, label: "6th Winner", amount: 80 },
    ],
    referral: { link: "https://feedants.com/r/referral123", codePrefix: "FEED", perSignupReward: 10 },
  };
}

function seedDoc() {
  const now = Date.now();
  const d = (days, h = 12, m = 0) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + days);
    dt.setHours(h, m, 0, 0);
    return dt;
  };
  return {
    ...base(),
    slug: "feedants-classical-dance",
    dates: {
      // Registration closes ~1d 6h from now so the countdown is always alive
      registerBefore: new Date(now + ((26 * 60 + 28) * 60 + 32) * 1000 + 1 * D),
      submissionStarts: d(-21, 4, 0),
      submissionEnds: d(3, 23, 55),
      resultDate: d(5, 23, 50),
    },
  };
}

/** Extra competitions demonstrating every lifecycle state (slug suffix = state). */
function stateDemoDocs() {
  const now = Date.now();
  const mk = (slug, dates, extra = {}) => ({ ...base(), ...extra, slug, dates });
  return [
    mk("demo-state-full", {
      registerBefore: new Date(now + 2 * D),
      submissionStarts: new Date(now - 5 * D),
      submissionEnds: new Date(now + 5 * D),
      resultDate: new Date(now + 10 * D),
    }, { capacity: 2, bookedSpots: 2 }),
    mk("demo-state-registration-closed", {
      registerBefore: new Date(now - 2 * D),
      submissionStarts: new Date(now + 2 * D),
      submissionEnds: new Date(now + 5 * D),
      resultDate: new Date(now + 10 * D),
    }),
    mk("demo-state-submission-open", {
      registerBefore: new Date(now - 2 * D),
      submissionStarts: new Date(now - 1 * D),
      submissionEnds: new Date(now + 2 * D),
      resultDate: new Date(now + 10 * D),
    }),
    mk("demo-state-submission-closed", {
      registerBefore: new Date(now - 9 * D),
      submissionStarts: new Date(now - 8 * D),
      submissionEnds: new Date(now - 2 * D),
      resultDate: new Date(now + 5 * D),
    }),
    mk("demo-state-result-declared", {
      registerBefore: new Date(now - 20 * D),
      submissionStarts: new Date(now - 19 * D),
      submissionEnds: new Date(now - 10 * D),
      resultDate: new Date(now - 1 * D),
    }),
  ];
}

async function ensureSeeded(Competition) {
  const n = await Competition.countDocuments({ slug: "feedants-classical-dance" });
  if (n === 0) {
    await Competition.create(seedDoc());
    console.log("[db] seeded feedants-classical-dance");
  }
  for (const doc of stateDemoDocs()) {
    const exists = await Competition.countDocuments({ slug: doc.slug });
    if (!exists) await Competition.create(doc);
  }
}

module.exports = { seedDoc, stateDemoDocs, ensureSeeded };
