"use strict";

/**
 * Derive lifecycle + user-action state from dates/capacity.
 * States: registration_open | full | registration_closed | submission_open
 *        | submission_closed | result_declared | cancelled | ended
 */
function getCompetitionState(comp, now = new Date()) {
  if (comp.statusOverride === "cancelled") return "cancelled";
  const t = now.getTime();
  const rb = new Date(comp.dates.registerBefore).getTime();
  const ss = new Date(comp.dates.submissionStarts).getTime();
  const se = new Date(comp.dates.submissionEnds).getTime();
  const rd = new Date(comp.dates.resultDate).getTime();
  const spotsLeft = comp.capacity - comp.bookedSpots;

  if (t >= rd) return "result_declared";
  if (t >= se) return "submission_closed";
  // Registration window takes precedence while it is still open
  // (design has Submission Starts BEFORE Register Before — they overlap).
  if (t <= rb) return spotsLeft <= 0 ? "full" : "registration_open";
  if (t >= ss) return "submission_open";
  return "registration_closed";
}

function toCompetitionDTO(comp, registration, extra = {}) {
  const state = getCompetitionState(comp);
  const spotsLeft = Math.max(0, comp.capacity - comp.bookedSpots);
  const now = Date.now();
  const ms = (d) => Math.max(0, new Date(d).getTime() - now);
  const isRegistered = !!registration && registration.status === "registered";
  const canRegister = state === "registration_open" && !isRegistered;
  // Upload allowed for registered users once the submission window opens,
  // independent of whether late registration is still open (overlap period).
  const nowMs = now;
  const subOpen =
    nowMs >= new Date(comp.dates.submissionStarts).getTime() &&
    nowMs < new Date(comp.dates.submissionEnds).getTime() &&
    nowMs < new Date(comp.dates.resultDate).getTime();

  return {
    id: comp._id,
    slug: comp.slug,
    title: comp.title,
    category: comp.category,
    format: comp.format,
    certificateNote: comp.certificateNote,
    prizePool: comp.prizePool,
    entryFee: comp.entryFee,
    capacity: comp.capacity,
    bookedSpots: comp.bookedSpots,
    spotsLeft,
    judge: comp.judge,
    dates: comp.dates,
    previousWinners: comp.previousWinners,
    about: comp.about,
    aboutMore: comp.aboutMore,
    judgingParameters: comp.judgingParameters,
    rules: comp.rules,
    rewards: comp.rewards,
    referral: comp.referral,
    // Backend-generated per-user referral code (see GET .../referral?userId=).
    // Never mints reward on click — credit accrues only on real registration.
    referralCode: extra.referralCode || "",
    // Payment is DEMO/MOCK unless Razorpay env is configured (see README).
    paymentDemo: extra.paymentDemo !== false,
    state,
    isRegistered,
    canRegister,
    // Upload allowed only for registered users once submission window opens.
    // (During registration window the CTA shows "Registered" but upload is queued.)
    canUploadSubmission: isRegistered && subOpen,
    countdown: {
      registrationClosesInMs: state === "registration_open" ? ms(comp.dates.registerBefore) : 0,
      submissionStartsInMs: ms(comp.dates.submissionStarts),
      submissionEndsInMs: ms(comp.dates.submissionEnds),
      resultInMs: ms(comp.dates.resultDate),
    },
    registration: registration
      ? {
          status: registration.status,
          submissionUrl: registration.submissionUrl || "",
          submissionFileType: registration.submissionFileType || "",
          submissionFileSizeBytes: registration.submissionFileSizeBytes || 0,
          submittedAt: registration.submittedAt || null,
          payment: registration.payment || { provider: "mock", status: "paid" },
        }
      : null,
  };
}

module.exports = { getCompetitionState, toCompetitionDTO };
