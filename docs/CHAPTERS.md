# HomeVault Curriculum Chapters & Concept Implementations

This document outlines the chapters and technical competencies implemented in this repository.

---

## Chapter 1: Frontend Core JavaScript Mechanics
- **JavaScript — async/await**: Implemented in `/src/concepts/asyncAwait.js` and `/src/components/jslab/AsyncAwaitSection.jsx`.
- **JavaScript — Closures**: Implemented in `/src/concepts/closures.js` and `/src/components/jslab/ClosuresSection.jsx`.
- **JavaScript — Event loop**: Implemented in `/src/concepts/eventLoop.js` and `/src/components/jslab/EventLoopSection.jsx`.
- **JavaScript — Hoisting**: Implemented in `/src/concepts/hoisting.js` and `/src/components/jslab/HoistingSection.jsx`.
- **JavaScript — Promises vs callbacks**: Implemented in `/src/concepts/promisesVsCallbacks.js` and `/src/components/jslab/PromisesVsCallbacksSection.jsx`.

---

## Chapter 2: Engineering Practices & DevOps
- **Git workflow**: Implemented in `/docs/GIT_WORKFLOW.md` and `/src/concepts/gitWorkflow.js`.
- **Environment variables & secrets management**: Implemented in `/.env.example`, `/server.js`, and `/src/concepts/envSecretsManagement.js`.

---

## Chapter 3: NoSQL Database Design & Aggregation Pipelines
- **Aggregation pipelines**: Implemented in `/src/concepts/aggregationPipelines.js`, `/src/server/db.js`, and `POST /api/analytics/aggregate`.
- Supports `$match`, `$group`, `$sort`, `$project`, `$unwind`, and `$lookup` pipeline stages.
