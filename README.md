Absolutely. Here is a complete rewritten README, polished for an internship evaluator. It keeps your actual implementation details, clearly separates demo limitations from production architecture, and avoids overclaiming.

# Feedants Competition Module
A production-minded **Competition Details and Registration module** built for the Feedants Full-Stack Development Internship technical assignment.
The project implements the supplied Feedants competition design as a functional **React Native (Expo)** application backed by a **Node.js + Express.js REST API** and **MongoDB/Mongoose** data layer.
> **Important:** This is not a static UI implementation. Competition data, registration state, capacity, lifecycle, dates, rewards, judging information, and participation state are served and computed by the backend.
---
## ✨ Overview
The module provides a complete competition experience from discovery to participation and submission.
### Core capabilities
- Browse competitions across multiple categories
- View detailed competition information
- Display dynamically calculated competition states
- Track registration deadlines and submission windows
- Register for competitions
- Enforce limited competition capacity
- Prevent duplicate registrations
- Display remaining spots dynamically
- View judges and previous winners
- View rewards and judging parameters
- View competition rules and eligibility
- Submit work during the permitted submission window
- Track registration and submission status
- Generate and use referral codes
- Demonstrate the payment flow using a clearly labelled mock payment
- Handle network and API failures
- Display stale cached data explicitly when offline
The flagship competition is **Feedants Classical Dance**, implemented from the supplied design reference.
---
# 🎯 Assignment Requirements Covered
| Requirement | Implementation |
|---|---|
| React Native frontend | Expo + React Native |
| Node.js backend | Express.js |
| MongoDB database | MongoDB + Mongoose |
| Dynamic competition data | Backend API and database |
| Registration | Backend-controlled registration flow |
| Limited capacity | Atomic MongoDB seat allocation |
| Duplicate protection | Unique registration constraint |
| Competition lifecycle | Server-side lifecycle calculation |
| Submission | Registration + submission-window validation |
| Concurrency | Atomic seat allocation + race handling |
| API validation | Server-side validation and typed error responses |
| Production considerations | Rate limiting, Helmet, CORS, idempotency and scalable API architecture |
| Testing | 18 backend tests + Expo Doctor + Android/Web build verification |
---
# 🏗️ Architecture
```text
┌─────────────────────────────────┐
│        React Native / Expo      │
│                                 │
│ Home / Explore / Competitions   │
│ Competition Details / Profile   │
└────────────────┬────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────┐
│        Node.js + Express        │
│                                 │
│ Competition APIs                │
│ Registration                    │
│ Submission                     │
│ Payments                       │
│ Referrals                      │
│ Lifecycle                      │
│ Validation                     │
└────────────────┬────────────────┘
                 │
                 │ Mongoose
                 ▼
┌─────────────────────────────────┐
│             MongoDB             │
│                                 │
│ Competitions                   │
│ Registrations                  │
│ Referrals                      │
│ Testimonials                   │
└─────────────────────────────────┘

Responsibility split

The frontend is responsible for:

* Rendering UI
* Navigation
* User interactions
* Local device identity
* Displaying server responses
* Countdown presentation
* Stale-cache presentation

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
* Business rules

This keeps business-critical rules outside the client.

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

A local MongoDB installation is not required for development because the project provides an in-memory MongoDB fallback.

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
# Optional comma-separated origins
CORS_ORIGIN=
# Reserved for production JWT authentication
JWT_SECRET=
# Optional production Razorpay credentials
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

Development database behavior

When MONGODB_URI is empty:

Express Server
      ↓
mongodb-memory-server
      ↓
Seed competition data
      ↓
Start API

The in-memory database is intended for local development and testing.

Data is ephemeral and is reset when the backend process restarts.

For production deployments, MONGODB_URI is required.

⸻

📱 Running the Backend

From the project root:

cd server
npm run dev

The API runs on:

http://localhost:4000

The Express server listens on all interfaces, allowing a physical device on the same network to reach the API through the Mac’s LAN IP.

⸻

📱 Running the React Native Application

Physical device

Replace <LAN_IP> with the Mac’s local network IP.

cd mobile
EXPO_PUBLIC_API_URL=http://<LAN_IP>:4000 npx expo start --clear

Then scan the generated QR code using Expo Go.

Important

Do not use:

http://localhost:4000

from a physical phone.

On a phone, localhost refers to the phone itself.

Use:

http://<LAN_IP>:4000

instead.

⸻

Web preview

cd mobile
npx expo start --web

⸻

🌱 Seed Data

The backend automatically seeds development data on startup.

Flagship competition

Feedants Classical Dance

Prize Pool:        ₹1,500
Entry Fee:         ₹99
Capacity:          20
Initial Booked:    1
Initial Spots Left: 19

The implementation also includes additional competitions covering different lifecycle states:

* Urban Photography Challenge
* Indie Music Showcase
* Digital Art Sprint
* Creative Writing Challenge
* Monsoon Dance Fest

This provides multiple competition states for testing and demonstration.

Manual seeding

cd server
npm run seed

⸻

🔄 Competition Lifecycle

Competition state is calculated on the server using competition dates and capacity.

registration_open
        │
        ├── capacity reached
        │
        ▼
       full
registration_open
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

The frontend does not independently determine the competition’s business state.

The flagship design contains overlapping registration and submission dates. While registration remains within its allowed window, registration state takes precedence for the competition lifecycle while submission eligibility is evaluated independently.

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

Preventing overselling is handled as a backend concern.

A registration attempts to atomically claim a seat only when:

bookedSpots < capacity
AND
registerBefore > currentTime

The seat count is then incremented atomically.

This avoids a simple:

read → check → write

pattern where multiple concurrent requests could claim the same final seat.

Additional protection

The implementation also uses:

* Unique registration constraint
* Atomic $inc
* Duplicate-registration handling
* Seat rollback for duplicate-race cases
* Idempotency keys

Verified scenarios

Capacity race

Capacity: 3
Concurrent users: 10
Result:
3 successful registrations
3 registration records
bookedSpots = 3

Same-user race

10 concurrent requests
        ↓
1 registration
        ↓
1 seat consumed

These scenarios are covered by the backend test suite.

⸻

📤 Submission Flow

A submission is accepted only when:

1. The user is registered.
2. The competition is inside its submission window.
3. The submission URL is valid.
4. The file type is supported.
5. The file size is within the configured limit.

Supported formats

.mp4
.mov
.webm

Maximum configured size

500 MB

The backend records:

submissionUrl
fileType
fileSizeBytes
submittedAt

Current implementation limitation

The assignment implementation validates and records the submission URL and metadata.

It does not provision binary cloud storage.

A production implementation would use signed S3/GCS upload URLs followed by media processing and storage.

⸻

💳 Payment

The supplied reference mentions Razorpay.

For this assignment, payment is intentionally implemented as:

DEMO / MOCK payment

No real money is transferred.

The payment flow is backend-controlled, and payment secrets are never exposed to the React Native client.

Production payment flow

A production implementation would add:

* Razorpay Orders
* Server-side payment verification
* Webhook signature verification
* Payment reconciliation
* Failed-payment handling

⸻

🔗 Referral System

The application supports backend-generated referral codes.

Features include:

* Referral code generation
* Copy
* Native share
* Signup count
* Earned credit

Referral credit is granted only when a different user completes registration using the referral code.

Viewing, copying or sharing a referral code does not itself generate credit.

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

🧪 Testing & Verification

Backend

cd server
npm test

Current result:

18 / 18 tests passing

The suite covers:

* Health endpoint
* Competition details
* 404 handling
* Authentication validation
* Competition lifecycle states
* Duplicate registration
* Capacity enforcement
* Concurrent registration
* Same-user race conditions
* Full/closed competitions
* Submission validation
* Submission authorization
* Referral rules
* Mock payment
* Testimonials
* Competition media
* Participation endpoint
* Seed data validation

⸻

Expo Doctor

cd mobile
npx expo-doctor

Current result:

21 / 21 checks passing

⸻

Web build

cd mobile
npx expo export --platform web

⸻

Android build

cd mobile
npx expo export --platform android

Both platform exports have been verified successfully.

⸻

🧠 Technical Decisions

Backend-owned business logic

Business-critical decisions remain on the server.

The client cannot independently decide:

* Whether registration is open
* Whether seats remain
* Whether the user is registered
* Whether submission is allowed
* Whether payment succeeded

⸻

Atomic registration

Seat allocation uses an atomic database operation instead of a separate read/check/write sequence.

This is important for concurrent registrations.

⸻

Idempotency

Registration supports idempotency keys so repeated requests caused by double taps or network retries do not consume multiple seats.

⸻

Server-derived lifecycle

Competition lifecycle is calculated from server-side dates and capacity rather than being hardcoded in the frontend.

⸻

Stale-cache labeling

The mobile application can retain the most recent successful API response.

When displayed offline, cached information is explicitly labelled as stale rather than being presented as current server data.

⸻

⚖️ Trade-offs

In-memory development database

Advantage

* Zero MongoDB setup for evaluation
* Fast development and testing

Trade-off

* Data is ephemeral
* Restarting the development server resets the database

Production deployments use persistent MongoDB.

⸻

Manual refresh

The application re-fetches server state instead of maintaining WebSocket connections.

Advantage

* Simpler implementation
* Fewer infrastructure requirements

Future improvement

* WebSocket/SSE updates for live competition counters

⸻

URL-based submissions

Advantage

* Simple and reliable for demonstrating the complete submission flow

Trade-off

* Production requires cloud storage and media processing

⸻

Demo authentication

A device-generated user ID is used instead of a full account system.

Future improvement

* JWT authentication
* Refresh-token rotation
* Account management

⸻

⚠️ Known Limitations

The following components are intentionally demo-grade:

* Payments are DEMO/MOCK only.
* Submission storage records URLs and metadata rather than binary files.
* Authentication uses a demo device ID rather than JWT.
* Competition photos and videos are demo stand-ins.
* Testimonials are seeded demo/sample content.
* Development mode can use an in-memory MongoDB instance.
* Live spot updates currently rely on API refresh rather than WebSockets.

These limitations are isolated so that production services can replace them without requiring a fundamental frontend redesign.

⸻

🚀 Production Roadmap

A production deployment could add:

* MongoDB Atlas replica sets
* Database transactions for critical multi-step workflows
* JWT authentication and refresh-token rotation
* Razorpay order and webhook verification
* S3/GCS signed uploads
* Video transcoding and moderation
* Redis/BullMQ background processing
* WebSocket/SSE live competition counters
* Waitlists for full competitions
* Sentry monitoring
* Analytics
* CI/CD pipeline
* Detox/Maestro end-to-end testing
* Production account management

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

The recording demonstrates the complete user journey and verifies that the module is a functional application rather than a static UI.

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

* Demo device authentication represents an authenticated user for this assignment.
* Competition values reproduce the supplied Feedants design reference.
* Demo media represents the type of production media that would be supplied by Feedants.
* Payment is intentionally mocked because production payment credentials are not available.
* Submission URLs represent the result of an upload; binary cloud storage is a production extension.
* Server time is the source of truth for competition lifecycle decisions.

⸻

📦 Submission

Source Code

GitHub Repository

⁠github.com/bhoomikabhatt05/feedants-competition-module

Demo

The submitted screen recording demonstrates:

Competition Details → Registration → DEMO Payment → Registered State → Submission → Participation State

⸻

👩‍💻 Project

Feedants Competition Module

Built as a Full-Stack Development Internship technical assignment.

Frontend: React Native / Expo
Backend: Node.js / Express.js
Database: MongoDB / Mongoose

### One important note
I intentionally **didn't claim that a persistent MongoDB instance is currently being used in your local demo**. Your actual setup uses `mongodb-memory-server` when `MONGODB_URI` is empty, and this README states that clearly. That's the safest and most accurate way to present it to the evaluator.
