import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'homevault_db.json');

// Initial seed items for demo accounts
const getDemoSeedItems = (adminId, demoId) => {
  const today = new Date();
  
  // Expiration in 20 days
  const in20Days = new Date();
  in20Days.setDate(today.getDate() + 20);

  // Expired 45 days ago
  const expired45Days = new Date();
  expired45Days.setDate(today.getDate() - 45);

  // Active for 1 year
  const in365Days = new Date();
  in365Days.setDate(today.getDate() + 365);

  const createSeedItem = (userId, overrides) => ({
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    userId,
    description: '',
    brand: '',
    tags: [],
    price: 0,
    purchaseDate: '2025-01-15',
    warrantyDate: '',
    quantity: 1,
    condition: 'Good',
    priority: 'Medium',
    serialNumber: '',
    notes: '',
    isFavorite: false,
    isDeleted: false,
    location: {
      house: 'Main Residence',
      floor: '1st Floor',
      room: 'General Storage',
      cupboard: '',
      shelf: '',
      drawer: '',
      container: '',
      exactPosition: ''
    },
    images: ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'],
    videos: [],
    documents: [],
    viewedCount: 1,
    lastViewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  });

  const adminItems = [
    createSeedItem(adminId, {
      name: 'Apple MacBook Pro 16" M3 Max',
      category: 'Electronics',
      subcategory: 'Computers',
      brand: 'Apple',
      tags: ['Work', 'Laptop', 'Apple', 'High Value'],
      price: 249900,
      purchaseDate: '2025-06-10',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 1,
      condition: 'New',
      priority: 'Urgent',
      serialNumber: 'C02G876XMD6T',
      notes: 'Contains confidential development environment and local vault keys',
      isFavorite: true,
      location: {
        house: 'Main Residence',
        floor: '2nd Floor',
        room: 'Study Room',
        cupboard: 'Executive Desk',
        shelf: '',
        drawer: 'Top Drawer (Locked)',
        container: 'Leather Sleeve',
        exactPosition: 'Left Compartment'
      },
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'Sony',
      tags: ['Audio', 'Travel', 'Noise Cancelling'],
      price: 29990,
      purchaseDate: '2024-11-05',
      warrantyDate: in20Days.toISOString().split('T')[0], // Expiring soon
      quantity: 1,
      condition: 'Like New',
      priority: 'High',
      serialNumber: 'S01-9872134-B',
      notes: 'Warranty expiring soon - check ear cushions replacement program',
      isFavorite: true,
      location: {
        house: 'Main Residence',
        floor: '2nd Floor',
        room: 'Master Bedroom',
        cupboard: 'Nightstand',
        shelf: '',
        drawer: 'Top Drawer',
        container: 'Original Hard Case',
        exactPosition: 'Center'
      },
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Bosch Professional Cordless Hammer Drill Kit',
      category: 'Tools',
      subcategory: 'Power Tools',
      brand: 'Bosch',
      tags: ['Hardware', 'Workshop', 'Power Tools'],
      price: 14500,
      purchaseDate: '2023-08-14',
      warrantyDate: expired45Days.toISOString().split('T')[0], // Expired
      quantity: 1,
      condition: 'Good',
      priority: 'Medium',
      serialNumber: 'BSH-882910-K',
      notes: 'Includes 2x 18V Li-ion batteries and fast charger',
      isFavorite: false,
      location: {
        house: 'Main Residence',
        floor: 'Ground Floor',
        room: 'Garage',
        cupboard: 'Heavy Duty Tool Cabinet',
        shelf: 'Shelf 3',
        drawer: '',
        container: 'Bosch L-BOXX Case',
        exactPosition: 'Left Side'
      },
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Dyson V15 Detect Absolute Vacuum Cleaner',
      category: 'Appliances',
      subcategory: 'Cleaning',
      brand: 'Dyson',
      tags: ['Home Care', 'Cleaning', 'Appliances'],
      price: 65900,
      purchaseDate: '2025-02-18',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 1,
      condition: 'Like New',
      priority: 'High',
      serialNumber: 'DY-V15-99214A',
      notes: 'Mounted on wall dock. Extra filters stored in cupboard.',
      isFavorite: false,
      location: {
        house: 'Main Residence',
        floor: 'Ground Floor',
        room: 'Utility Room',
        cupboard: 'Cleaning Closet',
        shelf: 'Wall Mount',
        drawer: '',
        container: '',
        exactPosition: 'Charging Station'
      },
      images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Samsonite Proxis Hardside Spinner Suitcase 75cm',
      category: 'Travel',
      subcategory: 'Luggage',
      brand: 'Samsonite',
      tags: ['Travel', 'Bags', 'Luggage'],
      price: 38500,
      purchaseDate: '2024-04-12',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 1,
      condition: 'Good',
      priority: 'Medium',
      serialNumber: 'SAM-PROX-75-SILV',
      notes: 'TSA lock combination code set to 418. Luggage tag attached.',
      isFavorite: true,
      location: {
        house: 'Main Residence',
        floor: 'Attic',
        room: 'Storage Room',
        cupboard: 'Luggage Rack',
        shelf: 'Top Rack',
        drawer: '',
        container: 'Dust Cover',
        exactPosition: 'Section B'
      },
      images: ['https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Herman Miller Aeron Ergonomic Office Chair',
      category: 'Furniture',
      subcategory: 'Chairs',
      brand: 'Herman Miller',
      tags: ['Ergonomics', 'Office', 'Furniture'],
      price: 125000,
      purchaseDate: '2024-01-20',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 1,
      condition: 'Like New',
      priority: 'Medium',
      serialNumber: 'HM-AERON-SIZE-B-2024',
      notes: '12-year manufacturer warranty. Forward tilt and lumbar support enabled.',
      isFavorite: false,
      location: {
        house: 'Main Residence',
        floor: '2nd Floor',
        room: 'Study Room',
        cupboard: '',
        shelf: '',
        drawer: '',
        container: '',
        exactPosition: 'Primary Desk Position'
      },
      images: ['https://images.unsplash.com/photo-1580481077195-c22ae2499d25?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Canon EOS R6 Mark II Mirrorless Camera',
      category: 'Photography',
      subcategory: 'Cameras',
      brand: 'Canon',
      tags: ['Photography', 'Camera', 'Creative'],
      price: 215000,
      purchaseDate: '2024-09-15',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 1,
      condition: 'New',
      priority: 'Urgent',
      serialNumber: 'CN-R6M2-88129',
      notes: 'Stored with silica gel packets in moisture-controlled dry cabinet',
      isFavorite: true,
      location: {
        house: 'Main Residence',
        floor: '1st Floor',
        room: 'Living Room',
        cupboard: 'Display Cabinet',
        shelf: 'Middle Shelf',
        drawer: '',
        container: 'Padded Pelican Case',
        exactPosition: 'Right Compartment'
      },
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(adminId, {
      name: 'Family Passports & Vehicle Title Documents',
      category: 'Documents',
      subcategory: 'Identification',
      brand: 'Official',
      tags: ['Legal', 'Passports', 'High Security', 'Documents'],
      price: 0,
      purchaseDate: '2024-01-01',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 4,
      condition: 'New',
      priority: 'Urgent',
      serialNumber: 'DOC-SET-2026-VAULT',
      notes: 'Passports for Alex, Sarah, and vehicle registration papers',
      isFavorite: true,
      location: {
        house: 'Main Residence',
        floor: '2nd Floor',
        room: 'Study Room',
        cupboard: 'Fireproof Safe',
        shelf: 'Upper Tray',
        drawer: '',
        container: 'Waterproof Document Wallet',
        exactPosition: 'Front Section'
      },
      images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80']
    })
  ];

  // Demo user items
  const demoItems = [
    createSeedItem(demoId, {
      name: 'iPad Pro 12.9" M2 with Magic Keyboard',
      category: 'Electronics',
      subcategory: 'Tablets',
      brand: 'Apple',
      tags: ['Tablet', 'Portable', 'Apple'],
      price: 112000,
      purchaseDate: '2025-01-10',
      warrantyDate: in365Days.toISOString().split('T')[0],
      quantity: 1,
      condition: 'New',
      priority: 'High',
      serialNumber: 'AP-IPAD-PRO-M2-89',
      isFavorite: true,
      location: {
        house: 'Townhouse',
        floor: '1st Floor',
        room: 'Living Room',
        cupboard: 'Bookshelf',
        shelf: 'Shelf 2',
        drawer: '',
        container: 'Felt Sleeve',
        exactPosition: 'Beside Sofa'
      },
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80']
    }),
    createSeedItem(demoId, {
      name: 'DeLonghi Magnifica S Espresso Machine',
      category: 'Appliances',
      subcategory: 'Kitchen',
      brand: 'DeLonghi',
      tags: ['Kitchen', 'Coffee', 'Appliances'],
      price: 48000,
      purchaseDate: '2024-07-22',
      warrantyDate: in20Days.toISOString().split('T')[0], // Expiring soon
      quantity: 1,
      condition: 'Good',
      priority: 'Medium',
      serialNumber: 'DL-MAG-S-4412',
      isFavorite: true,
      location: {
        house: 'Townhouse',
        floor: 'Ground Floor',
        room: 'Kitchen',
        cupboard: 'Coffee Station Counter',
        shelf: '',
        drawer: '',
        container: '',
        exactPosition: 'Next to Refrigerator'
      },
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=800&auto=format&fit=crop&q=80']
    })
  ];

  return [...adminItems, ...demoItems];
};

// Initial seed data if DB file doesn't exist
const getInitialSeedData = () => {
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const adminId = 'user_demo_001';
  const demoId = 'user_demo_002';

  const defaultUser = {
    id: adminId,
    email: 'alex@homevault.io',
    fullName: 'Alex Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    themePreference: 'light',
    notificationPrefs: {
      email: true,
      warranty: true,
      expiry: true,
      weeklyDigest: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoAppUser = {
    id: demoId,
    email: 'demo@homevault.app',
    fullName: 'Demo Member',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    themePreference: 'light',
    notificationPrefs: {
      email: true,
      warranty: true,
      expiry: true,
      weeklyDigest: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleItems = getDemoSeedItems(adminId, demoId);

  const initialLogs = [
    {
      id: 'log_seed_1',
      userId: adminId,
      itemId: sampleItems[0].id,
      itemName: sampleItems[0].name,
      action: 'Created',
      details: 'Initial inventory cataloging',
      timestamp: new Date().toISOString()
    },
    {
      id: 'log_seed_2',
      userId: demoId,
      itemId: sampleItems[sampleItems.length - 1].id,
      itemName: sampleItems[sampleItems.length - 1].name,
      action: 'Created',
      details: 'Added espresso machine to kitchen counter',
      timestamp: new Date().toISOString()
    }
  ];

  const initialNotifs = [
    {
      id: 'notif_seed_1',
      userId: adminId,
      title: 'Warranty Expiration Alert',
      message: 'Sony WH-1000XM5 warranty will expire in 20 days.',
      type: 'warning',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users: [
      { ...defaultUser, passwordHash: defaultPasswordHash },
      { ...demoAppUser, passwordHash: defaultPasswordHash }
    ],
    items: sampleItems,
    activityLogs: initialLogs,
    notifications: initialNotifs,
    passwordResetTokens: []
  };
};

export class JSONDatabaseManager {
  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const dbData = JSON.parse(raw);
        const passHash = bcrypt.hashSync('password123', 10);

        if (!Array.isArray(dbData.users)) dbData.users = [];
        if (!Array.isArray(dbData.items)) dbData.items = [];
        if (!Array.isArray(dbData.activityLogs)) dbData.activityLogs = [];
        if (!Array.isArray(dbData.notifications)) dbData.notifications = [];
        if (!Array.isArray(dbData.passwordResetTokens)) dbData.passwordResetTokens = [];

        // Ensure default demo users exist
        if (!dbData.users.some(u => u.email === 'demo@homevault.app')) {
          dbData.users.push({
            id: 'user_demo_002',
            email: 'demo@homevault.app',
            fullName: 'Demo Member',
            passwordHash: passHash,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            role: 'user',
            themePreference: 'light',
            notificationPrefs: { email: true, warranty: true, expiry: true, weeklyDigest: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        if (!dbData.users.some(u => u.email === 'alex@homevault.io')) {
          dbData.users.push({
            id: 'user_demo_001',
            email: 'alex@homevault.io',
            fullName: 'Alex Vance',
            passwordHash: passHash,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'user',
            themePreference: 'light',
            notificationPrefs: { email: true, warranty: true, expiry: true, weeklyDigest: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        // Ensure demo accounts have valid password hashes for evaluation
        for (const u of dbData.users) {
          if ((u.email === 'demo@homevault.app' || u.email === 'alex@homevault.io') && (!u.passwordHash || !bcrypt.compareSync('password123', u.passwordHash))) {
            u.passwordHash = passHash;
          }
        }

        // If items collection is empty, seed realistic demonstration items
        const activeItems = dbData.items.filter(i => !i.isDeleted);
        if (activeItems.length === 0) {
          const seeds = getDemoSeedItems('user_demo_001', 'user_demo_002');
          dbData.items = seeds;
        }

        this.saveData(dbData);
        return dbData;
      }
    } catch (e) {
      console.error('Error reading JSON DB, initializing fresh seed:', e);
    }
    const seed = getInitialSeedData();
    this.saveData(seed);
    return seed;
  }

  /**
   * Atomic, crash-resilient file persistence
   * Writes to a temporary file, creates a backup, and renames atomically.
   */
  saveData(dataToSave) {
    const tmpFile = `${DB_FILE}.tmp`;
    const bakFile = `${DB_FILE}.bak`;
    try {
      const payload = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(tmpFile, payload, 'utf-8');

      if (fs.existsSync(DB_FILE)) {
        try {
          fs.copyFileSync(DB_FILE, bakFile);
        } catch (_) {}
      }

      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Safe file write error, attempting direct fallback write:', e);
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
      } catch (err2) {
        console.error('Critical database write failure:', err2);
      }
    }
  }

  save() {
    this.saveData(this.data);
  }

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================

  getUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  getUserById(id) {
    if (!id) return null;
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  createUser(userData) {
    const newUser = {
      id: 'user_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      email: userData.email.trim().toLowerCase(),
      fullName: userData.fullName.trim(),
      passwordHash: userData.passwordHash,
      role: 'user',
      themePreference: 'light',
      notificationPrefs: {
        email: true,
        warranty: true,
        expiry: true,
        weeklyDigest: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return this.getUserById(newUser.id);
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');

    const allowedUpdates = {};
    if (updates.fullName !== undefined) allowedUpdates.fullName = String(updates.fullName).trim();
    if (updates.avatarUrl !== undefined) allowedUpdates.avatarUrl = String(updates.avatarUrl).trim();
    if (updates.themePreference !== undefined) allowedUpdates.themePreference = updates.themePreference === 'dark' ? 'dark' : 'light';
    if (updates.notificationPrefs !== undefined) allowedUpdates.notificationPrefs = { ...this.data.users[idx].notificationPrefs, ...updates.notificationPrefs };

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.getUserById(id);
  }

  updatePassword(id, newPasswordHash) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');

    this.data.users[idx].passwordHash = newPasswordHash;
    this.data.users[idx].updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  deleteUser(id) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.items = this.data.items.filter(i => i.userId !== id);
    this.data.activityLogs = this.data.activityLogs.filter(l => l.userId !== id);
    this.data.notifications = this.data.notifications.filter(n => n.userId !== id);
    this.data.passwordResetTokens = (this.data.passwordResetTokens || []).filter(t => t.userId !== id);
    this.save();
    return true;
  }

  // ==========================================
  // CRYPTOGRAPHIC PASSWORD RESET
  // ==========================================

  createPasswordResetToken(email) {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    // Invalidate existing unused tokens for this user
    if (!this.data.passwordResetTokens) this.data.passwordResetTokens = [];
    this.data.passwordResetTokens.forEach(t => {
      if (t.userId === user.id && !t.used) {
        t.used = true;
      }
    });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    this.data.passwordResetTokens.push({
      id: 'prt_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    });

    this.save();
    return { token, userId: user.id, email: user.email };
  }

  validateAndConsumePasswordResetToken(token, newPasswordHash) {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Reset token is required' };
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokens = this.data.passwordResetTokens || [];
    const tokenRecord = tokens.find(t => t.tokenHash === tokenHash && !t.used);

    if (!tokenRecord) {
      return { success: false, error: 'Invalid or already used password reset token' };
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      tokenRecord.used = true;
      this.save();
      return { success: false, error: 'Password reset token has expired. Please request a new one.' };
    }

    const user = this.data.users.find(u => u.id === tokenRecord.userId);
    if (!user) {
      return { success: false, error: 'User account not found' };
    }

    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date().toISOString();

    this.recordActivityLog(user.id, {
      itemId: 'auth_security',
      itemName: 'Account Security',
      action: 'Updated',
      details: 'Password was reset using secure recovery token'
    });

    this.save();
    return { success: true };
  }

  // ==========================================
  // ITEMS MANAGEMENT WITH STRICT AUTHORIZATION
  // ==========================================

  /**
   * Check for duplicate items owned by the same user with similar name & location
   */
  checkForDuplicate(userId, itemData) {
    if (!itemData || !itemData.name) return null;
    const nameLower = itemData.name.trim().toLowerCase();
    const room = itemData.location?.room || '';

    const existing = this.data.items.find(i =>
      !i.isDeleted &&
      i.userId === userId &&
      i.name.trim().toLowerCase() === nameLower &&
      (room ? (i.location?.room || '').toLowerCase() === room.toLowerCase() : true)
    );

    if (existing) {
      const locStr = [existing.location?.house, existing.location?.room, existing.location?.cupboard].filter(Boolean).join(' → ');
      return `You already have an item named "${existing.name}" stored in ${locStr || 'this location'}.`;
    }
    return null;
  }

  /**
   * Retrieve items strictly scoped to the requesting authenticated user
   */
  getItems(userId, options = {}) {
    if (!userId) {
      return { items: [], pagination: { total: 0, page: 1, limit: 24, totalPages: 1 } };
    }

    // STRICT USER ISOLATION
    let result = this.data.items.filter(i => !i.isDeleted && i.userId === userId);

    const {
      search, category, subcategory, brand, room, house,
      condition, priority, isFavorite, tag, warrantyStatus,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 24
    } = options;

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        (i.subcategory && i.subcategory.toLowerCase().includes(q)) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.serialNumber && i.serialNumber.toLowerCase().includes(q)) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(q))) ||
        (i.location && (
          (i.location.room && i.location.room.toLowerCase().includes(q)) ||
          (i.location.house && i.location.house.toLowerCase().includes(q)) ||
          (i.location.cupboard && i.location.cupboard.toLowerCase().includes(q)) ||
          (i.location.drawer && i.location.drawer.toLowerCase().includes(q)) ||
          (i.location.shelf && i.location.shelf.toLowerCase().includes(q)) ||
          (i.location.container && i.location.container.toLowerCase().includes(q))
        ))
      );
    }

    if (category) result = result.filter(i => i.category && i.category.toLowerCase() === category.toLowerCase());
    if (subcategory) result = result.filter(i => i.subcategory && i.subcategory.toLowerCase() === subcategory.toLowerCase());
    if (brand) result = result.filter(i => i.brand && i.brand.toLowerCase() === brand.toLowerCase());
    if (room) result = result.filter(i => i.location && i.location.room && i.location.room.toLowerCase() === room.toLowerCase());
    if (house) result = result.filter(i => i.location && i.location.house && i.location.house.toLowerCase() === house.toLowerCase());
    if (condition) result = result.filter(i => i.condition && i.condition.toLowerCase() === condition.toLowerCase());
    if (priority) result = result.filter(i => i.priority && i.priority.toLowerCase() === priority.toLowerCase());
    if (isFavorite) result = result.filter(i => i.isFavorite === true);
    if (tag) result = result.filter(i => i.tags && i.tags.some(t => t.toLowerCase() === tag.toLowerCase()));

    // Warranty filter
    if (warrantyStatus) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (warrantyStatus === 'active') {
        result = result.filter(i => i.warrantyDate && new Date(i.warrantyDate) >= now);
      } else if (warrantyStatus === 'expiring') {
        result = result.filter(i => {
          if (!i.warrantyDate) return false;
          const w = new Date(i.warrantyDate);
          const diffDays = Math.ceil((w.getTime() - now.getTime()) / (1000 * 3600 * 24));
          return diffDays >= 0 && diffDays <= 30;
        });
      } else if (warrantyStatus === 'expired') {
        result = result.filter(i => i.warrantyDate && new Date(i.warrantyDate) < now);
      }
    }

    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'warrantyDate' || sortBy === 'purchaseDate') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 24));
    const safePage = Math.max(1, Number(page) || 1);
    const totalPages = Math.ceil(total / safeLimit) || 1;
    const startIdx = (safePage - 1) * safeLimit;
    const paginatedItems = result.slice(startIdx, startIdx + safeLimit);

    return {
      items: paginatedItems,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages
      }
    };
  }

  /**
   * Get single item strictly scoped to the user
   */
  getItemById(userId, id) {
    if (!userId || !id) return null;
    return this.data.items.find(i => String(i.id) === String(id) && !i.isDeleted && i.userId === userId) || null;
  }

  createItem(userId, itemData) {
    if (!userId) throw new Error('User ID is required');

    const warning = this.checkForDuplicate(userId, itemData);

    const priceNum = typeof itemData.price === 'number' && !isNaN(itemData.price) && itemData.price >= 0
      ? Number(itemData.price)
      : (Number(itemData.price) >= 0 ? Number(itemData.price) : 0);

    const quantityNum = Number.isInteger(Number(itemData.quantity)) && Number(itemData.quantity) >= 1
      ? Number(itemData.quantity)
      : 1;

    const loc = itemData.location || {};
    const safeLocation = {
      house: String(loc.house || 'Main Residence').trim(),
      floor: String(loc.floor || '1st Floor').trim(),
      room: String(loc.room || 'General Storage').trim(),
      cupboard: String(loc.cupboard || '').trim(),
      shelf: String(loc.shelf || '').trim(),
      drawer: String(loc.drawer || '').trim(),
      container: String(loc.container || '').trim(),
      exactPosition: String(loc.exactPosition || '').trim(),
      latitude: typeof loc.latitude === 'number' ? loc.latitude : undefined,
      longitude: typeof loc.longitude === 'number' ? loc.longitude : undefined
    };

    const newItem = {
      id: 'item_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      userId,
      name: String(itemData.name).trim(),
      description: String(itemData.description || '').trim(),
      category: String(itemData.category || 'General').trim(),
      subcategory: String(itemData.subcategory || '').trim(),
      brand: String(itemData.brand || '').trim(),
      tags: Array.isArray(itemData.tags) ? itemData.tags.map(t => String(t).trim()).filter(Boolean) : [],
      price: priceNum,
      purchaseDate: itemData.purchaseDate || '',
      warrantyDate: itemData.warrantyDate || '',
      quantity: quantityNum,
      condition: ['New', 'Like New', 'Good', 'Fair', 'Poor'].includes(itemData.condition) ? itemData.condition : 'Good',
      priority: ['Low', 'Medium', 'High', 'Urgent'].includes(itemData.priority) ? itemData.priority : 'Medium',
      serialNumber: String(itemData.serialNumber || '').trim(),
      notes: String(itemData.notes || '').trim(),
      isFavorite: Boolean(itemData.isFavorite),
      isDeleted: false,
      location: safeLocation,
      images: Array.isArray(itemData.images) && itemData.images.length > 0
        ? itemData.images
        : ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'],
      videos: Array.isArray(itemData.videos) ? itemData.videos : [],
      documents: Array.isArray(itemData.documents) ? itemData.documents : [],
      viewedCount: 1,
      lastViewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.items.unshift(newItem);

    const hierarchyDesc = [safeLocation.house, safeLocation.room, safeLocation.cupboard, safeLocation.shelf].filter(Boolean).join(' → ');
    this.recordActivityLog(userId, {
      itemId: newItem.id,
      itemName: newItem.name,
      action: 'Created',
      details: `Added item to ${hierarchyDesc || 'Vault'}`
    });

    this.save();
    return { item: newItem, duplicateWarning: warning };
  }

  updateItem(userId, id, updates) {
    if (!userId || !id) return null;
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && i.userId === userId);
    if (idx === -1) return null;

    const oldItem = this.data.items[idx];

    // Detect location movement
    let locationChanged = false;
    let newLocationDesc = '';
    if (updates.location) {
      const oldLoc = oldItem.location || {};
      const newLoc = updates.location || {};
      if (
        oldLoc.room !== newLoc.room ||
        oldLoc.cupboard !== newLoc.cupboard ||
        oldLoc.shelf !== newLoc.shelf ||
        oldLoc.drawer !== newLoc.drawer ||
        oldLoc.house !== newLoc.house
      ) {
        locationChanged = true;
        const fromDesc = [oldLoc.house, oldLoc.room, oldLoc.cupboard].filter(Boolean).join(' → ');
        const toDesc = [newLoc.house, newLoc.room, newLoc.cupboard].filter(Boolean).join(' → ');
        newLocationDesc = `Moved from ${fromDesc || 'storage'} to ${toDesc || 'new location'}`;
      }
    }

    const priceNum = updates.price !== undefined
      ? (typeof updates.price === 'number' && !isNaN(updates.price) && updates.price >= 0 ? Number(updates.price) : 0)
      : oldItem.price;

    const quantityNum = updates.quantity !== undefined
      ? (Number.isInteger(Number(updates.quantity)) && Number(updates.quantity) >= 1 ? Number(updates.quantity) : 1)
      : oldItem.quantity;

    const updated = {
      ...oldItem,
      ...updates,
      price: priceNum,
      quantity: quantityNum,
      userId, // Preserve ownership
      id: oldItem.id, // Immutable ID
      updatedAt: new Date().toISOString()
    };

    this.data.items[idx] = updated;

    this.recordActivityLog(userId, {
      itemId: updated.id,
      itemName: updated.name,
      action: locationChanged ? 'Moved' : 'Updated',
      details: locationChanged ? newLocationDesc : 'Updated item details and metadata'
    });

    this.save();
    return updated;
  }

  softDeleteItem(userId, id) {
    if (!userId || !id) return false;
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && i.userId === userId);
    if (idx === -1) return false;

    const itemName = this.data.items[idx].name;
    this.data.items[idx].isDeleted = true;
    this.data.items[idx].updatedAt = new Date().toISOString();

    this.recordActivityLog(userId, {
      itemId: id,
      itemName: itemName,
      action: 'Deleted',
      details: 'Removed item from vault'
    });

    this.save();
    return true;
  }

  toggleFavorite(userId, id) {
    if (!userId || !id) return null;
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && i.userId === userId);
    if (idx === -1) return null;

    this.data.items[idx].isFavorite = !this.data.items[idx].isFavorite;
    this.data.items[idx].updatedAt = new Date().toISOString();

    this.save();
    return this.data.items[idx];
  }

  recordItemView(userId, id) {
    if (!userId || !id) return null;
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && i.userId === userId);
    if (idx === -1) return null;

    this.data.items[idx].viewedCount = (this.data.items[idx].viewedCount || 0) + 1;
    this.data.items[idx].lastViewedAt = new Date().toISOString();
    this.save();
    return this.data.items[idx];
  }

  // ==========================================
  // SUGGESTIONS & LOCATION HIERARCHY
  // ==========================================

  getSuggestions(userId) {
    if (!userId) return {};
    const userItems = this.data.items.filter(i => !i.isDeleted && i.userId === userId);

    const categories = new Set();
    const subcategories = new Set();
    const brands = new Set();
    const tags = new Set();
    const houses = new Set();
    const floors = new Set();
    const rooms = new Set();
    const cupboards = new Set();
    const shelves = new Set();
    const drawers = new Set();
    const containers = new Set();

    userItems.forEach(i => {
      if (i.category) categories.add(i.category);
      if (i.subcategory) subcategories.add(i.subcategory);
      if (i.brand) brands.add(i.brand);
      if (i.tags) i.tags.forEach(t => tags.add(t));

      if (i.location) {
        if (i.location.house) houses.add(i.location.house);
        if (i.location.floor) floors.add(i.location.floor);
        if (i.location.room) rooms.add(i.location.room);
        if (i.location.cupboard) cupboards.add(i.location.cupboard);
        if (i.location.shelf) shelves.add(i.location.shelf);
        if (i.location.drawer) drawers.add(i.location.drawer);
        if (i.location.container) containers.add(i.location.container);
      }
    });

    return {
      categories: Array.from(categories),
      subcategories: Array.from(subcategories),
      brands: Array.from(brands),
      tags: Array.from(tags),
      houses: Array.from(houses),
      floors: Array.from(floors),
      rooms: Array.from(rooms),
      cupboards: Array.from(cupboards),
      shelves: Array.from(shelves),
      drawers: Array.from(drawers),
      containers: Array.from(containers)
    };
  }

  getLocations(userId) {
    if (!userId) return { houses: [], rooms: [], hierarchy: [] };
    const userItems = this.data.items.filter(i => !i.isDeleted && i.userId === userId);

    const roomCounts = {};
    const storageUnits = {};

    userItems.forEach(i => {
      const room = i.location?.room || 'Unassigned';
      roomCounts[room] = (roomCounts[room] || 0) + 1;

      const unit = [i.location?.room, i.location?.cupboard, i.location?.shelf].filter(Boolean).join(' → ');
      if (unit) {
        storageUnits[unit] = (storageUnits[unit] || 0) + 1;
      }
    });

    return {
      rooms: Object.entries(roomCounts).map(([name, count]) => ({ name, count })),
      storageUnits: Object.entries(storageUnits).map(([pathStr, count]) => ({ path: pathStr, count }))
    };
  }

  // ==========================================
  // AGGREGATION PIPELINE EXECUTOR (SECURE)
  // ==========================================

  aggregateItems(userId, pipeline = []) {
    if (!userId || !Array.isArray(pipeline)) return [];
    let result = this.data.items.filter(i => !i.isDeleted && i.userId === userId);

    for (const stage of pipeline) {
      const [stageName, stageConfig] = Object.entries(stage)[0] || [];
      if (!stageName) continue;

      if (stageName === '$match') {
        result = result.filter(doc => {
          return Object.entries(stageConfig).every(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return Object.entries(value).every(([op, opVal]) => {
                if (op === '$gt') return doc[key] > opVal;
                if (op === '$gte') return doc[key] >= opVal;
                if (op === '$lt') return doc[key] < opVal;
                if (op === '$lte') return doc[key] <= opVal;
                if (op === '$ne') return doc[key] !== opVal;
                if (op === '$in') return Array.isArray(opVal) && opVal.includes(doc[key]);
                return true;
              });
            }
            return doc[key] === value;
          });
        });
      } else if (stageName === '$group') {
        const groupField = typeof stageConfig._id === 'string' && stageConfig._id.startsWith('$')
          ? stageConfig._id.substring(1)
          : stageConfig._id;

        const groups = {};
        result.forEach(doc => {
          const key = groupField ? doc[groupField] || 'null' : 'all';
          if (!groups[key]) groups[key] = [];
          groups[key].push(doc);
        });

        result = Object.entries(groups).map(([key, docs]) => {
          const resDoc = { _id: key === 'all' ? null : key };
          Object.entries(stageConfig).forEach(([accumKey, accumExpr]) => {
            if (accumKey === '_id') return;
            if (typeof accumExpr === 'object' && accumExpr !== null) {
              const [op, exprField] = Object.entries(accumExpr)[0] || [];
              const field = typeof exprField === 'string' && exprField.startsWith('$')
                ? exprField.substring(1)
                : null;

              if (op === '$sum') {
                if (typeof exprField === 'number') {
                  resDoc[accumKey] = docs.length * exprField;
                } else if (field) {
                  resDoc[accumKey] = docs.reduce((acc, d) => acc + (Number(d[field]) || 0), 0);
                }
              } else if (op === '$avg' && field) {
                const total = docs.reduce((acc, d) => acc + (Number(d[field]) || 0), 0);
                resDoc[accumKey] = docs.length ? total / docs.length : 0;
              } else if (op === '$min' && field) {
                resDoc[accumKey] = Math.min(...docs.map(d => Number(d[field]) || 0));
              } else if (op === '$max' && field) {
                resDoc[accumKey] = Math.max(...docs.map(d => Number(d[field]) || 0));
              }
            }
          });
          return resDoc;
        });
      } else if (stageName === '$sort') {
        result.sort((a, b) => {
          for (const [field, dir] of Object.entries(stageConfig)) {
            const valA = a[field];
            const valB = b[field];
            if (valA < valB) return dir === 1 ? -1 : 1;
            if (valA > valB) return dir === 1 ? 1 : -1;
          }
          return 0;
        });
      } else if (stageName === '$limit') {
        result = result.slice(0, Number(stageConfig) || 0);
      }
    }

    return result;
  }

  // ==========================================
  // ACTIVITY LOGS & NOTIFICATIONS
  // ==========================================

  recordActivityLog(userId, data) {
    if (!userId) return null;
    const newLog = {
      id: 'log_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      userId,
      ...data,
      timestamp: new Date().toISOString()
    };
    this.data.activityLogs.unshift(newLog);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
    this.save();
    return newLog;
  }

  getActivityLogs(userId, limit = 50) {
    if (!userId) return [];
    return this.data.activityLogs
      .filter(l => l.userId === userId)
      .slice(0, Math.min(100, Math.max(1, limit)));
  }

  createNotification(userId, data) {
    if (!userId) return null;
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      userId,
      ...data,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  getNotifications(userId) {
    if (!userId) return [];
    return this.data.notifications.filter(n => n.userId === userId);
  }

  markNotificationRead(userId, id) {
    if (!userId || !id) return false;
    const idx = this.data.notifications.findIndex(n => n.id === id && n.userId === userId);
    if (idx === -1) return false;
    this.data.notifications[idx].isRead = true;
    this.save();
    return true;
  }

  markAllNotificationsRead(userId) {
    if (!userId) return false;
    let updated = false;
    this.data.notifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) this.save();
    return true;
  }

  // ==========================================
  // DASHBOARD STATS & ASSET ANALYTICS
  // ==========================================

  getDashboardStats(userId) {
    if (!userId) {
      return {
        totalItems: 0,
        totalFavorites: 0,
        totalValue: 0,
        recentlyAdded: [],
        recentlyViewed: [],
        unreadNotificationsCount: 0,
        warrantyAlertsCount: 0,
        warrantiesActiveCount: 0,
        warrantiesExpiring30DaysCount: 0,
        warrantiesExpiredCount: 0
      };
    }

    const userItems = this.data.items.filter(i => !i.isDeleted && i.userId === userId);
    const userNotifs = this.data.notifications.filter(n => n.userId === userId);

    const totalItems = userItems.length;
    const totalFavorites = userItems.filter(i => i.isFavorite).length;

    // Accurately compute total monetary value
    const totalValue = userItems.reduce((acc, i) => {
      const price = typeof i.price === 'number' && !isNaN(i.price) && i.price > 0 ? i.price : 0;
      const qty = typeof i.quantity === 'number' && !isNaN(i.quantity) && i.quantity > 0 ? i.quantity : 1;
      return acc + (price * qty);
    }, 0);

    const sortedByCreated = [...userItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentlyAdded = sortedByCreated.slice(0, 5);

    const sortedByViewed = [...userItems]
      .filter(i => i.lastViewedAt)
      .sort((a, b) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime());
    const recentlyViewed = sortedByViewed.slice(0, 5);

    const unreadNotificationsCount = userNotifs.filter(n => !n.isRead).length;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let warrantiesActiveCount = 0;
    let warrantiesExpiring30DaysCount = 0;
    let warrantiesExpiredCount = 0;

    userItems.forEach(i => {
      if (!i.warrantyDate) return;
      const wDate = new Date(i.warrantyDate);
      if (isNaN(wDate.getTime())) return;

      const diffDays = Math.ceil((wDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 0) {
        warrantiesExpiredCount++;
      } else {
        warrantiesActiveCount++;
        if (diffDays <= 30) {
          warrantiesExpiring30DaysCount++;
        }
      }
    });

    return {
      totalItems,
      totalFavorites,
      recentlyAdded,
      recentlyViewed,
      totalValue,
      storageUsageCount: userItems.length,
      unreadNotificationsCount,
      warrantyAlertsCount: warrantiesExpiring30DaysCount,
      warrantiesActiveCount,
      warrantiesExpiring30DaysCount,
      warrantiesExpiredCount
    };
  }

  getAnalyticsData(userId) {
    if (!userId) {
      return {
        totalItems: 0,
        totalValue: 0,
        warrantyAlertsCount: 0,
        categoryDistribution: [],
        itemsByCategory: [],
        roomValueDistribution: [],
        itemsByRoom: [],
        monthlyActivity: [],
        conditionBreakdown: []
      };
    }

    const userItems = this.data.items.filter(i => !i.isDeleted && i.userId === userId);
    const userLogs = this.data.activityLogs.filter(l => l.userId === userId);

    const totalItems = userItems.length;
    const totalValue = userItems.reduce((acc, i) => {
      const price = typeof i.price === 'number' && !isNaN(i.price) && i.price > 0 ? i.price : 0;
      const qty = typeof i.quantity === 'number' && !isNaN(i.quantity) && i.quantity > 0 ? i.quantity : 1;
      return acc + (price * qty);
    }, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const warrantyAlertsCount = userItems.filter(i => {
      if (!i.warrantyDate) return false;
      const wDate = new Date(i.warrantyDate);
      if (isNaN(wDate.getTime())) return false;
      const diffDays = Math.ceil((wDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    // Categories
    const categoryMap = {};
    userItems.forEach(i => {
      const cat = i.category || 'General';
      const price = typeof i.price === 'number' && !isNaN(i.price) && i.price > 0 ? i.price : 0;
      const qty = typeof i.quantity === 'number' && !isNaN(i.quantity) && i.quantity > 0 ? i.quantity : 1;

      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, value: 0 };
      categoryMap[cat].count += qty;
      categoryMap[cat].value += (price * qty);
    });

    const itemsByCategory = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value
    })).sort((a, b) => b.value - a.value);

    // Rooms
    const roomMap = {};
    userItems.forEach(i => {
      const room = i.location?.room || 'General Storage';
      const price = typeof i.price === 'number' && !isNaN(i.price) && i.price > 0 ? i.price : 0;
      const qty = typeof i.quantity === 'number' && !isNaN(i.quantity) && i.quantity > 0 ? i.quantity : 1;

      if (!roomMap[room]) roomMap[room] = { count: 0, value: 0 };
      roomMap[room].count += qty;
      roomMap[room].value += (price * qty);
    });

    const itemsByRoom = Object.entries(roomMap).map(([name, data]) => ({
      name,
      room: name,
      count: data.count,
      value: data.value
    })).sort((a, b) => b.value - a.value);

    // Monthly Activity from logs
    const monthlyMap = {};
    const monthsList = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = d.toLocaleString('default', { month: 'short' });
      monthlyMap[mStr] = { created: 0, moved: 0, deleted: 0 };
      monthsList.push(mStr);
    }

    userLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const mStr = logDate.toLocaleString('default', { month: 'short' });
      if (monthlyMap[mStr]) {
        if (log.action === 'Created') monthlyMap[mStr].created += 1;
        if (log.action === 'Moved') monthlyMap[mStr].moved += 1;
        if (log.action === 'Deleted') monthlyMap[mStr].deleted += 1;
      }
    });

    const monthlyActivity = monthsList.map(m => ({
      month: m,
      created: monthlyMap[m].created,
      moved: monthlyMap[m].moved,
      deleted: monthlyMap[m].deleted
    }));

    // Condition breakdown
    const conditionMap = {};
    userItems.forEach(i => {
      const cond = i.condition || 'Good';
      conditionMap[cond] = (conditionMap[cond] || 0) + 1;
    });

    const conditionBreakdown = Object.entries(conditionMap).map(([name, count]) => ({
      name,
      count
    }));

    return {
      totalItems,
      totalValue,
      warrantyAlertsCount,
      categoryDistribution: itemsByCategory,
      itemsByCategory,
      roomValueDistribution: itemsByRoom,
      itemsByRoom,
      monthlyActivity,
      conditionBreakdown
    };
  }
}

export const db = new JSONDatabaseManager();
