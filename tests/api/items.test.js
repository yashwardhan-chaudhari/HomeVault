import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

describe('API Tests: Inventory Items & Cross-Tenant Authorization Isolation', () => {
  let userAToken = '';
  let userBToken = '';
  let userAItemId = '';

  before(async () => {
    const timestamp = Date.now();
    // Register User A
    const resA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `usera_${timestamp}@vault.io`,
        password: 'Password123!',
        fullName: 'User Alice'
      })
    });
    const dataA = await resA.json();
    userAToken = dataA.token;

    // Register User B
    const resB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `userb_${timestamp}@vault.io`,
        password: 'Password123!',
        fullName: 'User Bob'
      })
    });
    const dataB = await resB.json();
    userBToken = dataB.token;
  });

  test('GET /api/items without token is rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/items`);
    assert.equal(res.status, 401);
  });

  test('POST /api/items creates item for User A with full location hierarchy', async () => {
    const itemPayload = {
      name: 'MacBook Pro 16 M3',
      category: 'Electronics',
      price: 249990,
      quantity: 1,
      condition: 'Like New',
      priority: 'High',
      purchaseDate: '2024-06-01',
      warrantyDate: '2027-06-01',
      location: {
        house: 'Main House',
        floor: '2nd Floor',
        room: 'Study Room',
        cupboard: 'Work Desk',
        drawer: 'Top Drawer',
        exactPosition: 'Left sleeve'
      }
    };

    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify(itemPayload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.item.id);
    assert.equal(data.item.name, itemPayload.name);
    assert.equal(data.item.location.room, 'Study Room');
    userAItemId = data.item.id;
  });

  test('POST /api/items warns on duplicate item in same room/location', async () => {
    const duplicatePayload = {
      name: 'MacBook Pro 16 M3',
      category: 'Electronics',
      price: 249990,
      location: {
        room: 'Study Room'
      }
    };

    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify(duplicatePayload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.duplicateWarning, 'Server should flag potential duplicate');
    assert.ok(data.duplicateWarning.includes('similar name'));
  });

  test('POST /api/items rejects invalid payload (e.g. negative price, empty name)', async () => {
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        name: '',
        price: -100
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Item name is required'));
    assert.ok(data.error.includes('non-negative number'));
  });

  test('GET /api/items returns only User A items when authenticated as User A', async () => {
    const res = await fetch(`${BASE_URL}/api/items`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.items));
    assert.ok(data.items.length >= 2);
    // All items must belong to User A
    assert.ok(data.items.every(i => i.name.includes('MacBook')));
  });

  test('GET /api/items returns 0 items for new User B (tenant isolation)', async () => {
    const res = await fetch(`${BASE_URL}/api/items`, {
      headers: { Authorization: `Bearer ${userBToken}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.items));
    assert.equal(data.items.length, 0, 'User B must not see any of User A items');
  });

  test('CRITICAL SECURITY: User B cannot retrieve User A private item by ID', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${userAItemId}`, {
      headers: { Authorization: `Bearer ${userBToken}` }
    });

    assert.equal(res.status, 404, 'Must return 404 when item does not belong to requester');
    const data = await res.json();
    assert.equal(data.error, 'Item not found in your vault');
  });

  test('CRITICAL SECURITY: User B cannot modify User A private item', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${userAItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`
      },
      body: JSON.stringify({ name: 'Hacked Laptop By Bob' })
    });

    assert.equal(res.status, 404);
  });

  test('CRITICAL SECURITY: User B cannot delete User A private item', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${userAItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userBToken}` }
    });

    assert.equal(res.status, 404);
  });

  test('User A can successfully update their own item', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${userAItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        notes: 'Updated notes with asset tag #7721'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.item.notes, 'Updated notes with asset tag #7721');
  });

  test('User A can delete their own item', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${userAItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` }
    });

    assert.equal(res.status, 200);

    // Verify subsequent fetch returns 404
    const getRes = await fetch(`${BASE_URL}/api/items/${userAItemId}`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    assert.equal(getRes.status, 404);
  });
});
