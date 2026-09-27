# Feedants Competition Module

Functional Competition Details module for the Feedants Full-Stack Development Internship assignment:
a **React Native (Expo)** screen backed by **Node.js + Express** APIs and **MongoDB** — not a static UI.
Every competition value on screen (title, prize, fee, spots, judge, dates, winners, rewards, registration
and lifecycle state) is served by the backend; the app holds zero hardcoded business data.

## Overview

The screen reproduces the supplied Feedants design reference (Classical Dance competition) as a working
product page: registration with capacity enforcement, a live countdown, date-driven lifecycle states,
submission upload gated by registration + window, backend-generated referrals, and clearly-marked
DEMO payments. Pull-to-refresh re-syncs server truth at any time.

## Features

- Header: back button, ENG/हिंदी toggle, title, category/format tags, Registered badge, certificate note
- Prize pool, entry fee, spots-left progress bar (`bookedSpots / capacity`), judge card + intro-video entry
- Live registration countdown (server date, 1-second ticks, re-fetches lifecycle at zero)
- Important Dates grid, Previous Winners rail, About / Judging Parameters / Rules & Eligibility tabs
- Rewards table (all positions), disclaimer, prize-money + refund/secure-payments cards, Hear From Users, ad slot
- Refer & Earn: backend-issued code, copy + native share, earnings display
- Bottom CTA adapts to state (Register / Full / Closed / Registered / Submitted ✓) + bottom navigation
- Error coverage: loading, network error + retry, competition-not-found, full, duplicate (409),
  payment failure (demo), submission failure + retry, offline stale-cache banner

## Tech Stack

- Frontend: React Native via Expo (~57), `expo-clipboard`, AsyncStorage (device id + last-sync cache)
- Backend: Node.js ≥ 18, Express 4, Mongoose 8, helmet, CORS, express-rate-limit, dotenv
- Database: MongoDB (Mongoose). Dev/test fallback: `mongodb-memory-server` (never in production)
- Tests: `node:test` + `supertest`; mobile verified via `expo export --platform web`

## Architecture

```
mobile/  renders ONLY backend DTOs; caches last sync for labelled offline display
server/  owns ALL business rules: lifecycle, atomic registration, payment verification, referral credit
MongoDB  competitions, registrations (partial unique index), referrals
```

The API tier is stateless and horizontally scalable; the seat-claim is a single atomic
`findOneAndUpdate`, so thousands of concurrent users cannot oversell.

## Folder Structure

```
server/src/
  index.js               boot: connect DB → auto-seed → listen
  app.js                 helmet, CORS, rate limits, routes, safe errors
  config/db.js           MongoDB connection (production guard)
  models/Competition.js  competition + dates + rewards + referral config
  models/Registration.js participation + payment + submission state
  models/Referral.js     backend-issued codes + earned credit
  models/Testimonial.js  demo/sample reviews
  routes/competitions.js detail / register / cancel / submit / referral / testimonials
  routes/payments.js     DEMO/MOCK checkout (backend-owned)
  utils/lifecycle.js     state derivation + DTO
  seedData.js / seed.js  flagship competition + per-state demos + demo media/testimonials
server/test/api.test.js  18 tests (lifecycle, concurrency, validation, referral, payments, testimonials, media, participation)
mobile/
  App.js                 nav-stack shell (home/explore/competitions/details/profile) + details flows
  src/api.js             API client, demo device id, stale-labelled cache — NO business data
  src/hooks.js           countdown (server-based, expiry refresh), date formatting
  src/i18n.js            centralized ENG/हिंदी UI-label dictionary (AsyncStorage-persisted)
  src/screens.js         Home / Explore (search+categories+sections) / Competitions (participation) / Profile
  src/components/cards.js reusable section components (props-only, no hardcoded data)
```

## Prerequisites

- Node ≥ 18, npm
- For device preview: the Expo Go app (or a web browser for `expo start --web`)
- No local MongoDB required for review (dev fallback included); real MongoDB URI for production

## Installation

```bash
cd server && npm install
cd ../mobile && npm install
```

## MongoDB Setup

| Mode | How |
|---|---|
| Local review (this Mac has no mongod) | Leave `MONGODB_URI` empty → in-memory DEV FALLBACK starts automatically, seeded on boot. Data is per-process memory. |
| Real MongoDB | Set `MONGODB_URI` to local (`mongodb://127.0.0.1:27017/feedants`) or Atlas (`mongodb+srv://…`) → server connects and auto-seeds if empty. |
| Production | `NODE_ENV=production` **requires** `MONGODB_URI`; boot throws otherwise. The in-memory server is never used in production. |

Switching needs no code change — just set/unset `MONGODB_URI`.

## Environment Variables

```bash
# server/.env (never committed; see .env.example)
PORT=4000
MONGODB_URI=            # empty = dev fallback; REQUIRED in production
CORS_ORIGIN=            # comma-separated origins; empty = permissive local dev
JWT_SECRET=             # reserved for production JWT auth (demo auth needs none)
RAZORPAY_KEY_ID=        # BACKEND ONLY; empty = DEMO/MOCK payments
RAZORPAY_KEY_SECRET=    # BACKEND ONLY; never in React Native / EXPO_PUBLIC_*

# mobile (safe to expose)
EXPO_PUBLIC_API_URL=http://localhost:4000   # physical device: http://<lan-ip>:4000
```

## Seed Data

```bash
cd server && npm run seed
```

The server also **auto-seeds on boot** (idempotent, stable slugs): `feedants-classical-dance`
(registration_open, live countdown) plus five distinct demo competitions — Urban Photography Challenge
(open), Indie Music Showcase (submission_open), Digital Art Sprint (submission_closed), Creative Writing
Challenge (registration_closed), Monsoon Dance Fest (result_declared) — so every lifecycle state is
demonstrable and Explore/Competitions listings show distinct titles. The flagship mirrors the
design: prize ₹1500, fee ₹99, capacity 20 (1 booked), judge Manju Dubey, rewards ₹550–80.
Judge/winner/judge-portrait photos are category-relevant **demo stand-ins** (freely licensed
Wikimedia Commons dance, camera, guitar, studio and typewriter photos — verified `200 image/*`),
videos are public sample MP4s, and testimonials are `isDemo: true` reviews — stand-ins until real
Feedants media is provided. They are served from the backend like production media would be.
The same photos are bundled under `mobile/assets/` as offline fallbacks, so the UI always shows
real photography even if a remote fetch fails.

## Running Backend

```bash
cd server && npm install && npm test && npm run dev   # http://localhost:4000
```
Express `app.listen(PORT)` binds all interfaces, so a phone on the same Wi-Fi can reach it.

## Running React Native

```bash
cd mobile && npm install
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000 npx expo start
# `w` = web preview, QR = Expo Go on device. Backend must be reachable at the URL above.
```

## Phone testing (same Wi-Fi)

1. Find the Mac LAN IP (e.g. `ipconfig getifaddr en0` → `10.220.84.30`).
2. Start the backend: `cd server && npm run dev` (listens on `:4000`, reachable at `http://<lan-ip>:4000`).
3. Start Expo with the phone-reachable URL: `EXPO_PUBLIC_API_URL=http://<lan-ip>:4000 npx expo start --clear`.
4. Scan the QR in Expo Go. Never use `localhost` for a physical device; never hardcode the LAN IP
   into source — it stays in the `EXPO_PUBLIC_API_URL` env var only.
5. If LAN fails (AP isolation / firewall / different band), use tunnel mode instead:
   `npx expo start --tunnel` (slower, but bypasses local-network restrictions).

## Expo troubleshooting (honest notes)

- "Cannot connect to Expo CLI" on the phone is a Metro/tooling-reachability warning, not an app bug:
  verify the phone and Mac share the same Wi-Fi, the Mac firewall allows Node, and the QR encodes the
  current LAN IP (stale QRs from an old IP are the most common cause — restart with `--clear`).
- `Unable to run simctl … code 72` is an iOS-simulator-only message on Macs without full Xcode;
  it does not affect Android Expo Go.
- The floating gear/toast some builds show is the Expo development overlay, not app UI.

## Manual device testing checklist

Launch → competition loads → countdown ticks → dates render → tabs switch (About/Judging/Rules) →
judge intro plays → winner videos play → Register (DEMO) → spots decrement → duplicate rejected →
submission accepted → invalid rejected → Copy/Share/Refer Now → testimonials open/close →
Home/Explore/Competitions/Profile navigate → hardware back pops → language toggle responds.

## API Endpoints

| Method | Endpoint | Auth | Success | Errors |
|---|---|---|---|---|
| GET | `/api/health` | no | 200 `{ok,dbMode,env}` | — |
| GET | `/api/competitions` | no | 200 list with computed states | — |
| GET | `/api/competitions/:slug?userId=` | optional | 200 detail DTO (`state, spotsLeft, countdown, isRegistered, canRegister, canUploadSubmission, referralCode`) | 404 not found |
| POST | `/api/competitions/:slug/register {userId, idempotencyKey?, referralCode?}` | userId | 201 created · 200 idempotent replay | 400 bad key · 401 bad userId · 404 · 409 `FULL`/`CLOSED`/`DUPLICATE`/`NOT_OPEN` |
| POST | `/api/competitions/:slug/cancel {userId}` | userId | 200 (seat released) | 401 · 404 no active registration |
| POST | `/api/competitions/:slug/submit {userId, submissionUrl, fileType?, fileSizeBytes?}` | registered userId | 200 (URL recorded) | 400 `INVALID_URL/TYPE/SIZE` · 401 · 403 `NOT_REGISTERED` · 409 `WINDOW_CLOSED` |
| GET | `/api/competitions/:slug/referral?userId=` | userId | 200 `{code, signupCount, creditEarned}` | 401 |
| GET | `/api/competitions/mine?userId=` | userId | 200 my registrations with competition state | 401 |
| GET | `/api/competitions/:slug/testimonials` | no | 200 demo/sample reviews (`isDemo: true`) | 404 unknown slug |
| POST | `/api/payments/mock-checkout` | — | 200 DEMO intent `{demo:true}` | 400 · 501 if real keys present but unwired |

## Authentication

Demo device auth: the app persists a per-device `userId` (`mobile/src/api.js getUserId`); every
protected endpoint validates its shape (`^[A-Za-z0-9_-]{3,128}$`) and returns **401** otherwise.
No secrets exist anywhere. Production upgrade: JWT in `Authorization: Bearer <token>`, verified
server-side with `JWT_SECRET` (already reserved in `.env.example`), plus refresh rotation.

## Registration Business Rules

- Only in `registration_open`, with seats left, not already registered; deadline + capacity are enforced
  **inside the atomic seat-claim query itself** — application checks alone never decide.
- Duplicate registration → 409 `DUPLICATE`; full → 409 `FULL`; closed → 409 `CLOSED`/`NOT_OPEN`.
- `bookedSpots` moves only via atomic `$inc` (±1) and can never go negative or exceed capacity
  (query gate + schema guard). Cancel releases exactly one seat.
- Double-tap / network retries are safe via `idempotencyKey` (200 replay, no extra seat).

## Competition Lifecycle

Derived server-side in `getCompetitionState` from dates + capacity (+ `cancelled` override):

`registration_open → full | registration_closed → submission_open → submission_closed → result_declared`

The design's dates overlap (Submission Starts 6 Aug < Register Before 10 Aug), so registration takes
precedence while its window is open; upload eligibility is computed from the submission time-window
independently. All six states are seeded (`demo-state-*`) and unit-tested; the UI shows a countdown
during `registration_open` and a state banner otherwise.

## Concurrency Strategy

- One atomic `findOneAndUpdate({_id, bookedSpots: {$lt: capacity}, registerBefore: {$gt: now}})`
  claims the seat — MongoDB serialises parallel requests; losers get 409 without touching counts.
- Partial unique index `(competition, userId)` where `status='registered'` + seat rollback on `E11000`
  makes same-user races converge to exactly one record and +1 seat.
- Verified: capacity 3 × 10 parallel users → exactly 3 succeed / 3 records / bookedSpots 3;
  same user × 10 parallel → exactly 1 record / +1 seat (see Testing).

## Submission Flow

`NOT REGISTERED → (register + DEMO payment) → REGISTERED → (submission window opens) → SUBMITTED`.
Only registered users, only inside `[submissionStarts, submissionEnds)`; URL must be http(s) ending
`.mp4/.mov/.webm` (or matching `fileType` ∈ mp4/quicktime/webm), size 1 B–500 MB. Failures return typed
codes and the UI shows inline retryable errors; success records `submissionUrl + submittedAt` and the
CTA shows `Submitted ✓ <timestamp>`. **Demo limitation:** the backend validates and records the
submission URL/metadata — no binary upload or cloud storage is provisioned (production: signed
S3/GCS URLs + transcoding).

## Payment Flow

Reference mentions Razorpay. Backend owns all payment logic (`server/src/routes/payments.js`); the app
never sees keys/secrets and cannot self-claim success — registration persists `payment.provider/status`.
Without `RAZORPAY_KEY_ID/SECRET` the API returns a clearly-marked **DEMO/MOCK** intent (no money moves;
UI labels every price button `(DEMO)`). Production wiring (real Razorpay Orders + webhook signature
verification) belongs in that one router file — see its inline comments.

## Referral Flow

Codes are generated **by the backend** (`GET …/referral?userId=` → deterministic `PREFIX-USERID`,
persisted per user per competition). The app displays the code/link with copy + native share.
Business rule: `signupCount/creditEarned` increment **only when a different user completes registration
with that code** — fetching, copying, or clicking the link grants nothing; self-referral is rejected.
Abuse note: one credit per referred registration; rate limits apply.

## Testing

```bash
cd server && npm test        # 18 tests: health, detail, 404, 401, 6 lifecycle states,
                             # duplicate-409, oversell (3×10), same-user (1×10), closed/full codes,
                             # submission 403/400/200, referral credit rule, mock-payment flag,
                             # testimonials list/404/validation, competition media fields,
                             # participation (/mine + auth), seed distinctness + judging weights
cd mobile && npx expo-doctor                       # 21/21
cd mobile && npx expo export --platform web        # Metro web bundle must build cleanly
cd mobile && npx expo export --platform android    # Android bundle must build cleanly
```

## Assumptions

- Demo device-id auth stands in for JWT (all protected routes still enforce it; see Authentication).
- Flagship values (₹1500 pool, ₹99 fee, 20 seats, judge, rewards) mirror the design reference.
- Video playback, real payments, and binary uploads are demo-grade (see Known Limitations).
- Countdown ticks client-side from the server-provided deadline; pull-to-refresh re-syncs truth.

## Technical Decisions

- Mongoose + in-memory fallback so the project runs without local mongod, while production
  hard-requires `MONGODB_URI` (evaluator can use either; README states which is which).
- `helmet`, env-gated CORS, 256 kb JSON cap, write-route rate limits, strict `userId` validation,
  generic 500s — production-minded defaults from day one.
- Frontend holds zero business data; offline shows last sync explicitly labelled stale, or a retry
  screen when nothing was ever synced — an evaluator grep for prices/names finds nothing in `mobile/`.
- Countdown derives from the server deadline and triggers re-fetch at zero, so state never goes stale.

## Trade-offs

- Ephemeral memory DB per process in dev (simple, zero-setup) vs persistent Mongo (needs URI).
- Manual refresh over WebSockets for spot counts (simpler; fine at this scale — sockets later).
- URL-recorded submissions over signed S3 uploads (reviewable in minutes; cloud later).
- Overlap-tolerant lifecycle (registration precedence) over naive date ordering (matches the reference dates).

## Known Limitations

- Payments are DEMO/MOCK only — no real money, no Razorpay secrets anywhere near the app.
- Submissions record URL + metadata; no cloud storage, transcoding, or binary upload yet.
- Judge/winner/judge-portrait photos are category-relevant demo stand-ins (Wikimedia Commons);
  videos play public sample MP4s; testimonials are seeded samples (`isDemo`). None is real Feedants media.
- Auth is a demo device id, not JWT (protected routes still require a valid one; invalid → 401).
- Offline app shows last synced data marked stale, or a retry screen if never synced.
- `mobile/.expo`, `.DS_Store`, and `node_modules` are never committed (gitignored).

## Production Improvements

Atlas replica-set + transactions (register + Razorpay order atomically), Redis/BullMQ for receipts and
referral webhooks, S3/GCS signed uploads with transcoding pipeline, waitlist when full, JWT + refresh
rotation, i18n strings API, WebSocket/SSE live counters, Sentry + analytics, Detox/Maestro E2E, CI
pipeline, and the submission screen recording.
