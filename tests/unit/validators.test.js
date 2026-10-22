import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateItemInput,
  validateRegisterInput,
  sanitizeFilename,
  calculateWarrantyStatus,
  formatLocationHierarchy,
  calculateAssetMetrics
} from '../../src/server/validators.js';

describe('Unit Tests: Validation & Helper Logic', () => {
  describe('validateRegisterInput', () => {
    test('accepts valid registration data', () => {
      const errors = validateRegisterInput({
        email: 'user@example.com',
        password: 'SecurePassword123',
        fullName: 'Jane Doe'
      });
      assert.equal(errors.length, 0);
    });

    test('rejects missing or empty fields', () => {
      const errors = validateRegisterInput({
        email: '',
        password: '',
        fullName: ''
      });
      assert.ok(errors.length > 0);
      assert.ok(errors.some(e => e.includes('required')));
    });

    test('rejects invalid email formats', () => {
      const errors = validateRegisterInput({
        email: 'invalid-email-address',
        password: 'Password123',
        fullName: 'Jane Doe'
      });
      assert.ok(errors.some(e => e.includes('valid email')));
    });

    test('rejects short passwords (< 8 characters)', () => {
      const errors = validateRegisterInput({
        email: 'user@example.com',
        password: 'Pass1',
        fullName: 'Jane Doe'
      });
      assert.ok(errors.some(e => e.includes('at least 8 characters')));
    });

    test('rejects passwords without numbers or letters', () => {
      const errorsNoNumbers = validateRegisterInput({
        email: 'user@example.com',
        password: 'OnlyLettersPassword',
        fullName: 'Jane Doe'
      });
      assert.ok(errorsNoNumbers.some(e => e.includes('at least one letter and one number')));

      const errorsNoLetters = validateRegisterInput({
        email: 'user@example.com',
        password: '1234567890',
        fullName: 'Jane Doe'
      });
      assert.ok(errorsNoLetters.some(e => e.includes('at least one letter and one number')));
    });
  });

  describe('validateItemInput', () => {
    test('accepts valid item data', () => {
      const errors = validateItemInput({
        name: 'Standing Desk',
        category: 'Furniture',
        price: 35000,
        quantity: 1,
        condition: 'Good',
        priority: 'High',
        purchaseDate: '2024-01-15',
        warrantyDate: '2026-01-15'
      });
      assert.equal(errors.length, 0);
    });

    test('rejects missing item name', () => {
      const errors = validateItemInput({
        category: 'Electronics',
        price: 1000
      });
      assert.ok(errors.some(e => e.includes('Item name is required')));
    });

    test('rejects negative purchase prices', () => {
      const errors = validateItemInput({
        name: 'Faulty Monitor',
        price: -500
      });
      assert.ok(errors.some(e => e.includes('non-negative number')));
    });

    test('rejects non-integer or zero quantity', () => {
      const errorsZero = validateItemInput({
        name: 'Screws Pack',
        quantity: 0
      });
      assert.ok(errorsZero.some(e => e.includes('integer of 1 or greater')));

      const errorsDecimal = validateItemInput({
        name: 'Screws Pack',
        quantity: 2.5
      });
      assert.ok(errorsDecimal.some(e => e.includes('integer of 1 or greater')));
    });

    test('rejects invalid date strings', () => {
      const errors = validateItemInput({
        name: 'Blender',
        purchaseDate: 'not-a-valid-date',
        warrantyDate: '32-13-9999'
      });
      assert.ok(errors.some(e => e.includes('Purchase date must be a valid date')));
      assert.ok(errors.some(e => e.includes('Warranty date must be a valid date')));
    });

    test('rejects invalid condition and priority values', () => {
      const errors = validateItemInput({
        name: 'Chair',
        condition: 'SuperAwesome',
        priority: 'Emergency'
      });
      assert.ok(errors.some(e => e.includes('Condition must be one of')));
      assert.ok(errors.some(e => e.includes('Priority must be one of')));
    });
  });

  describe('sanitizeFilename', () => {
    test('sanitizes dangerous characters and directory traversal', () => {
      const unsafe = '../../../etc/passwd.jpg';
      const safe = sanitizeFilename(unsafe);
      assert.ok(!safe.includes('/'));
      assert.ok(!safe.includes('\\'));
      assert.ok(!safe.includes('..'));
    });

    test('preserves legitimate alphanumeric names with dots and dashes', () => {
      const input = 'receipt_invoice-2026.03.pdf';
      const output = sanitizeFilename(input);
      assert.equal(output, 'receipt_invoice-2026.03.pdf');
    });
  });

  describe('calculateWarrantyStatus', () => {
    test('returns "none" for null or missing warranty date', () => {
      assert.equal(calculateWarrantyStatus(null), 'none');
      assert.equal(calculateWarrantyStatus(''), 'none');
      assert.equal(calculateWarrantyStatus(undefined), 'none');
    });

    test('returns "expired" for past dates', () => {
      const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      assert.equal(calculateWarrantyStatus(past), 'expired');
    });

    test('returns "expiring" for dates within 30 days', () => {
      const soon = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
      assert.equal(calculateWarrantyStatus(soon), 'expiring');
    });

    test('returns "active" for dates beyond 30 days', () => {
      const future = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString();
      assert.equal(calculateWarrantyStatus(future), 'active');
    });
  });

  describe('formatLocationHierarchy', () => {
    test('formats complete location hierarchy with arrows', () => {
      const loc = {
        house: 'Main House',
        floor: '1st Floor',
        room: 'Study',
        cupboard: 'Oak Desk',
        shelf: 'Top Shelf',
        drawer: 'Middle Drawer',
        container: 'Pencil Box',
        exactPosition: 'Left slot'
      };
      const formatted = formatLocationHierarchy(loc);
      assert.equal(
        formatted,
        'Main House → 1st Floor → Study → Oak Desk → Top Shelf → Middle Drawer → Pencil Box → Left slot'
      );
    });

    test('skips empty or unassigned hierarchy levels cleanly', () => {
      const loc = {
        house: '',
        room: 'Living Room',
        cupboard: 'TV Console'
      };
      const formatted = formatLocationHierarchy(loc);
      assert.equal(formatted, 'Living Room → TV Console');
    });

    test('returns "Unassigned" for empty or non-object locations', () => {
      assert.equal(formatLocationHierarchy(null), 'Unassigned');
      assert.equal(formatLocationHierarchy({}), 'Unassigned');
    });
  });

  describe('calculateAssetMetrics', () => {
    test('correctly calculates total value, category counts, and warranty counts', () => {
      const items = [
        {
          name: 'Laptop',
          category: 'Electronics',
          price: 100000,
          quantity: 1,
          warrantyDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Monitor',
          category: 'Electronics',
          price: 25000,
          quantity: 2,
          warrantyDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Desk Chair',
          category: 'Furniture',
          price: 15000,
          quantity: 1,
          warrantyDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Old Lamp (Deleted)',
          category: 'Furniture',
          price: 2000,
          quantity: 1,
          isDeleted: true
        }
      ];

      const metrics = calculateAssetMetrics(items);
      // Total value: 100000*1 + 25000*2 + 15000*1 = 165000
      assert.equal(metrics.totalValue, 165000);
      assert.equal(metrics.totalCount, 3);
      assert.equal(metrics.categoryCounts['Electronics'], 2);
      assert.equal(metrics.categoryCounts['Furniture'], 1);
      assert.equal(metrics.categoryValues['Electronics'], 150000);
      assert.equal(metrics.categoryValues['Furniture'], 15000);
      assert.equal(metrics.warrantyCounts.active, 1);
      assert.equal(metrics.warrantyCounts.expiring, 1);
      assert.equal(metrics.warrantyCounts.expired, 1);
    });
  });
});
