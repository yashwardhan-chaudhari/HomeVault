# HomeVault — Smart Household Inventory & Asset Organizer

<p align="center">
  <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80" alt="HomeVault Banner" width="100%" style="border-radius: 16px; max-height: 360px; object-fit: cover;" />
</p>

<p align="center">
  <strong>A smart household inventory manager to organize items by location, track warranties, visualize asset value, and manage inventory with interactive maps and physical storage QR codes.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Node.js-v20%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Tests-50%20passing-brightgreen?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Security Architecture](#-security-architecture)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [REST API Reference](#-rest-api-reference)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#-environment-configuration)
- [Running Automated Tests](#-running-automated-tests)
- [Known Limitations & Future Improvements](#-known-limitations--future-improvements)
- [Contributing & Open Source](#-contributing--open-source)
- [License](#-license)

---

## 🌟 Overview

**HomeVault** is a full-stack household inventory manager built with React 19 and Node.js/Express. It helps individuals and families keep track of their belongings across structured indoor storage hierarchies (**House → Floor → Room → Cupboard → Shelf → Drawer → Container → Exact Position**), monitor warranty lifecycles, and generate printable QR code tags for storage bins and boxes.

The project demonstrates production-grade full-stack engineering practices:
- **Tenant Data Isolation**: Strict user-level authorization so private item details cannot be accessed across accounts.
- **Defensive Security**: Rate-limited authentication, cryptographic password reset tokens, security headers, and safe atomic file persistence.
- **Comprehensive Automated Testing**: 50 automated unit, API, and end-to-end tests with 100% pass rate.

---

## ✨ Key Features

### 🗄️ Structured Indoor Location Hierarchy
- **8-Level Storage Hierarchy**: Record items down to their exact physical position (`house → floor → room → cupboard → shelf → drawer → container → exactPosition`).
- **Duplicate Detection**: Flags potential duplicate items with friendly warnings when an item with a similar name already exists in the same room.
- **Physical QR Storage Labels**: Generate and print physical QR code tags for boxes, bins, and cupboards to quickly view contents.

### 📍 Spatial Mapping & Leaflet Integration
- **Interactive OpenStreetMap Canvas**: Visual map pins displaying where items and storage units are situated.
- **Geocoding & Reverse Geocoding**: Search for addresses or click on the map to record GPS coordinates.
- **Navigation Shortcuts**: Direct links to open coordinates in external navigation apps.

### 🛡️ Warranty Lifecycle Tracking & Alerts
- **Categorized Expirations**: Automated classification into **Active**, **Expiring (within 30 days)**, and **Expired**.
- **Dashboard Overview**: Immediate metrics highlighting items needing attention before warranty expiration.
- **Warranty Filters**: Filter your inventory list by warranty status with one click.

### 📊 Asset Value Analytics
- **Monetary Aggregation**: Total portfolio valuation computed from recorded prices and quantities.
- **Category & Room Breakdown**: Financial distribution charts across categories (Electronics, Furniture, Appliances, etc.).
- **Missing Value Handling**: Gracefully handles items without purchase prices instead of skewing metrics.

### ⚡ JavaScript Masterclass Lab
- Built-in educational playground illustrating core JavaScript runtime mechanics:
  - Event Loop (Microtask vs Macrotask queue)
  - Closures & Scope chains
  - Async/Await execution pipelines
  - Variable Hoisting & Temporal Dead Zone (TDZ)

---

## 🔐 Security Architecture

1. **Strict JWT Authentication**:
   - `JWT_SECRET` is strictly required at server startup (throws error if missing; no hardcoded fallbacks).
   - Protected routes immediately reject requests without valid Bearer tokens with `401 Unauthorized`.
   - Never falls back to unauthenticated demo accounts.

2. **Per-User Authorization & Data Isolation**:
   - Every database operation is scoped strictly to the authenticated `userId`.
   - Users cannot view, edit, or delete items belonging to another user, returning `404 Not Found`.

3. **Rate Limiting & Password Hashing**:
   - In-memory rate limiting throttles failed login attempts (maximum 5 attempts per 15-minute window per IP/email).
   - Passwords are salt-hashed using `bcryptjs` with 10 rounds; plaintext passwords and hashes are never returned in responses.

4. **Cryptographic Password Reset**:
   - Generates 32-byte cryptographically secure random tokens.
   - Tokens are SHA-256 hashed and stored with 15-minute expiration.
   - Tokens are single-use and invalidated immediately upon password update.

5. **Server Input & Upload Validation**:
   - Strict server-side type and boundary validation on all fields (name length, category length, non-negative price, integer quantity >= 1).
   - Base64 image uploads validated for safe image MIME types (JPEG, PNG, WebP, GIF) and 5MB size limit.
   - Attached documents sanitized against directory traversal attacks (`../`).

6. **Defensive Headers & Restricted CORS**:
   - Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy`.
   - `x-powered-by` disabled.
   - Restricts CORS to allowed origins (`APP_URL`, `http://localhost:3000`).

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Vite, TailwindCSS v4, Lucide Icons, Recharts, Leaflet) │
└───────────────────────────┬────────────────────────────┘
                            │  HTTP / REST (JWT Bearer)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js API Server                 │
│  ├── Security Headers & Restricted CORS Middleware     │
│  ├── Authentication Middleware (JWT verification)      │
│  ├── In-Memory Rate Limiting                           │
│  └── Input & Media Validators (validators.js)          │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               Data Persistence Layer                   │
│  ├── Multi-Tenant Scoped Queries (src/server/db.js)    │
│  ├── Safe Atomic JSON Persistence (.tmp + rename)      │
│  └── SHA-256 Reset Tokens & Bcrypt Password Hashing    │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, TailwindCSS v4, Lucide React, Leaflet & React-Leaflet, Recharts |
| **Backend** | Node.js (v20+), Express 4.21, `jsonwebtoken`, `bcryptjs`, native crypto |
| **Testing** | Node.js Native Test Runner (`node --test`), `node:assert/strict` |
| **Build & Tooling** | Vite, `tsx`, `esbuild`, TypeScript types |

---

## 📁 Repository Structure

```text
HomeVault/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI workflow
├── data/
│   └── homevault_db.json          # Persisted JSON data store
├── docs/
│   ├── HLD.md                     # High-Level Architecture Design
│   ├── LLD.md                     # Low-Level Component Design
│   └── PRD.md                     # Product Requirements Document
├── src/
│   ├── components/                # Modular UI components (Auth, Items, Map, QR)
│   ├── context/                   # React Authentication Context
│   ├── pages/                     # Application pages (Dashboard, Inventory, Map, Lab)
│   ├── server/
│   │   ├── db.js                  # Multi-tenant DB operations & atomic file storage
│   │   └── validators.js          # Pure validation & metric calculation logic
│   └── services/
│       └── api.js                 # API client wrapper
├── tests/
│   ├── unit/                      # Validation and calculation unit tests
│   ├── api/                       # Auth and item CRUD integration tests
│   └── e2e/                       # End-to-end full user workflow tests
├── server.js                      # Express server entry point & route definitions
├── package.json                   # Dependencies, scripts, and configuration
├── .env.example                   # Environment variable template
├── CONTRIBUTING.md                # Contribution guidelines
├── SECURITY.md                    # Vulnerability reporting policy
└── README.md
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v20.0.0 or higher recommended)
- **npm** (v9 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/yashwardhan-chaudhari/HomeVault.git
cd HomeVault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Generate a secure 64-character hex secret for `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste this value into your `.env` file:
```env
PORT=3000
JWT_SECRET=your_generated_cryptographic_secret_here
NODE_ENV=development
```

### 4. Start the development server
```bash
npm run dev
```

Open your browser at:
```text
http://localhost:3000
```

### Demo Accounts for Evaluation
Pre-seeded demo accounts are available for instant testing:
- **Alex Vance**: `alex@homevault.io` / `password123` (8 items pre-loaded across study, bedroom, kitchen)
- **Demo Member**: `demo@homevault.app` / `password123` (2 items pre-loaded in living room)

---

## 🧪 Running Automated Tests

HomeVault includes a comprehensive automated test suite built with Node's native test runner (`node --test`), requiring no external test daemon:

```bash
npm test
```

### Test Suite Breakdown (50 Tests, 100% Pass Rate):
1. **Unit Tests (`tests/unit/validators.test.js`)**:
   - Registration validation (email syntax, password length, alphanumeric requirements).
   - Item input validation (price ranges, quantity bounds, date parsing, valid conditions).
   - Filename sanitization against path traversal (`../../../etc/passwd`).
   - Warranty status calculations (`active`, `expiring`, `expired`).
   - Location hierarchy breadcrumb formatting.
   - Financial asset aggregation metrics.
2. **API Tests (`tests/api/auth.test.js`)**:
   - User registration and JWT issuance.
   - Duplicate email registration rejection (`400 Bad Request`).
   - Weak password rejection.
   - Valid credential login vs incorrect password rejection (`401 Unauthorized`).
   - Missing and corrupted token rejection (`401 Unauthorized`).
   - Profile retrieval (`/api/auth/me`).
   - Complete password reset flow: token generation, password update, token reuse prevention.
3. **Item & Authorization Isolation Tests (`tests/api/items.test.js`)**:
   - Unauthenticated access rejection (`401 Unauthorized`).
   - Item creation with location hierarchy.
   - Duplicate item detection warnings.
   - Tenant data isolation (User B receives 0 items when User A owns items).
   - Cross-tenant access protection (User B receives `404 Not Found` when trying to view, edit, or delete User A's item).
   - Partial item updates and soft deletion.
4. **E2E Workflow (`tests/e2e/workflow.test.js`)**:
   - Complete 9-step user journey: registration → item creation → retrieval → location update → search → filtering → dashboard KPI verification → deletion.

---

## ⚠️ Known Limitations & Future Improvements

- **Persistence Layer**: The current version uses local JSON persistence with atomic file writes. While ideal for single-node setups and portfolio evaluation, a future multi-server deployment would benefit from PostgreSQL or SQLite.
- **Family Sharing**: Currently, inventory items are strictly isolated per user account. Household sharing with role-based access control (Admin vs Viewer) is planned for a future update.
- **Barcode Lookup**: Physical QR codes are supported; barcode UPC/EAN database scanning for packaged groceries and electronics will be added next.

---

## 🤝 Contributing & Open Source

Contributions are welcome! Please review:
- [CONTRIBUTING.md](CONTRIBUTING.md) for code style and pull request guidelines.
- [SECURITY.md](SECURITY.md) for vulnerability reporting.
- [LICENSE](LICENSE) for MIT terms.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
