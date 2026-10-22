import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

describe('API Tests: Authentication & Authorization Security', () => {
  const uniqueId = Date.now();
  const testUser = {
    email: `sec_test_${uniqueId}@homevault.app`,
    password: 'StrongPassword123!',
    fullName: 'Security Test User'
  };

  let authToken = '';

  test('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token, 'Registration should return an authentication token');
    assert.equal(data.user.email, testUser.email);
    assert.ok(!data.user.passwordHash, 'Password hash must never be returned in response');
    authToken = data.token;
  });

  test('POST /api/auth/register rejects duplicate registration with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('already exists'));
  });

  test('POST /api/auth/register validates weak passwords (< 8 characters)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `weak_${Date.now()}@homevault.app`,
        password: 'short',
        fullName: 'Weak User'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('at least 8 characters'));
  });

  test('POST /api/auth/login authenticates registered user and issues JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.email, testUser.email);
  });

  test('POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword999'
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'Invalid email or password');
  });

  test('GET /api/auth/me returns 401 when token is missing', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.ok(data.error.includes('token required'));
  });

  test('GET /api/auth/me returns 401 when token is invalid or corrupted', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: 'Bearer totally-invalid-jwt-token' }
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.ok(data.error.includes('Invalid or expired'));
  });

  test('GET /api/auth/me returns authenticated user profile with valid token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, testUser.email);
    assert.equal(data.user.fullName, testUser.fullName);
  });

  test('Password reset flow: forgot-password generates secure token and resets password', async () => {
    // 1. Request reset token
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    assert.equal(forgotRes.status, 200);
    const forgotData = await forgotRes.json();
    assert.ok(forgotData.devResetToken, 'Development reset token must be returned for non-email testing');

    // 2. Reset password using token
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: forgotData.devResetToken,
        newPassword: 'BrandNewPassword456!'
      })
    });
    assert.equal(resetRes.status, 200);

    // 3. Verify old password no longer works
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    assert.equal(oldLoginRes.status, 401);

    // 4. Verify new password logs in successfully
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'BrandNewPassword456!'
      })
    });
    assert.equal(newLoginRes.status, 200);

    // 5. Verify token cannot be reused
    const reuseRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: forgotData.devResetToken,
        newPassword: 'AnotherPassword789!'
      })
    });
    assert.equal(reuseRes.status, 400);
  });
});
