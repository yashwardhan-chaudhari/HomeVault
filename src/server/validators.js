/**
 * Input validators and pure utility functions for HomeVault
 */

export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'document';
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .substring(0, 100);
};

export const validateRegisterInput = ({ email, password, fullName }) => {
  const errors = [];
  if (!email || !password || !fullName) {
    errors.push('Email, password, and full name are required');
    return errors;
  }

  const emailStr = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailStr)) {
    errors.push('Please enter a valid email address');
  }

  if (fullName.trim().length < 2 || fullName.trim().length > 50) {
    errors.push('Full name must be between 2 and 50 characters');
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one letter and one number');
  }

  return errors;
};

export const validateItemInput = (data, isUpdate = false) => {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid payload format'];
  }

  // Name (required on creation, validated if provided on update)
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Item name is required');
    } else if (data.name.trim().length > 100) {
      errors.push('Item name cannot exceed 100 characters');
    }
  }

  // Category
  if (data.category && (typeof data.category !== 'string' || data.category.length > 50)) {
    errors.push('Category must be a string up to 50 characters');
  }

  // Price
  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const numPrice = Number(data.price);
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push('Price must be a non-negative number');
    }
  }

  // Quantity
  if (data.quantity !== undefined && data.quantity !== null && data.quantity !== '') {
    const numQty = Number(data.quantity);
    if (!Number.isInteger(numQty) || numQty < 1) {
      errors.push('Quantity must be an integer of 1 or greater');
    }
  }

  // Dates
  if (data.purchaseDate && isNaN(Date.parse(data.purchaseDate))) {
    errors.push('Purchase date must be a valid date');
  }
  if (data.warrantyDate && isNaN(Date.parse(data.warrantyDate))) {
    errors.push('Warranty date must be a valid date');
  }

  // Condition
  if (data.condition && !['New', 'Like New', 'Good', 'Fair', 'Poor'].includes(data.condition)) {
    errors.push('Condition must be one of: New, Like New, Good, Fair, Poor');
  }

  // Priority
  if (data.priority && !['Low', 'Medium', 'High', 'Urgent'].includes(data.priority)) {
    errors.push('Priority must be one of: Low, Medium, High, Urgent');
  }

  // Images validation (Max 10 images, max ~5MB base64)
  if (data.images && Array.isArray(data.images)) {
    if (data.images.length > 10) {
      errors.push('A maximum of 10 photos can be attached per item');
    }
    for (const img of data.images) {
      if (typeof img === 'string' && img.startsWith('data:')) {
        const match = img.match(/^data:(image\/(jpeg|png|webp|gif));base64,/);
        if (!match) {
          errors.push('Attached images must be JPEG, PNG, WebP, or GIF');
          break;
        }
        if (img.length > 7 * 1024 * 1024) {
          errors.push('Attached image exceeds 5MB size limit');
          break;
        }
      }
    }
  }

  // Documents validation (Max 10 documents, max ~10MB base64)
  if (data.documents && Array.isArray(data.documents)) {
    if (data.documents.length > 10) {
      errors.push('A maximum of 10 documents can be attached per item');
    }
    for (const doc of data.documents) {
      if (doc && typeof doc === 'object') {
        doc.name = sanitizeFilename(doc.name);
        if (typeof doc.url === 'string' && doc.url.startsWith('data:')) {
          if (doc.url.length > 14 * 1024 * 1024) {
            errors.push(`Document "${doc.name}" exceeds 10MB limit`);
            break;
          }
        }
      }
    }
  }

  return errors;
};

/**
 * Calculates warranty status based on target date
 * @param {string|Date} warrantyDate
 * @returns {'active' | 'expiring' | 'expired' | 'none'}
 */
export const calculateWarrantyStatus = (warrantyDate) => {
  if (!warrantyDate) return 'none';
  const target = new Date(warrantyDate);
  if (isNaN(target.getTime())) return 'none';

  const now = new Date();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring';
  return 'active';
};

/**
 * Formats a hierarchical location into breadcrumbs string
 * @param {Object} loc
 * @returns {string} e.g. "Main House → 2nd Floor → Study Room → Desk → Top Drawer"
 */
export const formatLocationHierarchy = (loc) => {
  if (!loc || typeof loc !== 'object') return 'Unassigned';
  const parts = [
    loc.house,
    loc.floor,
    loc.room,
    loc.cupboard,
    loc.shelf,
    loc.drawer,
    loc.container,
    loc.exactPosition
  ].filter(p => typeof p === 'string' && p.trim().length > 0);

  return parts.length > 0 ? parts.join(' → ') : 'Unassigned';
};

/**
 * Computes portfolio asset metrics from an item list
 * @param {Array} items
 */
export const calculateAssetMetrics = (items) => {
  if (!Array.isArray(items)) {
    return {
      totalValue: 0,
      totalCount: 0,
      categoryCounts: {},
      categoryValues: {},
      warrantyCounts: { active: 0, expiring: 0, expired: 0, none: 0 }
    };
  }

  let totalValue = 0;
  const categoryCounts = {};
  const categoryValues = {};
  const warrantyCounts = { active: 0, expiring: 0, expired: 0, none: 0 };

  for (const item of items) {
    if (item.isDeleted) continue;

    const price = typeof item.price === 'number' && !isNaN(item.price) && item.price >= 0 ? item.price : 0;
    const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    const itemTotal = price * qty;

    totalValue += itemTotal;

    const cat = item.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    categoryValues[cat] = (categoryValues[cat] || 0) + itemTotal;

    const status = calculateWarrantyStatus(item.warrantyDate);
    warrantyCounts[status] = (warrantyCounts[status] || 0) + 1;
  }

  return {
    totalValue,
    totalCount: items.filter(i => !i.isDeleted).length,
    categoryCounts,
    categoryValues,
    warrantyCounts
  };
};
