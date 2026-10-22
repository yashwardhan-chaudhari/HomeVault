# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Architecture Overview

HomeVault enforces defensive security across all layers:
- **Strict Authentication**: All protected inventory endpoints reject missing or invalid tokens with `401 Unauthorized`.
- **Tenant Data Isolation**: Database queries are strictly scoped to the authenticated `userId`. Cross-user access returns `404 Not Found`.
- **JWT Secret Handling**: Requires `JWT_SECRET` in the environment; refuses to start with hardcoded fallbacks.
- **Password Security**: Passwords are hashed with `bcryptjs` (10 rounds). Plaintext passwords and hashes are never exposed.
- **Cryptographic Recovery**: Password resets utilize 32-byte secure tokens, hashed with SHA-256, expired after 15 minutes, with one-time use guarantees.
- **Rate Limiting**: In-memory rate limiting throttles brute-force attempts on `/api/auth/login`.
- **Input & Upload Defense**: Validates data types, lengths, MIME headers, base64 size limits, and sanitizes filenames to prevent path traversal.

## Reporting a Vulnerability

If you discover a security vulnerability in HomeVault, please report it privately:
1. Do not file public GitHub issues for security vulnerabilities.
2. Email the project maintainer with steps to reproduce, affected endpoints, and potential impact.
3. We will acknowledge receipt within 48 hours and work on a fix promptly.
