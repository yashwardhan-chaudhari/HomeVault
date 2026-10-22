import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

describe('E2E Lifecycle: Complete User & Inventory Workflow', () => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@homevault.app`;
  const testPassword = 'SecurePassword2026!';
  let token = '';
  let createdItemId = '';

  test('Step 1: Register new user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'E2E Test Runner'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.email, testEmail);
    token = data.token;
  });

  test('Step 2: Add an item with structured indoor location hierarchy', async () => {
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Delonghi Espresso Machine',
        category: 'Appliances',
        subcategory: 'Kitchen',
        brand: 'DeLonghi',
        price: 45000,
        quantity: 1,
        condition: 'Like New',
        priority: 'High',
        purchaseDate: '2024-03-10',
        warrantyDate: '2026-03-10',
        location: {
          house: 'Summer Cottage',
          floor: 'Ground Floor',
          room: 'Kitchen',
          cupboard: 'Coffee Counter',
          shelf: 'Top Rack',
          exactPosition: 'Beside Grinder'
        },
        tags: ['Kitchen', 'Coffee', 'Italian']
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.item.id);
    assert.equal(data.item.name, 'Delonghi Espresso Machine');
    assert.equal(data.item.location.room, 'Kitchen');
    createdItemId = data.item.id;
  });

  test('Step 3: Retrieve item and verify complete information persists', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${createdItemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.item.name, 'Delonghi Espresso Machine');
    assert.equal(data.item.price, 45000);
    assert.equal(data.item.location.shelf, 'Top Rack');
    assert.equal(data.item.location.cupboard, 'Coffee Counter');
  });

  test('Step 4: Update item (edit price, change location)', async () => {
    const res = await fetch(`${BASE_URL}/api/items/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        price: 42000,
        location: {
          house: 'Summer Cottage',
          floor: 'Ground Floor',
          room: 'Pantry',
          cupboard: 'Storage Shelf A'
        },
        notes: 'Relocated to pantry for kitchen remodeling'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.item.price, 42000);
    assert.equal(data.item.location.room, 'Pantry');
    assert.equal(data.item.notes, 'Relocated to pantry for kitchen remodeling');
  });

  test('Step 5: Search for item by keyword and verify match', async () => {
    const res = await fetch(`${BASE_URL}/api/items?search=Espresso`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.items.length, 1);
    assert.equal(data.items[0].id, createdItemId);
  });

  test('Step 6: Filter items by room location', async () => {
    const res = await fetch(`${BASE_URL}/api/items?room=Pantry`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.items.length, 1);
    assert.equal(data.items[0].location.room, 'Pantry');
  });

  test('Step 7: Check locations hierarchy endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.rooms));
    assert.ok(data.rooms.some(r => r.name === 'Pantry'));
  });

  test('Step 8: Check dashboard metrics answer the 4 core questions', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalItems, 1);
    assert.equal(data.totalValue, 42000);
  });

  test('Step 9: Delete item and verify deletion', async () => {
    const deleteRes = await fetch(`${BASE_URL}/api/items/${createdItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(deleteRes.status, 200);

    // Verify it is no longer listed in active items
    const listRes = await fetch(`${BASE_URL}/api/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    assert.equal(listData.items.length, 0);
  });
});
