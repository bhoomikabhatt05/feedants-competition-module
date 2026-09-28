# Feedants Competition Module

A production-minded **Competition Details and Registration module** built for the Feedants Full-Stack Development Internship technical assignment.

The project implements the supplied Feedants competition design as a functional **React Native (Expo)** application backed by a **Node.js + Express.js REST API** and **MongoDB/Mongoose** data layer.

> **Important:** This is not a static UI implementation. Competition data, registration state, capacity, lifecycle, dates, rewards, judging information, and participation state are served and computed by the backend.

---

## ✨ Overview

The module provides a complete competition experience from discovery to participation and submission.

### Core Capabilities

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
| Testing | 18 backend tests + Expo Doctor + Android/Web export verification |

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
│ Submission                      │
│ Payments                        │
│ Referrals                       │
│ Lifecycle                       │
│ Validation                      │
└────────────────┬────────────────┘
                 │
                 │ Mongoose
                 ▼
┌─────────────────────────────────┐
│             MongoDB             │
│                                 │
│ Competitions                    │
│ Registrations                   │
│ Referrals                       │
│ Testimonials                    │
└─────────────────────────────────┘
