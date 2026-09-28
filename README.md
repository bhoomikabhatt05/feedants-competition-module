Feedants Competition Module

A production-minded Competition Details and Registration module built for the Feedants Full-Stack Development Internship assignment.

The project implements the supplied Feedants competition design as a functional React Native application backed by a Node.js + Express API and MongoDB/Mongoose data layer.

Important: This is not a static UI implementation. Competition data, registration state, capacity, lifecycle, dates, rewards, judging information, and participation state are served and computed by the backend.

⸻

✨ Overview

The module provides a complete competition experience:

* Browse competitions
* View detailed competition information
* Track registration deadlines and lifecycle states
* Register for competitions with capacity enforcement
* Handle duplicate registrations safely
* Display remaining spots dynamically
* View judges, winners, rewards and competition rules
* Submit work during the permitted submission window
* Track registration/submission status
* Refer and earn through backend-generated referral codes
* Handle demo payments
* Support multiple competition lifecycle states
* Recover gracefully from network/API failures
* Display stale cached data explicitly when offline

The flagship competition is Feedants Classical Dance, based on the provided design reference.

⸻

🎯 Assignment Requirements Covered

Requirement	Implementation
React Native frontend	Expo + React Native
Node.js backend	Express.js
MongoDB database	Mongoose
Dynamic competition data	Backend API + database
Registration	Backend-controlled registration flow
Limited capacity	Atomic MongoDB seat claim
Duplicate protection	Unique registration constraint
Competition lifecycle	Server-side lifecycle calculation
Submission	Registration + date-window validation
Concurrency	Atomic seat allocation + race handling
API validation	Typed validation/error responses
Production considerations	Rate limiting, Helmet, CORS, idempotency, scalable architecture
Testing	18 backend tests + Expo Doctor + Android/Web builds

⸻

🏗️ Architecture

┌───────────────────────────────┐
│       React Native / Expo     │
│                               │
│ Home / Explore / Competitions │
│ Competition Details / Profile │
└───────────────┬───────────────┘
                │ REST API
                ▼
┌───────────────────────────────┐
│       Node.js + Express       │
│                               │
│ Competition APIs              │
│ Registration                  │
│ Submission                   │
│ Payments                     │
│ Referrals                    │
│ Lifecycle                    │
│ Validation                    │
└───────────────┬───────────────┘
                │ Mongoose
                ▼
┌───────────────────────────────┐
│          MongoDB              │
│                               │
│ Competitions                 │
│ Registrations                │
│ Referrals                    │
│ Testimonials                 │
└───────────────────────────────┘

The frontend does not own competition business rules.

The backend is responsible for:

* Competition state
* Capacity
* Registration eligibility
* Duplicate protection
* Submission eligibility
* Referral rules
* Payment state
* Server-side dates
* Validation

⸻

🛠️ Tech Stack

Frontend

* React Native
* Expo ~57
* AsyncStorage
* Expo Clipboard
* Expo Video

Backend

* Node.js ≥ 18
* Express.js
* Mongoose 8
* Helmet
* CORS
* express-rate-limit
* dotenv

Database

* MongoDB
* MongoDB Atlas compatible
* mongodb-memory-server development/test fallback

Testing

* Node.js node:test
* Supertest
* Expo Doctor
* Expo Web export
* Expo Android export

⸻

📁 Project Structure

feedants-competition-module/
│
├── mobile/
│   ├── App.js
│   ├── src/
│   │   ├── api.js
│   │   ├── hooks.js
│   │   ├── i18n.js
│   │   ├── screens.js
│   │   └── components/
│   │       └── cards.js
│   └── assets/
│
├── server/
│   ├── src/
│   │   ├── index.js
│   │   ├── app.js
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── seed.js
│   │   └── seedData.js
│   │
│   └── test/
│       └── api.test.js
│
└── README.md

⸻

🚀 Getting Started

Prerequisites

Install:

* Node.js 18+
* npm
* Expo Go for physical-device testing

A local MongoDB installation is not required for development.

⸻

1. Clone the repository

git clone https://github.com/bhoomikabhatt05/feedants-competition-module.git
cd feedants-competition-module

⸻

2. Install backend dependencies

cd server
npm install

⸻

3. Install mobile dependencies

cd ../mobile
npm install

⸻

🔐 Environment Configuration

Backend

Create:

server/.env

Example:

PORT=4000
# Leave empty for the development in-memory fallback
MONGODB_URI=
# Optional
CORS_ORIGIN=
# Reserved for production authentication
JWT_SECRET=
# Optional Razorpay production credentials
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

Development database behavior

If MONGODB_URI is empty:

MongoDB in-memory development fallback
        ↓
Seed competitions
        ↓
Start Express server

Data is ephemeral and is reset when the backend process restarts.

For production, MONGODB_URI is required.

⸻

📱 Running the Backend

From the project root:

cd server
npm run dev

The API runs on:

http://localhost:4000

The server listens on all interfaces so a physical device can access it through the Mac’s LAN IP.

⸻

📱 Running the React Native App

For a physical device, replace <LAN_IP> with the Mac’s local IP address.

cd mobile
EXPO_PUBLIC_API_URL=http://<LAN_IP>:4000 npx expo start --clear

Then scan the QR code using Expo Go.

Web preview

npx expo start --web

Important

Do not use:

http://localhost:4000

from a physical phone.

Use:

http://<LAN_IP>:4000

because localhost on the phone refers to the phone itself.

⸻

🌱 Seed Data

The backend automatically seeds the development database on startup.

The flagship competition is:

Feedants Classical Dance

Prize Pool: ₹1,500
Entry Fee: ₹99
Capacity: 20
Initial Booked Spots: 1
Initial Spots Left: 19

Additional demo competitions cover different lifecycle states:

* Urban Photography Challenge
* Indie Music Showcase
* Digital Art Sprint
* Creative Writing Challenge
* Monsoon Dance Fest

This allows the application to demonstrate different competition states rather than relying on a single static competition.

Manual seeding:

cd server
npm run seed

⸻

🔄 Competition Lifecycle

Competition state is calculated on the server, based on dates and capacity.

registration_open
        │
        ├── capacity reached → full
        │
        ▼
registration_closed
        │
        ▼
submission_open
        │
        ▼
submission_closed
        │
        ▼
result_declared

The server determines the current state instead of relying on frontend hardcoded values.

The flagship design contains overlapping registration and submission dates. Registration therefore retains precedence while its registration window remains open.

⸻

📝 Registration Flow

NOT REGISTERED
       │
       ▼
Register
       │
       ▼
DEMO / MOCK Payment
       │
       ▼
REGISTERED
       │
       ▼
Submission Window
       │
       ▼
SUBMITTED

Registration validates:

* Competition existence
* Registration window
* Available capacity
* User ID
* Duplicate registration
* Idempotency key
* Payment state

⸻

🔒 Concurrency & Capacity

A major requirement of the assignment is avoiding overselling when multiple users register concurrently.

The seat is claimed atomically using a MongoDB query equivalent to:

bookedSpots < capacity
AND
registerBefore > currentTime

followed by an atomic increment.

This means two requests cannot independently read the same available seat and both claim it.

Additional protection includes:

* Partial unique registration constraint
* Duplicate registration handling
* Atomic $inc
* Seat rollback for duplicate-race cases
* Idempotency keys

Verified concurrency scenarios

Capacity: 3
Concurrent users: 10
Expected:
3 successful registrations
3 registration records
bookedSpots = 3

Same-user concurrent registration:

10 requests
        ↓
1 registration
        ↓
1 seat consumed

⸻

📤 Submission Flow

A submission is accepted only when:

1. The user is registered.
2. The competition is inside its submission window.
3. The submission URL is valid.
4. The file type is supported.
5. The file size is within the configured limits.

Supported formats:

.mp4
.mov
.webm

Maximum configured size:

500 MB

The backend records:

submissionUrl
fileType
fileSizeBytes
submittedAt

Current limitation

The assignment implementation records and validates a submission URL and metadata.

It does not provision binary cloud storage.

A production implementation would use signed upload URLs with S3/GCS and a media-processing pipeline.

⸻

💳 Payment

The reference design mentions Razorpay.

For this assignment, payments are intentionally implemented as:

DEMO / MOCK payments

No real money is transferred.

The backend owns the payment flow, and payment secrets are never exposed to React Native.

Production integration would include:

* Razorpay Orders
* Server-side verification
* Webhook signature validation
* Payment reconciliation

⸻

🔗 Referral System

Each user can receive a backend-generated referral code.

The referral flow supports:

* Code generation
* Copy
* Native sharing
* Signup count
* Earned credit

Referral credit is granted only when a different user completes registration.

Copying or viewing a referral code does not generate rewards.

Self-referrals are rejected.

⸻

🔌 API

Method	Endpoint	Purpose
GET	/api/health	Server health
GET	/api/competitions	Competition catalogue
GET	/api/competitions/:slug	Competition details
POST	/api/competitions/:slug/register	Register
POST	/api/competitions/:slug/cancel	Cancel registration
POST	/api/competitions/:slug/submit	Submit work
GET	/api/competitions/mine	User participation
GET	/api/competitions/:slug/referral	Referral information
GET	/api/competitions/:slug/testimonials	Testimonials
POST	/api/payments/mock-checkout	Demo payment

⸻

🧪 Testing

Backend:

cd server
npm test

Current suite:

18 / 18 tests passing

Coverage includes:

* Health endpoint
* Competition details
* 404 handling
* Authentication validation
* All lifecycle states
* Duplicate registration
* Capacity enforcement
* Concurrent registration
* Same-user race conditions
* Closed/full competition handling
* Submission validation
* Submission authorization
* Referral rules
* Demo payment
* Testimonials
* Competition media
* Participation endpoint
* Seed data validation

⸻

Expo validation

cd mobile
npx expo-doctor

Current result:

21 / 21 checks passing

Web build

npx expo export --platform web

Android build/export

npx expo export --platform android

Both have been verified successfully.

⸻

🧠 Technical Decisions

Backend-owned business logic

Competition rules are kept on the server so the client cannot independently decide:

* Whether registration is open
* Whether seats remain
* Whether a user is registered
* Whether submission is allowed
* Whether payment succeeded

Atomic registration

MongoDB atomic operations are used for seat allocation rather than:

read → check → write

This prevents race-condition overselling.

Idempotency

Registration supports idempotency keys so network retries and double taps do not consume multiple seats.

Server-derived lifecycle

Competition state is derived from server dates rather than hardcoded frontend state.

Stale-cache labeling

The mobile app can retain the last successful API response, but stale information is explicitly identified instead of being presented as live server truth.

⸻

⚖️ Trade-offs

In-memory development database

Advantage: zero MongoDB setup for evaluation.

Trade-off: data disappears when the backend process restarts.

Production uses persistent MongoDB.

Manual refresh

The app re-fetches server state rather than maintaining WebSocket connections.

Advantage: simpler architecture and fewer moving parts.

Future: WebSocket/SSE updates for live competition counters.

URL-based submissions

Advantage: fast and reliable for demonstrating the assignment flow.

Trade-off: production requires actual cloud file storage and processing.

Demo authentication

A device-generated user ID is used instead of a complete account/authentication system.

Future: JWT access tokens, refresh-token rotation and account management.

⸻

⚠️ Known Limitations

This assignment implementation intentionally contains several demo-grade components:

* Payments are DEMO/MOCK only.
* Submission storage records URLs and metadata rather than binary files.
* Authentication uses a demo device ID rather than JWT.
* Competition photos/videos are demo stand-ins.
* Testimonials are seeded demo/sample content.
* Development mode can use an in-memory MongoDB instance.
* Live spot updates currently rely on API refresh rather than WebSockets.

These limitations are isolated so they can be replaced by production services without changing the overall frontend architecture.

⸻

🚀 Production Roadmap

A production deployment could add:

* MongoDB Atlas replica sets
* Transactions for payment + registration workflows
* JWT authentication and refresh-token rotation
* Razorpay order/webhook verification
* S3/GCS signed uploads
* Video transcoding and moderation
* Redis/BullMQ background processing
* WebSocket/SSE live competition counters
* Waitlists for full competitions
* Sentry monitoring
* Analytics
* CI/CD pipeline
* Detox/Maestro end-to-end testing
* Production-grade account management

⸻

🎥 Demo Flow

The recommended demonstration flow is:

Home
  ↓
Feedants Classical Dance
  ↓
Competition Details
  ↓
Registration information
  ↓
Register
  ↓
DEMO / MOCK Payment
  ↓
Registration confirmed
  ↓
Registered state
  ↓
Upload Submission
  ↓
Submission status
  ↓
Competitions / participation state

The recording demonstrates that the module is a functional user flow rather than a static UI implementation.

⸻

🔐 Security Notes

* No API secrets are stored in the React Native application.
* Razorpay secrets remain backend-only.
* Protected endpoints validate user IDs.
* Helmet is enabled.
* CORS is configurable.
* Request rate limiting is enabled.
* JSON request size is restricted.
* Generic server errors avoid exposing internal details.
* Production mode requires a persistent MongoDB URI.

⸻

📌 Assumptions

* Demo device authentication represents a real authenticated user for this assignment.
* Competition values reproduce the supplied Feedants reference design.
* Demo media represents the type of production media that would be provided by Feedants.
* Payment is intentionally mocked because production Razorpay credentials are not available.
* Submission URLs represent the upload result; binary cloud storage is a production extension.
* Server time is the source of truth for competition lifecycle decisions.

⸻

👩‍💻 Project

Feedants Competition Module

Built as a Full-Stack Development Internship technical assignment.

Frontend: React Native / Expo
Backend: Node.js / Express
Database: MongoDB / Mongoose

GitHub:

https://github.com/bhoomikabhatt05/feedants-competition-module
