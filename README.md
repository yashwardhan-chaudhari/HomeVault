# HomeVault — Smart Home Inventory Vault & Spatial Asset Tracker

<p align="center">
  <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80" alt="HomeVault Banner" width="100%" style="border-radius: 16px; max-height: 360px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Never forget where you kept anything. Locate items in exact rooms, cupboards, and drawers with spatial mapping, warranty alerts, asset analytics, and interactive JavaScript core lab.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Layout](#-project-directory-layout)
- [REST API Reference](#-rest-api-reference)
- [NoSQL Aggregation Engine](#-nosql-aggregation-engine)
- [JavaScript Masterclass Lab](#-javascript-masterclass-lab)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#-environment-configuration)
- [Scripts & Commands](#-scripts--commands)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Contributing & Git Workflow](#-contributing--git-workflow)
- [License](#-license)

---

## 🌟 Overview

**HomeVault** is an enterprise-grade Smart Home Inventory Vault built for homeowners, collectors, and developers who need precise physical organization. Instead of generic storage tags, HomeVault captures a multi-tiered spatial hierarchy for every belonging (**House → Room → Drawer/Cupboard → Container → Exact Position**) paired with GPS coordinates and Leaflet interactive map pins.

In addition to item cataloging, HomeVault features financial asset analytics, automated warranty expiration reminders, a real-time audit trail, and an interactive **JavaScript Masterclass Lab** designed to demonstrate core web engineering concepts (closures, event loop, hoisting, async/await, and promises).

---

## ✨ Key Features

### 🗄️ Smart Inventory Management & Hierarchy
- **5-Tier Location Tree**: Define exact storage locations down to the shelf, drawer, or organizer box.
- **Rich Media & Metadata**: Attach photos, serial numbers, purchase dates, conditions (New, Good, Fair, Poor), and custom tags.
- **Learned Autocomplete**: Autocomplete dropdowns for categories, rooms, drawers, and brands that dynamically learn from your catalog.
- **Soft Deletion & Recovery Protection**: Prevents accidental data loss with confirmation safeguards.

### 📍 Spatial Mapping & Leaflet Integration
- **Interactive OpenStreetMap / Leaflet Canvas**: Visual map pins showing where items and storage units are located.
- **Geocoding & Reverse Geocoding**: Search for physical addresses or click directly on the map to capture coordinates.
- **Google Maps Navigation**: One-click navigation link opens directions to your item’s exact coordinates.

### 📊 Vault Analytics & Financial Insights
- **Total Asset Value Computation**: Live calculation of total replacement costs based on quantity and purchase value.
- **Category & Room Breakdown**: Interactive progress bars and distribution charts visualizing value concentration.
- **Warranty Alert Monitoring**: Automatic tracking of items with warranties expiring within 60 days.

### ⚡ NoSQL Multi-Stage Aggregation Pipeline
- **MongoDB-Style Aggregation Engine**: Native JavaScript implementation supporting `$match`, `$group`, `$sort`, `$project`, `$unwind`, `$limit`, and `$skip`.
- **Dynamic Live Queries**: Filter, group, and aggregate stored items with complex multi-stage NoSQL operations.

### 📜 Real-time Audit Trail & Notifications
- **Activity Logs Stream**: Immutable record of every creation, edit, location move, and deletion.
- **Notification Center**: Real-time alerts for system events and urgent warranty deadlines with "Mark All as Read".

### 🔬 JavaScript Masterclass Lab
Interactive visualizers and live code execution sandboxes demonstrating critical JavaScript runtime mechanics:
- **`async / await`**: Non-blocking asynchronous flows and concurrency combinators.
- **`Closures & Scope`**: Lexical environment retention, data encapsulation, and memoization.
- **`Event Loop`**: Call Stack, Web APIs, Microtask vs Macrotask queue visualizer.
- **`Hoisting & TDZ`**: Creation phase vs execution phase, `var` vs `let`/`const`, and Temporal Dead Zone.
- **`Promises vs Callbacks`**: Inversion of control, error bubbling, and `Promise.allSettled` / `Promise.race`.

### 🔐 Security & Settings
- **JWT Authentication & Bcrypt Hashing**: Secure user authentication with 7-day token persistence.
- **Theme Switcher**: Dark Mode and Light Mode support with smooth CSS transitions.
- **Data Portability**: One-click JSON backup export containing your complete vault inventory, coordinates, and activity logs.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User Browser]) <--> ReactApp[React 19 SPA + Vite + TailwindCSS]
    ReactApp <--> ApiClient[src/services/api.js]
    ApiClient <--> ExpressServer[Express 4.21 Backend / API Router]
    
    subgraph Backend Core
        ExpressServer <--> AuthMiddleware[JWT Auth Middleware]
        ExpressServer <--> DBManager[JSONDatabaseManager (db.js)]
        ExpressServer <--> AggEngine[NoSQL Aggregation Engine]
        DBManager <--> DiskFile[(data/homevault_db.json)]
    end

    subgraph Frontend Modules
        ReactApp --> Dashboard[Dashboard & Quick Stats]
        ReactApp --> ItemVault[Item Vault & Filters]
        ReactApp --> LeafletMap[Spatial Leaflet Map]
        ReactApp --> Analytics[Asset Value Analytics]
        ReactApp --> JSLab[JavaScript Masterclass Lab]
        ReactApp --> AuditLogs[Activity Audit Trail]
        ReactApp --> Settings[Settings & JSON Backup]
    end
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/) |
| **Styling & UI** | [TailwindCSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **Maps & Geospatial** | [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/), OpenStreetMap Nominatim |
| **Backend & Routing** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/) |
| **Authentication** | [JSON Web Tokens (jsonwebtoken)](https://jwt.io/), [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Database & Persistence** | In-Memory JSON Database Engine with disk persistence (`data/homevault_db.json`) |
| **Build & Bundler** | [Vite](https://vitejs.dev/), [esbuild](https://esbuild.github.io/), [tsx](https://github.com/privatenumber/tsx) |

---

## 📁 Project Directory Layout

```text
HomeVault/
├── data/
│   └── homevault_db.json          # Persistent JSON database store
├── docs/
│   ├── CHAPTERS.md                # Project roadmap & milestones
│   ├── CHECKLIST.md               # Quality assurance checklists
│   ├── GIT_WORKFLOW.md            # Pull request & commit standards
│   ├── HLD.md                     # High-Level Architecture Design
│   ├── LLD.md                     # Low-Level Component Design
│   └── PRD.md                     # Product Requirements Document
├── src/
│   ├── components/
│   │   ├── auth/                  # Login & Authentication modal/page
│   │   ├── common/                # Navbar, Sidebar, Autocomplete, LocationPickerMap, Toast, Modals
│   │   ├── items/                 # ItemCard, ItemDetailModal, ItemFormModal
│   │   └── jslab/                 # CodeRunner, Closures, EventLoop, Hoisting, Promises, AsyncAwait
│   ├── concepts/                  # JavaScript Core Concepts implementations
│   │   ├── aggregationPipelines.js# Multi-stage NoSQL Aggregation engine
│   │   ├── asyncAwait.js          # Async/Await concurrency patterns
│   │   ├── closures.js            # Closure mechanics & memoization
│   │   ├── envSecretsManagement.js# Secret isolation & runtime config
│   │   ├── eventLoop.js           # Event Loop queue mechanics
│   │   ├── gitWorkflow.js         # Git branch & PR patterns
│   │   ├── hoisting.js            # Hoisting & TDZ mechanics
│   │   └── promisesVsCallbacks.js # Promise chaining & combinators
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication & theme state provider
│   ├── pages/                     # Main Application Views
│   │   ├── ActivityLogsPage.jsx   # Audit history logs view
│   │   ├── AnalyticsPage.jsx      # Financial breakdown & distribution charts
│   │   ├── DashboardPage.jsx      # KPI stat cards & hero banner
│   │   ├── InventoryPage.jsx      # Search, filter, sort & grid/list views
│   │   ├── JavaScriptLabPage.jsx  # Interactive JS sandbox masterclass
│   │   ├── LocationMapPage.jsx    # Interactive Leaflet map & room hierarchy
│   │   ├── NotificationsPage.jsx  # Warranty & system alerts
│   │   └── SettingsPage.jsx       # Profile edit, theme toggle & JSON backup
│   ├── server/
│   │   └── db.js                  # In-memory JSON database manager & aggregation engine
│   ├── services/
│   │   └── api.js                 # Centralized client-side fetch client
│   ├── App.jsx                    # Root application component & routing
│   ├── index.css                  # Global Tailwind CSS styles
│   └── main.jsx                   # React 19 entrypoint
├── .env.example                   # Environment configuration template
├── package.json                   # Project dependencies and npm scripts
├── server.js                      # Express API server & Vite middleware entrypoint
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler & PostCSS configuration
```

---

## 📡 REST API Reference

All requests requiring authentication support the `Authorization: Bearer <token>` header. If omitted, the server seamlessly falls back to the default demo user session.

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`email`, `password`, `fullName`) |
| `POST` | `/api/auth/login` | Authenticate with credentials and receive JWT |
| `GET` | `/api/auth/me` | Fetch active user profile and preferences |
| `PUT` | `/api/auth/profile` | Update profile details (`fullName`, `themePreference`, `avatarUrl`) |
| `PUT` | `/api/auth/password` | Update account password |
| `DELETE` | `/api/auth/delete-account` | Remove user account and associated items |

### 📦 Items & Inventory (`/api/items`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items` | Query items with search, category, brand, room, condition, priority, pagination |
| `GET` | `/api/items/:id` | Retrieve single item by ID and increment view count |
| `POST` | `/api/items` | Store a new item with metadata, coordinates, and media |
| `PUT` | `/api/items/:id` | Update an existing item |
| `DELETE` | `/api/items/:id` | Soft delete an item from active inventory |
| `PATCH` | `/api/items/:id/favorite` | Toggle item starred/favorite status |

### 📊 Dashboard, Analytics & Aggregations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suggestions` | Fetch autocomplete taxonomy suggestions (categories, rooms, drawers, brands) |
| `GET` | `/api/dashboard/stats` | Fetch summary KPI counts, total value, and warranty counts |
| `GET` | `/api/analytics` | Fetch category and room asset distribution breakdown |
| `POST` | `/api/analytics/aggregate` | Run custom multi-stage NoSQL aggregation pipeline (`$match`, `$group`, etc.) |
| `GET` | `/api/activity-logs` | Retrieve recent audit logs stream |
| `GET` | `/api/notifications` | Retrieve system alerts and warranty notifications |
| `PATCH` | `/api/notifications/:id/read`| Mark specific notification as read |
| `PATCH` | `/api/notifications/read-all`| Mark all notifications as read |

---

## ⚡ NoSQL Aggregation Engine

HomeVault includes a custom NoSQL aggregation pipeline engine directly in `src/server/db.js` and `src/concepts/aggregationPipelines.js`.

### Example Aggregation Request:
```javascript
// POST /api/analytics/aggregate
{
  "pipeline": [
    { "$match": { "price": { "$gte": 5000 } } },
    { "$unwind": "$tags" },
    { "$group": { "_id": "$tags", "totalValue": { "$sum": "$price" }, "itemCount": { "$sum": 1 } } },
    { "$sort": { "totalValue": -1 } },
    { "$limit": 5 }
  ]
}
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `bun` / `yarn` / `pnpm`)

### 1. Clone the Repository
```bash
git clone https://github.com/yashwardhan-chaudhari/HomeVault.git
cd HomeVault
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup (Optional)
Copy the example environment configuration:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🔧 Environment Configuration

The application works out of the box with sensible defaults. To customize secrets, create a `.env` file:

```env
# Application Server Port
PORT=3000

# JSON Web Token Secret
JWT_SECRET=homevault_secure_production_secret_key_2026

# Node Environment
NODE_ENV=development
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express backend server with integrated Vite HMR on port 3000 |
| `npm run build` | Builds the client production bundle and compiles the Node server via `esbuild` |
| `npm start` | Runs the compiled production server from `dist/server.cjs` |
| `npm test` | Runs the automated API and end-to-end verification test suite |

---

## 🧪 Testing & Quality Assurance

To execute the automated verification test suite covering all 20 API endpoints, authentication, CRUD operations, and aggregation pipelines:

```bash
node scratch/test-full-app.js
```

**Test Coverage Summary:**
- ✅ User Registration & JWT Authentication
- ✅ User Profile & Preferences Update
- ✅ Item Creation with Spatial Coordinates & Tags
- ✅ Item Search, Filtering & Pagination
- ✅ Autocomplete Suggestions
- ✅ Real-time Dashboard KPI Computation
- ✅ NoSQL Multi-Stage Aggregations (`$match`, `$group`, `$sort`, `$project`, `$unwind`)
- ✅ Audit Trail Activity Logging
- ✅ Notification Read Status
- ✅ Soft Deletion Verification

---

## 🤝 Contributing & Git Workflow

We welcome contributions! Please follow our established pull request protocol:

1. **Fork the Repository**
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Commit Your Changes**:
   ```bash
   git commit -m "feat: Add high-resolution floorplan map overlays"
   ```
4. **Push to Your Branch**:
   ```bash
   git push origin feat/your-feature-name
   ```
5. **Open a Pull Request**: Submit your PR with a clear summary of changes and testing steps against the `main` branch.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for organized living with <strong>HomeVault</strong>.
</p>
