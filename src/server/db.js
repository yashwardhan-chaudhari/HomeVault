import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'homevault_db.json');

// Initial seed data if DB file doesn't exist
const getInitialSeedData = () => {
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const adminId = 'user_demo_001';

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
    id: 'user_demo_002',
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

  const sampleItems = [];
  const initialLogs = [];
  const initialNotifs = [];

  return {
    users: [
      { ...defaultUser, passwordHash: defaultPasswordHash },
      { ...demoAppUser, passwordHash: defaultPasswordHash }
    ],
    items: sampleItems,
    activityLogs: initialLogs,
    notifications: initialNotifs
  };
};

class JSONDatabaseManager {
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
        
        // Ensure demo user exists
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
        // Remove initial demo seed items if they exist
        const defaultSeedItemIds = ['item_001', 'item_002', 'item_003'];
        dbData.items = (dbData.items || []).filter(i => !defaultSeedItemIds.includes(i.id));
        dbData.activityLogs = (dbData.activityLogs || []).filter(l => !defaultSeedItemIds.includes(l.itemId) && l.id !== 'log_1' && l.id !== 'log_2');
        dbData.notifications = (dbData.notifications || []).filter(n => !defaultSeedItemIds.includes(n.itemId) && n.id !== 'notif_1');
        
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

  saveData(dataToSave) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving JSON DB:', e);
    }
  }

  save() {
    this.saveData(this.data);
  }

  // Users
  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  createUser(userData) {
    const newUser = {
      id: 'user_' + Date.now(),
      email: userData.email,
      fullName: userData.fullName,
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

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
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
    this.save();
    return true;
  }

  // Items
  getItems(userId, options = {}) {
    let result = this.data.items.filter(i => !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));

    const {
      search, category, subcategory, brand, room, house,
      condition, priority, isFavorite, tag, sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 24
    } = options;

    if (search) {
      const q = search.toLowerCase();
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

    if (category) result = result.filter(i => i.category === category);
    if (subcategory) result = result.filter(i => i.subcategory === subcategory);
    if (brand) result = result.filter(i => i.brand === brand);
    if (room) result = result.filter(i => i.location && i.location.room === room);
    if (house) result = result.filter(i => i.location && i.location.house === house);
    if (condition) result = result.filter(i => i.condition === condition);
    if (priority) result = result.filter(i => i.priority === priority);
    if (isFavorite) result = result.filter(i => i.isFavorite === true);
    if (tag) result = result.filter(i => i.tags && i.tags.includes(tag));

    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'warrantyDate') {
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
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginatedItems = result.slice(startIdx, startIdx + limit);

    return {
      items: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  getItemById(userId, id) {
    return this.data.items.find(i => String(i.id) === String(id) && !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId)) || null;
  }

  createItem(userId, itemData) {
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      userId,
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category || 'General',
      subcategory: itemData.subcategory || '',
      brand: itemData.brand || '',
      tags: itemData.tags || [],
      price: itemData.price ? Number(itemData.price) : 0,
      purchaseDate: itemData.purchaseDate || '',
      warrantyDate: itemData.warrantyDate || '',
      quantity: itemData.quantity ? Number(itemData.quantity) : 1,
      condition: itemData.condition || 'New',
      priority: itemData.priority || 'Medium',
      serialNumber: itemData.serialNumber || '',
      notes: itemData.notes || '',
      isFavorite: Boolean(itemData.isFavorite),
      isDeleted: false,
      location: itemData.location || {
        house: 'Main Residence',
        floor: '1st Floor',
        room: 'General Storage',
        cupboard: '',
        shelf: '',
        drawer: '',
        container: '',
        exactPosition: ''
      },
      images: itemData.images || ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'],
      videos: itemData.videos || [],
      documents: itemData.documents || [],
      viewedCount: 1,
      lastViewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.items.unshift(newItem);
    this.recordActivityLog(userId, {
      itemId: newItem.id,
      itemName: newItem.name,
      action: 'Created',
      details: `Added item to ${newItem.location.room || 'Storage'}`
    });

    this.save();
    return newItem;
  }

  updateItem(userId, id, updates) {
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));
    if (idx === -1) return null;

    const oldItem = this.data.items[idx];
    const updated = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.items[idx] = updated;

    this.recordActivityLog(userId, {
      itemId: updated.id,
      itemName: updated.name,
      action: 'Updated',
      details: `Updated item details and location`
    });

    this.save();
    return updated;
  }

  softDeleteItem(userId, id) {
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));
    if (idx === -1) return false;

    const itemName = this.data.items[idx].name;
    this.data.items.splice(idx, 1);

    this.recordActivityLog(userId, {
      itemId: id,
      itemName: itemName,
      action: 'Deleted',
      details: `Removed item from vault`
    });

    this.save();
    return true;
  }

  toggleFavorite(userId, id) {
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));
    if (idx === -1) return null;

    this.data.items[idx].isFavorite = !this.data.items[idx].isFavorite;
    this.data.items[idx].updatedAt = new Date().toISOString();

    this.save();
    return this.data.items[idx];
  }

  recordItemView(userId, id) {
    const idx = this.data.items.findIndex(i => String(i.id) === String(id) && !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));
    if (idx === -1) return null;

    this.data.items[idx].viewedCount = (this.data.items[idx].viewedCount || 0) + 1;
    this.data.items[idx].lastViewedAt = new Date().toISOString();
    this.save();
    return this.data.items[idx];
  }

  // Suggestions for Autocomplete
  getSuggestions(userId) {
    const userItems = this.data.items.filter(i => !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));

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

  /**
   * @concept Aggregation pipelines
   * @description NoSQL Mongo-style multi-stage aggregation pipeline executor
   */
  aggregateItems(userId, pipeline = []) {
    const userItems = this.getItems(userId);
    let result = JSON.parse(JSON.stringify(userItems));

    for (const stage of pipeline) {
      const [stageName, stageConfig] = Object.entries(stage)[0] || [];

      if (stageName === '$match') {
        result = result.filter(doc => {
          return Object.entries(stageConfig).every(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              if (value.$gt !== undefined && !(doc[key] > value.$gt)) return false;
              if (value.$gte !== undefined && !(doc[key] >= value.$gte)) return false;
              if (value.$lt !== undefined && !(doc[key] < value.$lt)) return false;
              if (value.$lte !== undefined && !(doc[key] <= value.$lte)) return false;
              if (value.$ne !== undefined && doc[key] === value.$ne) return false;
              if (value.$in !== undefined && !value.$in.includes(doc[key])) return false;
              return true;
            }
            return doc[key] === value;
          });
        });
      } else if (stageName === '$group') {
        const idField = stageConfig._id;
        const groups = new Map();

        result.forEach(doc => {
          const groupKey = typeof idField === 'string' && idField.startsWith('$')
            ? doc[idField.substring(1)]
            : idField;

          if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
          }
          groups.get(groupKey).push(doc);
        });

        result = Array.from(groups.entries()).map(([key, groupDocs]) => {
          const groupedDoc = { _id: key };
          Object.entries(stageConfig).forEach(([field, expr]) => {
            if (field === '_id') return;

            if (expr.$sum !== undefined) {
              if (typeof expr.$sum === 'number') {
                groupedDoc[field] = groupDocs.length * expr.$sum;
              } else if (typeof expr.$sum === 'string' && expr.$sum.startsWith('$')) {
                const targetKey = expr.$sum.substring(1);
                groupedDoc[field] = groupDocs.reduce((acc, d) => acc + (Number(d[targetKey]) || 0), 0);
              }
            } else if (expr.$avg !== undefined && typeof expr.$avg === 'string' && expr.$avg.startsWith('$')) {
              const targetKey = expr.$avg.substring(1);
              const sum = groupDocs.reduce((acc, d) => acc + (Number(d[targetKey]) || 0), 0);
              groupedDoc[field] = groupDocs.length ? Math.round(sum / groupDocs.length) : 0;
            } else if (expr.$count !== undefined) {
              groupedDoc[field] = groupDocs.length;
            }
          });
          return groupedDoc;
        });
      } else if (stageName === '$sort') {
        result.sort((a, b) => {
          for (const [key, direction] of Object.entries(stageConfig)) {
            const dir = direction === -1 || direction === 'desc' ? -1 : 1;
            if (a[key] < b[key]) return -1 * dir;
            if (a[key] > b[key]) return 1 * dir;
          }
          return 0;
        });
      } else if (stageName === '$project') {
        result = result.map(doc => {
          const projected = {};
          Object.entries(stageConfig).forEach(([field, include]) => {
            if (include === 1 || include === true) {
              projected[field] = doc[field];
            } else if (typeof include === 'string' && include.startsWith('$')) {
              projected[field] = doc[include.substring(1)];
            }
          });
          return projected;
        });
      }
    }

    return result;
  }

  // Activity Logs
  recordActivityLog(userId, data) {
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
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
    return this.data.activityLogs
      .filter(l => l.userId === userId || l.userId === 'user_demo_001' || userId === 'user_demo_001' || !l.userId)
      .slice(0, limit);
  }

  // Notifications
  createNotification(userId, data) {
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
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
    return this.data.notifications.filter(n => n.userId === userId || n.userId === 'user_demo_001' || userId === 'user_demo_001' || !n.userId);
  }

  markNotificationRead(userId, id) {
    const idx = this.data.notifications.findIndex(n => n.id === id && (n.userId === userId || n.userId === 'user_demo_001' || userId === 'user_demo_001' || !n.userId));
    if (idx === -1) return false;
    this.data.notifications[idx].isRead = true;
    this.save();
    return true;
  }

  markAllNotificationsRead(userId) {
    let updated = false;
    this.data.notifications.forEach(n => {
      if ((n.userId === userId || n.userId === 'user_demo_001' || userId === 'user_demo_001' || !n.userId) && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) this.save();
    return true;
  }

  // Dashboard Stats
  getDashboardStats(userId) {
    const userItems = this.data.items.filter(i => !i.isDeleted && (i.userId === userId || i.userId === 'user_demo_001' || userId === 'user_demo_001' || !i.userId));
    const userNotifs = this.data.notifications.filter(n => n.userId === userId || n.userId === 'user_demo_001' || userId === 'user_demo_001' || !n.userId);

    const totalItems = userItems.length;
    const totalFavorites = userItems.filter(i => i.isFavorite).length;
    const totalValue = userItems.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0);

    const sortedByCreated = [...userItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentlyAdded = sortedByCreated.slice(0, 5);

    const sortedByViewed = [...userItems]
      .filter(i => i.lastViewedAt)
      .sort((a, b) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime());
    const recentlyViewed = sortedByViewed.slice(0, 5);

    const unreadNotificationsCount = userNotifs.filter(n => !n.isRead).length;

    const now = new Date();
    const warrantyAlertsCount = userItems.filter(i => {
      if (!i.warrantyDate) return false;
      const wDate = new Date(i.warrantyDate);
      const diffDays = Math.ceil((wDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diffDays >= 0 && diffDays <= 60;
    }).length;

    return {
      totalItems,
      totalFavorites,
      recentlyAdded,
      recentlyViewed,
      totalValue,
      storageUsageCount: userItems.length,
      unreadNotificationsCount,
      warrantyAlertsCount
    };
  }

  // Analytics Breakdown
  getAnalyticsData(userId) {
    const userItems = this.data.items.filter(i => i.userId === userId && !i.isDeleted);
    const userLogs = this.data.activityLogs.filter(l => l.userId === userId);

    const categoryMap = {};
    userItems.forEach(i => {
      const cat = i.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, value: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].value += (i.price || 0) * (i.quantity || 1);
    });

    const itemsByCategory = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value
    })).sort((a, b) => b.count - a.count);

    const roomMap = {};
    userItems.forEach(i => {
      const room = i.location?.room || 'Unassigned';
      roomMap[room] = (roomMap[room] || 0) + 1;
    });

    const itemsByRoom = Object.entries(roomMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

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
      itemsByCategory,
      itemsByRoom,
      monthlyActivity,
      conditionBreakdown
    };
  }
}

export const db = new JSONDatabaseManager();
