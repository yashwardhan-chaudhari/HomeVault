# High-Level Design (HLD)
## HomeVault - Smart Home Inventory Management System

---

## Document Control

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-08-18 | Engineering Team | Initial HLD |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Architecture](#3-architecture)
4. [Component Design](#4-component-design)
5. [Data Flow](#5-data-flow)
6. [Technology Stack](#6-technology-stack)
7. [Security Architecture](#7-security-architecture)
8. [Scalability & Performance](#8-scalability--performance)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Integration Points](#10-integration-points)

---

## 1. Introduction

### 1.1 Purpose
This document provides a high-level architectural design for HomeVault, a smart home inventory management system. It outlines the system architecture, key components, data flows, and technical decisions.

### 1.2 Scope
This HLD covers:
- System architecture and component interactions
- Technology stack and frameworks
- Data storage and management
- Security and authentication mechanisms
- Scalability and performance considerations
- Deployment strategy

### 1.3 Audience
- Software architects
- Development team
- DevOps engineers
- Product managers
- Technical stakeholders

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| SPA | Single Page Application |
| REST | Representational State Transfer |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| SSR | Server-Side Rendering |
| CDN | Content Delivery Network |
| API | Application Programming Interface |
| AI | Artificial Intelligence |
| ML | Machine Learning |

---

## 2. System Overview

### 2.1 System Purpose
HomeVault enables users to digitally catalog, organize, track, and locate household items through a web-based interface with AI-powered features, interactive maps, and comprehensive analytics.

### 2.2 Key Features
1. **Item Management**: CRUD operations for household items with rich metadata
2. **AI Auto-Detection**: Computer vision-based item recognition and classification
3. **Location Mapping**: Interactive maps showing physical item locations
4. **Analytics Dashboard**: Visual insights into inventory distribution and trends
5. **Search & Filter**: Advanced search with multiple filter criteria
6. **Activity Tracking**: Comprehensive audit logs for all item operations
7. **Notifications**: Proactive alerts for warranties and important dates
8. **User Management**: Secure authentication and profile management

### 2.3 System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        External Systems                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Browser    │      │   Mobile     │                    │
│  │   (Users)    │      │   Device     │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                      │                             │
│         └──────────┬───────────┘                            │
│                    │                                         │
│                    ▼                                         │
│         ┌──────────────────────┐                            │
│         │                      │                            │
│         │    HomeVault App     │◄─────────┐                │
│         │     (Frontend)       │          │                │
│         │                      │          │                │
│         └──────────┬───────────┘          │                │
│                    │                      │                │
│                    │ HTTPS/REST           │                │
│                    │                      │                │
│                    ▼                      │                │
│         ┌──────────────────────┐         │                │
│         │                      │         │                │
│         │  HomeVault Server    │◄────────┤                │
│         │    (Backend API)     │         │                │
│         │                      │         │                │
│         └──────────┬───────────┘         │                │
│                    │                      │                │
│         ┌──────────┼──────────┐          │                │
│         │          │          │          │                │
│         ▼          ▼          ▼          │                │
│  ┌──────────┐ ┌────────┐ ┌─────────┐   │                │
│  │   JSON   │ │ Gemini │ │  File   │   │                │
│  │ Database │ │   AI   │ │ Storage │   │                │
│  │          │ │  API   │ │         │   │                │
│  └──────────┘ └────────┘ └─────────┘   │                │
│                                          │                │
└──────────────────────────────────────────┘                │
```

---

## 3. Architecture

### 3.1 Architectural Style
HomeVault follows a **Client-Server Architecture** with a **REST API** backend and a **Single-Page Application (SPA)** frontend.

**Key Characteristics**:
- **Separation of Concerns**: Frontend (presentation) and backend (business logic, data) are decoupled
- **Stateless Communication**: REST API with JWT-based stateless authentication
- **Component-Based Frontend**: React components for modular, reusable UI
- **Service-Oriented Backend**: Express.js with middleware for cross-cutting concerns

### 3.2 Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Components (Pages, Modals, Forms, Charts)      │ │
│  │  State Management (Context API, Local State)           │ │
│  │  Routing (React Router for SPA navigation)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js Middleware (Auth, CORS, Rate Limiting)    │ │
│  │  Request Validation & Error Handling                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Route Handlers (Controllers)                          │ │
│  │  Service Layer (Business Rules, Validation)            │ │
│  │  AI Integration (Gemini Vision API)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database Manager (CRUD operations)                    │ │
│  │  Query Builder & Aggregation Pipeline                  │ │
│  │  Data Models & Schemas                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  JSON File Database (Development)                      │ │
│  │  PostgreSQL / MongoDB (Production)                     │ │
│  │  File Storage (Images, Documents)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Component Interaction Diagram

```
┌──────────────┐
│    User      │
│   Browser    │
└──────┬───────┘
       │
       │ 1. HTTP Request (GET /api/items)
       ▼
┌────────────────────────────┐
│   Express Middleware       │
│  - authenticateToken()     │
│  - CORS handling           │
│  - Body parsing            │
└────────────┬───────────────┘
             │
             │ 2. Authenticated Request
             ▼
┌────────────────────────────┐
│   Route Handler            │
│   GET /api/items           │
└────────────┬───────────────┘
             │
             │ 3. Extract query params
             ▼
┌────────────────────────────┐
│   Database Manager         │
│   db.getItems(userId, opts)│
└────────────┬───────────────┘
             │
             │ 4. Query JSON database
             ▼
┌────────────────────────────┐
│   JSON Database            │
│   Filter, Sort, Paginate   │
└────────────┬───────────────┘
             │
             │ 5. Return items array
             ▼
┌────────────────────────────┐
│   Route Handler            │
│   Format response          │
└────────────┬───────────────┘
             │
             │ 6. JSON Response
             ▼
┌────────────────────────────┐
│   User Browser             │
│   Update React UI          │
└────────────────────────────┘
```

---

## 4. Component Design

### 4.1 Frontend Components

#### 4.1.1 Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── MainApp
│       ├── Sidebar
│       ├── Navbar
│       └── Pages
│           ├── DashboardPage
│           ├── InventoryPage
│           ├── LocationMapPage
│           ├── AnalyticsPage
│           ├── ActivityLogsPage
│           ├── NotificationsPage
│           ├── SettingsPage
│           └── JavaScriptLabPage
└── Modals
    ├── ItemFormModal
    ├── ItemDetailModal
    ├── AutoDetectModal
    └── ConfirmModal
```

#### 4.1.2 Key Components

**1. AuthContext (Context Provider)**
- **Purpose**: Global authentication state management
- **State**: `{ isAuthenticated, user, loading, login, logout, updateProfile }`
- **Responsibilities**:
  - JWT token storage and validation
  - User authentication flow
  - Protect routes requiring authentication

**2. Navbar**
- **Purpose**: Top navigation bar with search and quick actions
- **Features**:
  - Search bar with real-time filtering
  - Add item and AI auto-detect buttons
  - User profile dropdown
  - Theme toggle
  - Notifications badge

**3. Sidebar**
- **Purpose**: Left navigation menu for page switching
- **Features**:
  - Dashboard, Inventory, Map, Analytics, Activity, Settings navigation
  - Active tab highlighting
  - Responsive collapse on mobile
  - Quick action buttons

**4. ItemFormModal**
- **Purpose**: Add/Edit item form with validation
- **Features**:
  - Multi-section form (basic info, location, media, dates)
  - Autocomplete suggestions
  - Image/video/document upload
  - Location picker with hierarchy
  - Form validation

**5. ItemDetailModal**
- **Purpose**: View full item details in modal
- **Features**:
  - Image gallery with zoom
  - All item metadata display
  - Edit and delete actions
  - Favorite toggle
  - Document downloads

**6. AutoDetectModal**
- **Purpose**: AI-powered item detection interface
- **Features**:
  - Image upload/capture
  - AI analysis with loading state
  - Detected fields display
  - Edit detected information
  - Save to vault

**7. LocationMapPage**
- **Purpose**: Interactive map showing item locations
- **Features**:
  - Leaflet map with custom markers
  - Clustered pins for multiple items
  - Click pin to view item details
  - Filter by category/room
  - Full-screen mode

**8. AnalyticsPage**
- **Purpose**: Visual analytics and insights
- **Features**:
  - Recharts bar, pie, line charts
  - Items by category, room, condition
  - Monthly activity trends
  - Value distribution
  - Export functionality

### 4.2 Backend Components

#### 4.2.1 Server Architecture

```
server.js (Entry Point)
│
├── Express App Setup
│   ├── Middleware Registration
│   │   ├── express.json()
│   │   ├── express.urlencoded()
│   │   ├── CORS
│   │   └── authenticateToken
│   │
│   ├── Route Registration
│   │   ├── Auth Routes (/api/auth/*)
│   │   ├── Items Routes (/api/items/*)
│   │   ├── Analytics Routes (/api/analytics/*)
│   │   ├── Notifications Routes (/api/notifications/*)
│   │   └── Suggestions Route (/api/suggestions)
│   │
│   └── Vite Dev Server (Development)
│       └── Static File Serving (Production)
│
└── Database Manager (db.js)
    ├── JSONDatabaseManager Class
    │   ├── User CRUD
    │   ├── Item CRUD
    │   ├── Activity Logs
    │   ├── Notifications
    │   ├── Suggestions Generator
    │   ├── Dashboard Stats
    │   ├── Analytics Data
    │   └── Aggregation Pipeline
    │
    └── Gemini Service (geminiService.js)
        └── analyzeItemImage()
```

#### 4.2.2 Database Manager

**Class**: `JSONDatabaseManager`

**Responsibilities**:
1. **Data Persistence**: Read/write JSON file
2. **User Management**: Authentication, profile updates
3. **Item Management**: CRUD operations with filtering, sorting, pagination
4. **Activity Logging**: Track all item operations
5. **Notifications**: Create and manage user notifications
6. **Suggestions**: Generate autocomplete data from user's items
7. **Analytics**: Aggregate data for dashboards and charts
8. **Aggregation Pipeline**: NoSQL-style query execution

**Key Methods**:
```javascript
// Users
getUserByEmail(email)
getUserById(id)
createUser(userData)
updateUser(id, updates)
updatePassword(id, newPasswordHash)
deleteUser(id)

// Items
getItems(userId, options) // with filters, search, pagination
getItemById(userId, id)
createItem(userId, itemData)
updateItem(userId, id, updates)
softDeleteItem(userId, id)
toggleFavorite(userId, id)
recordItemView(userId, id)

// Suggestions
getSuggestions(userId)

// Analytics
getDashboardStats(userId)
getAnalyticsData(userId)
aggregateItems(userId, pipeline)

// Activity & Notifications
recordActivityLog(userId, data)
getActivityLogs(userId, limit)
createNotification(userId, data)
getNotifications(userId)
markNotificationRead(userId, id)
markAllNotificationsRead(userId)
```

#### 4.2.3 Authentication Middleware

**Function**: `authenticateToken`

**Flow**:
```javascript
1. Extract JWT token from Authorization header
2. If no token → Set userId to default 'user_demo_001' (demo mode)
3. If token present → Verify with JWT_SECRET
4. If valid → Decode userId and attach to req.userId
5. If invalid → Fallback to demo user
6. Call next() to continue to route handler
```

**Security Features**:
- Bearer token format
- JWT expiry (7 days)
- Demo mode for unauthenticated users
- Graceful degradation (no hard errors)

#### 4.2.4 Gemini AI Service

**File**: `geminiService.js`

**Function**: `analyzeItemImage(imageBase64, mimeType)`

**Flow**:
```javascript
1. Receive base64-encoded image
2. Initialize Gemini Vision API client
3. Construct prompt for item detection
4. Send image to Gemini API
5. Parse AI response (JSON format)
6. Extract: name, category, subcategory, brand, description, condition, tags
7. Return structured item data
```

**AI Prompt Example**:
```
Analyze this image of a household item and provide the following information in JSON format:
- name: item name
- category: general category (e.g., Electronics, Furniture, Clothing)
- subcategory: specific type
- brand: manufacturer or brand name if visible
- description: brief description
- condition: estimated condition (New, Like New, Good, Fair, Poor)
- tags: array of relevant tags
```

---

## 5. Data Flow

### 5.1 User Authentication Flow

```
┌───────────┐
│   User    │
└─────┬─────┘
      │
      │ 1. Enter email + password
      ▼
┌────────────────────┐
│  LoginPage.jsx     │
└─────┬──────────────┘
      │
      │ 2. POST /api/auth/login
      ▼
┌────────────────────┐
│  Server: login     │
│  route handler     │
└─────┬──────────────┘
      │
      │ 3. db.getUserByEmail(email)
      ▼
┌────────────────────┐
│  Database Manager  │
└─────┬──────────────┘
      │
      │ 4. Return user with passwordHash
      ▼
┌────────────────────┐
│  bcrypt.compare    │
│  (password, hash)  │
└─────┬──────────────┘
      │
      │ 5. If match → Generate JWT token
      ▼
┌────────────────────┐
│  jwt.sign({userId},│
│  JWT_SECRET)       │
└─────┬──────────────┘
      │
      │ 6. Return { user, token }
      ▼
┌────────────────────┐
│  Frontend: Store   │
│  token in Context  │
└─────┬──────────────┘
      │
      │ 7. Attach to Authorization header for all API calls
      ▼
┌────────────────────┐
│  Authenticated App │
└────────────────────┘
```

### 5.2 Item Creation Flow

```
┌───────────┐
│   User    │
└─────┬─────┘
      │
      │ 1. Click "+ Add Item"
      ▼
┌────────────────────┐
│ ItemFormModal opens│
└─────┬──────────────┘
      │
      │ 2. User fills form fields
      │    - Autocomplete suggests existing values
      ▼
┌────────────────────┐
│ User uploads images│
│ (optional)         │
└─────┬──────────────┘
      │
      │ 3. Click "Save to Vault"
      ▼
┌────────────────────┐
│ Validate form data │
└─────┬──────────────┘
      │
      │ 4. POST /api/items
      │    Body: { name, category, location, price, images, ... }
      ▼
┌────────────────────┐
│ Server: create item│
│ route handler      │
└─────┬──────────────┘
      │
      │ 5. db.createItem(userId, itemData)
      ▼
┌────────────────────┐
│ Generate unique ID │
│ Add timestamps     │
│ Set default values │
└─────┬──────────────┘
      │
      │ 6. Save to database
      │    db.data.items.unshift(newItem)
      │    db.save()
      ▼
┌────────────────────┐
│ Record activity log│
│ "Created" action   │
└─────┬──────────────┘
      │
      │ 7. Return { item: newItem }
      ▼
┌────────────────────┐
│ Frontend: Close    │
│ modal, show toast, │
│ refresh item list  │
└────────────────────┘
```

### 5.3 AI Auto-Detect Flow

```
┌───────────┐
│   User    │
└─────┬─────┘
      │
      │ 1. Click "AI Auto-Detect"
      ▼
┌────────────────────┐
│ AutoDetectModal    │
│ opens              │
└─────┬──────────────┘
      │
      │ 2. User uploads image or takes photo
      ▼
┌────────────────────┐
│ Convert image to   │
│ base64 string      │
└─────┬──────────────┘
      │
      │ 3. POST /api/autodetect
      │    Body: { imageBase64, mimeType }
      ▼
┌────────────────────┐
│ Server: autodetect │
│ route handler      │
└─────┬──────────────┘
      │
      │ 4. analyzeItemImage(imageBase64, mimeType)
      ▼
┌────────────────────┐
│ Gemini Vision API  │
│ - Send image       │
│ - Send prompt      │
└─────┬──────────────┘
      │
      │ 5. AI processes image and returns JSON
      ▼
┌────────────────────┐
│ Parse AI response  │
│ Extract: name,     │
│ category, brand,   │
│ description, tags  │
└─────┬──────────────┘
      │
      │ 6. Return { name, category, brand, ... }
      ▼
┌────────────────────┐
│ Frontend: Populate │
│ form with AI data  │
└─────┬──────────────┘
      │
      │ 7. User reviews and edits if needed
      ▼
┌────────────────────┐
│ User clicks "Save  │
│ to Vault"          │
└─────┬──────────────┘
      │
      │ 8. POST /api/items (standard item creation)
      ▼
┌────────────────────┐
│ Item created with  │
│ AI-detected data   │
└────────────────────┘
```

### 5.4 Search & Filter Flow

```
┌───────────┐
│   User    │
└─────┬─────┘
      │
      │ 1. Type in search bar
      ▼
┌────────────────────┐
│ Real-time search   │
│ on every keystroke │
└─────┬──────────────┘
      │
      │ 2. GET /api/items?search=laptop&category=Electronics&page=1
      ▼
┌────────────────────┐
│ Server: get items  │
│ route handler      │
└─────┬──────────────┘
      │
      │ 3. db.getItems(userId, { search, category, page, limit })
      ▼
┌────────────────────┐
│ Database Manager   │
│ - Filter by search │
│ - Filter by filters│
│ - Sort by sortBy   │
│ - Paginate results │
└─────┬──────────────┘
      │
      │ 4. Return { items: [...], pagination: { total, page, totalPages } }
      ▼
┌────────────────────┐
│ Frontend: Update   │
│ item grid with     │
│ filtered results   │
└────────────────────┘
```

---

## 6. Technology Stack

### 6.1 Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | React | 19.0.1 | UI component library |
| **Build Tool** | Vite | 6.2.3 | Fast dev server and bundler |
| **Styling** | Tailwind CSS | 4.1.14 | Utility-first CSS framework |
| **Icons** | Lucide React | 0.546.0 | Icon library |
| **Animations** | Motion | 12.23.24 | Animation library (Framer Motion) |
| **Charts** | Recharts | 3.10.1 | Data visualization |
| **Maps** | React Leaflet | 5.0.0 | Interactive maps |
| **Routing** | React Router | - | Client-side routing (if needed) |
| **State** | React Context API | Built-in | Global state management |
| **HTTP** | Fetch API | Built-in | API requests |

### 6.2 Backend Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Node.js | 22+ | JavaScript runtime |
| **Framework** | Express.js | 4.21.2 | Web server framework |
| **Database** | JSON File | - | File-based database (dev) |
| **Authentication** | jsonwebtoken | 9.0.3 | JWT token generation |
| **Password** | bcryptjs | 3.0.3 | Password hashing |
| **AI** | Google Gemini | 2.4.0 | Computer vision API |
| **Environment** | dotenv | 17.2.3 | Environment variables |
| **Dev Server** | tsx | 4.21.0 | TypeScript execution |

### 6.3 DevOps & Tooling

| Category | Tool | Purpose |
|----------|------|---------|
| **Version Control** | Git + GitHub | Source code management |
| **Package Manager** | npm / Bun | Dependency management |
| **Linter** | ESLint | Code quality |
| **Formatter** | Prettier | Code formatting |
| **Type Checking** | TypeScript | Static type checking |
| **Testing** | Vitest + React Testing Library | Unit & integration tests |
| **CI/CD** | GitHub Actions | Automated builds and deploys |
| **Hosting** | Vercel / Netlify | Frontend hosting |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Google Analytics | User analytics |

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**Authentication Mechanism**: JWT (JSON Web Tokens)

**Flow**:
1. User submits email + password via POST /api/auth/login
2. Server validates credentials with bcrypt.compareSync()
3. If valid, generate JWT token: `jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })`
4. Client stores token (localStorage or memory)
5. Client includes token in Authorization header: `Bearer <token>`
6. Server middleware `authenticateToken` validates token on protected routes
7. Decoded `userId` attached to `req.userId` for route handlers

**Security Features**:
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- Token expiry (7 days)
- HTTPS-only transmission (production)
- HTTP-only cookies option (future enhancement)

### 7.2 Data Security

**Encryption**:
- **In Transit**: HTTPS/TLS 1.3
- **At Rest**: File system permissions, encrypted disk (production)

**Access Control**:
- User can only access their own items (userId filter in queries)
- Demo user (`user_demo_001`) has shared access for demo purposes
- Role-based access control (RBAC) prepared for admin features

**Input Validation**:
- Server-side validation for all API inputs
- Email format validation
- Password strength requirements (min 6 characters)
- File upload size limits (25MB)
- Allowed file types for uploads

### 7.3 API Security

**Rate Limiting**:
- 100 requests per minute per IP (to be implemented)
- Prevents brute-force attacks

**CORS Policy**:
- Configured to allow frontend origin only
- Credentials allowed for cookie-based auth (if used)

**SQL Injection Prevention**:
- N/A (using JSON file database, no SQL queries)
- For production database: Use parameterized queries or ORM

**XSS Prevention**:
- React automatically escapes JSX output
- Sanitize user inputs before rendering HTML

**CSRF Prevention**:
- JWT tokens in Authorization header (not cookies)
- SameSite cookie attribute (if using cookies)

---

## 8. Scalability & Performance

### 8.1 Scalability Strategies

**Current State** (MVP):
- Single server instance
- JSON file database
- No caching layer
- Suitable for up to 100 concurrent users

**Future Scalability** (Production):

1. **Horizontal Scaling**:
   - Deploy multiple server instances behind load balancer
   - Session affinity or stateless JWT for distributed auth
   - CDN for static assets

2. **Database Scaling**:
   - Migrate to PostgreSQL or MongoDB
   - Read replicas for read-heavy operations
   - Database sharding by userId for data partitioning

3. **Caching**:
   - Redis for session storage
   - Cache frequently accessed data (dashboard stats, suggestions)
   - CDN caching for images and static files

4. **Async Processing**:
   - Queue system (Bull, RabbitMQ) for AI image processing
   - Background jobs for analytics aggregation
   - Email notifications via async workers

### 8.2 Performance Optimizations

**Frontend**:
- Code splitting (React.lazy, dynamic imports)
- Image lazy loading and responsive images
- Virtual scrolling for large item lists (react-window)
- Debounced search input (300ms delay)
- Memoization of expensive components (React.memo, useMemo)
- Service worker for offline capabilities (PWA)

**Backend**:
- Database indexing (userId, category, room)
- Query result pagination (limit 24 items per page)
- Gzip compression for API responses
- Connection pooling for database
- Caching layer for suggestions and stats

**Asset Optimization**:
- Image compression (WebP format)
- Minified CSS and JS bundles
- Tree shaking for unused code removal
- CDN delivery for static assets

### 8.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | <2s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| API Response Time | <200ms | Server logs |
| Search Response Time | <100ms | Browser DevTools |
| Image Upload | <5s | User timing API |
| AI Detection | <3s | Server logs |
| Database Query | <50ms | Query profiling |

---

## 9. Deployment Architecture

### 9.1 Development Environment

```
Developer Machine
│
├── Vite Dev Server (Port 5173)
│   └── Hot Module Replacement (HMR)
│
├── Express Server (Port 3000)
│   └── Proxies API requests from Vite
│
└── JSON Database (data/homevault_db.json)
```

**Commands**:
- `npm run dev`: Starts both Vite and Express server with tsx
- Hot reload for React components
- File-based database with automatic seeding

### 9.2 Production Environment

```
┌─────────────────────────────────────────────────────┐
│                    Load Balancer                     │
│                  (NGINX / AWS ALB)                   │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│  App Server 1 │         │  App Server 2 │
│  (Node.js)    │         │  (Node.js)    │
└───────┬───────┘         └───────┬───────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   PostgreSQL Database  │
        │   (Primary + Replica)  │
        └────────────────────────┘
```

**Components**:
1. **CDN**: CloudFlare / AWS CloudFront for static assets
2. **Load Balancer**: Distributes traffic across app servers
3. **App Servers**: Multiple Node.js instances (Docker containers)
4. **Database**: PostgreSQL with read replicas
5. **File Storage**: AWS S3 / Cloudinary for images and documents
6. **Monitoring**: Sentry for errors, Datadog for metrics

### 9.3 CI/CD Pipeline

```
Developer Push to GitHub
        │
        ▼
GitHub Actions Triggered
        │
        ├── Run Linter (ESLint)
        ├── Run Tests (Vitest)
        ├── Build Frontend (vite build)
        ├── Build Backend (esbuild)
        │
        ▼
Deploy to Staging
        │
        ├── Run E2E Tests (Playwright)
        ├── Manual QA
        │
        ▼
Deploy to Production
        │
        ├── Health Check
        ├── Smoke Tests
        └── Rollback if failed
```

**Deployment Strategy**:
- **Blue-Green Deployment**: Zero-downtime deploys
- **Canary Releases**: Gradual rollout to subset of users
- **Rollback Plan**: Automated rollback on health check failure

---

## 10. Integration Points

### 10.1 External APIs

#### Google Gemini Vision API
- **Purpose**: AI-powered image analysis for item detection
- **Endpoint**: `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp`
- **Authentication**: API Key (stored in environment variables)
- **Request**: Base64-encoded image + text prompt
- **Response**: JSON with detected item attributes
- **Rate Limits**: TBD (check Gemini API documentation)
- **Error Handling**: Fallback to manual entry if API fails

#### Leaflet Tile Servers (Maps)
- **Purpose**: Map tiles for interactive location mapping
- **Endpoint**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Authentication**: None (free tier)
- **Rate Limits**: Respect OpenStreetMap usage policy
- **Fallback**: Alternative tile providers (Mapbox, Google Maps)

### 10.2 Third-Party Libraries

| Library | Purpose | License |
|---------|---------|---------|
| React | UI framework | MIT |
| Express | Web server | MIT |
| Tailwind CSS | Styling | MIT |
| Recharts | Charts | MIT |
| React Leaflet | Maps | BSD-2-Clause |
| Lucide React | Icons | ISC |

### 10.3 Future Integrations

1. **Cloud Storage**: AWS S3, Cloudinary for scalable image storage
2. **Email Service**: SendGrid, AWS SES for transactional emails
3. **Payment Gateway**: Stripe for subscription payments
4. **Analytics**: Mixpanel, Amplitude for product analytics
5. **Push Notifications**: Firebase Cloud Messaging (FCM)
6. **Search Engine**: Algolia for advanced full-text search
7. **OCR Service**: Google Cloud Vision for receipt scanning
8. **Backup Service**: AWS Glacier for long-term data archival

---

## 11. Monitoring & Logging

### 11.1 Application Monitoring

**Error Tracking**: Sentry
- Frontend errors (React error boundaries)
- Backend errors (Express error middleware)
- Source maps for minified code
- User context (userId, browser, OS)

**Performance Monitoring**:
- Server response times (percentiles: p50, p95, p99)
- Database query performance
- API endpoint latency
- Client-side metrics (Core Web Vitals)

**Uptime Monitoring**:
- Health check endpoint: GET /health
- Synthetic monitoring (Pingdom, UptimeRobot)
- Alert on downtime >1 minute

### 11.2 Logging Strategy

**Log Levels**:
- **ERROR**: Application errors requiring immediate attention
- **WARN**: Unexpected behavior that doesn't break functionality
- **INFO**: Important application events (user registration, item creation)
- **DEBUG**: Detailed diagnostic information (development only)

**Log Aggregation**:
- Centralized logging (ELK Stack, Datadog Logs)
- Structured JSON logs for easy parsing
- Log retention: 30 days hot storage, 1 year cold storage

**Audit Logs**:
- All CRUD operations logged with timestamp, userId, action, itemId
- Stored in `activityLogs` collection
- Immutable (append-only)

---

## 12. Disaster Recovery & Backup

### 12.1 Backup Strategy

**Database Backups**:
- **Frequency**: Daily automated backups at 2 AM UTC
- **Retention**: 7 daily, 4 weekly, 12 monthly backups
- **Storage**: AWS S3 with cross-region replication
- **Encryption**: AES-256 encryption at rest

**File Storage Backups**:
- Images and documents backed up to S3 with versioning
- Deleted items marked as soft-deleted (not permanently removed)

### 12.2 Recovery Procedures

**Database Restore**:
1. Identify backup point (timestamp)
2. Download backup from S3
3. Stop application servers
4. Restore database from backup
5. Run data integrity checks
6. Restart application servers
7. Notify users of any data loss

**RTO (Recovery Time Objective)**: <4 hours  
**RPO (Recovery Point Objective)**: <24 hours (daily backups)

---

## 13. Appendix

### 13.1 API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| GET | /api/items | Get all items (filtered, paginated) |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| POST | /api/autodetect | AI image analysis |
| GET | /api/dashboard/stats | Dashboard metrics |
| GET | /api/analytics | Analytics data |
| GET | /api/activity-logs | Activity history |
| GET | /api/notifications | User notifications |

### 13.2 Glossary

| Term | Definition |
|------|------------|
| **Item** | A household object cataloged in HomeVault |
| **Location** | Physical location hierarchy (house → room → cupboard) |
| **Favorite** | User-marked item for quick access |
| **Activity Log** | Audit trail of item operations |
| **Suggestion** | Autocomplete data derived from user's existing items |
| **Aggregation Pipeline** | Multi-stage data processing (MongoDB-style) |
| **Soft Delete** | Mark item as deleted without removing from database |

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-18  
**Next Review**: 2026-09-18  
**Author**: Engineering Team  
**Approval**: Solutions Architect
