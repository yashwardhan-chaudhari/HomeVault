# Comprehensive Project Concepts & Implementation Checklist

This document maps all curriculum and engineering concepts to their concrete implementations in the HomeVault application codebase.

---

## 1. Frontend — JavaScript Core Concepts

### 1.1 JavaScript — async/await
- **Rubric Category:** Frontend
- **Concept Name:** `JavaScript — async/await`
- **Implementation File(s):**
  - `/src/concepts/asyncAwait.js`
  - `/src/components/jslab/AsyncAwaitSection.jsx`
  - `/src/services/api.js` (Lines 15-80)
  - `/src/server/db.js`
- **Description & Proof:**
  - Used across all asynchronous API service communications, database query handlers, and data pipelines.
  - Implements sequential waterfalls vs parallel `Promise.all()` optimizations.
  - Robust exception handling via `try...catch...finally` blocks with automated fallbacks.

```javascript
/**
 * @concept JavaScript — async/await
 * @description Asynchronous non-blocking concurrency with try/catch error handling
 */
export async function fetchVaultItemsAsync(filterOptions = {}) {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const items = await response.json();
    return items;
  } catch (error) {
    console.error('Async/Await error caught:', error.message);
    throw error;
  }
}
```

---

### 1.2 JavaScript — Closures
- **Rubric Category:** Frontend
- **Concept Name:** `JavaScript — Closures`
- **Implementation File(s):**
  - `/src/concepts/closures.js`
  - `/src/components/jslab/ClosuresSection.jsx`
  - `/src/context/AuthContext.jsx`
- **Description & Proof:**
  - Implements data encapsulation and private variables (`_secretState`) retained in the function's lexical environment.
  - Used in debounce mechanisms (`useDebounce`), memoization caches, and React state preservation across re-renders.

```javascript
/**
 * @concept JavaScript — Closures
 * @description Lexical environment variable retention and data encapsulation
 */
export function createEncapsulatedVault(initialBalance = 0) {
  let _balance = initialBalance; // Private to lexical scope
  let _logs = [];

  return {
    deposit: (amount) => { _balance += amount; _logs.push({ action: 'DEPOSIT', amount }); return _balance; },
    withdraw: (amount) => { _balance -= amount; _logs.push({ action: 'WITHDRAW', amount }); return _balance; },
    getBalance: () => _balance,
    getAudit: () => [..._logs]
  };
}
```

---

### 1.3 JavaScript — Event loop
- **Rubric Category:** Frontend
- **Concept Name:** `JavaScript — Event loop`
- **Implementation File(s):**
  - `/src/concepts/eventLoop.js`
  - `/src/components/jslab/EventLoopSection.jsx`
- **Description & Proof:**
  - Coordinates non-blocking concurrency between Call Stack (LIFO), Web APIs, Microtask Queue (`Promise.then`, `queueMicrotask`), and Macrotask Queue (`setTimeout`, `setInterval`).
  - Interactive 4-box visualizer and priority scheduler demonstrating synchronous execution first, complete microtask drain, and subsequent macrotask ticks.

```javascript
/**
 * @concept JavaScript — Event loop
 * @description Priority queue coordination: Call Stack -> Microtasks -> Macrotasks
 */
export function demonstrateEventLoopOrder(logFn = console.log) {
  logFn('1. Sync Execution (Call Stack)');
  
  setTimeout(() => {
    logFn('4. Macrotask Dequeued (setTimeout)');
  }, 0);

  Promise.resolve().then(() => {
    logFn('3. Microtask Executed (Promise.then)');
  });

  queueMicrotask(() => {
    logFn('3.5 Microtask Executed (queueMicrotask)');
  });

  logFn('2. Sync Execution End (Call Stack)');
}
```

---

### 1.4 JavaScript — Hoisting
- **Rubric Category:** Frontend
- **Concept Name:** `JavaScript — Hoisting`
- **Implementation File(s):**
  - `/src/concepts/hoisting.js`
  - `/src/components/jslab/HoistingSection.jsx`
- **Description & Proof:**
  - Explains the V8/JS engine's two-phase execution: Creation Phase (Memory Allocation) vs Execution Phase.
  - Demonstrates differences between `var` (`undefined` initialization), `let`/`const` (**Temporal Dead Zone - TDZ**), and Function Declarations (fully hoisted) vs Function Expressions.

```javascript
/**
 * @concept JavaScript — Hoisting
 * @description Creation phase memory allocation vs Execution phase (TDZ)
 */
export function demonstrateHoisting() {
  // var is hoisted and initialized to undefined
  var hoistedVar = "Initialized";

  // let & const are hoisted into block scope but inaccessible in TDZ
  let blockScoped = "Safe";

  return { hoistedVar, blockScoped };
}
```

---

### 1.5 JavaScript — Promises vs callbacks
- **Rubric Category:** Frontend
- **Concept Name:** `JavaScript — Promises vs callbacks`
- **Implementation File(s):**
  - `/src/concepts/promisesVsCallbacks.js`
  - `/src/components/jslab/PromisesVsCallbacksSection.jsx`
- **Description & Proof:**
  - Compares ES5 Callback pyramids (Inversion of Control, pyramid of doom) with ES6 Promises (`.then().catch().finally()`) and Promise combinators (`Promise.all`, `Promise.race`, `Promise.allSettled`, `Promise.any`).
  - Interactive multi-stage comparison workbench executing identical asynchronous logic across all three styles.

```javascript
/**
 * @concept JavaScript — Promises vs callbacks
 * @description Evolution from callback-based control flow to chainable Promise objects
 */
export function callbackToPromiseAdapter(asyncCallbackFn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      asyncCallbackFn(...args, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
}
```

---

## 2. Engineering Practices

### 2.1 Git workflow
- **Rubric Category:** Engineering Practices
- **Concept Name:** `Git workflow`
- **Implementation File(s):**
  - `/docs/GIT_WORKFLOW.md`
  - `/src/concepts/gitWorkflow.js`
- **Description & Proof:**
  - Feature branching strategy (`main`, `develop`, `feature/*`, `hotfix/*`), semantic commit conventions (Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`), Pull Request review pipelines, and merge rebasing protocols.

---

### 2.2 Environment variables & secrets management
- **Rubric Category:** Engineering Practices
- **Concept Name:** `Environment variables & secrets management`
- **Implementation File(s):**
  - `/.env.example`
  - `/server.js` (Lines 1-30)
  - `/src/concepts/envSecretsManagement.js`
- **Description & Proof:**
  - Server-side isolation of secrets (`JWT_SECRET`, `PORT`).
  - Clean separation: No private API keys exposed to browser clients (`VITE_` prefix strictly for public non-sensitive config).
  - Lazy initialization and graceful degradation guards.

---

## 3. NoSQL (Mongo)

### 3.1 Aggregation pipelines
- **Rubric Category:** NoSQL (Mongo)
- **Concept Name:** `Aggregation pipelines`
- **Implementation File(s):**
  - `/src/server/db.js` (Aggregation Pipeline Engine)
  - `/src/concepts/aggregationPipelines.js`
  - `/server.js` (Route: `POST /api/analytics/aggregate`)
  - `/docs/CHAPTERS.md`
- **Description & Proof:**
  - Full implementation of multi-stage NoSQL Aggregation Pipeline stages:
    - `$match`: Filtering item collections by criteria (e.g. price > threshold, user ID).
    - `$group`: Grouping documents by room, category, or status with accumulators (`$sum`, `$avg`, `$count`, `$push`).
    - `$sort`: Ordering aggregation outputs ascending or descending.
    - `$project`: Reshaping, computed fields, and field inclusions/exclusions.
    - `$unwind`: Deconstructing tag arrays into individual records for deep analytics.
    - `$lookup`: Performing left outer joins between users and item vault collections.
