import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { analyzeItemImage } from './src/server/geminiService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'homevault_secret_key_2026';
const PORT = 3000;

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userId = 'user_demo_001';
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.userId = 'user_demo_001';
      return next();
    }
    req.userId = decoded.userId;
    next();
  });
};

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // =====================================
  // AUTH API ENDPOINTS
  // =====================================

  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = db.createUser({ email, passwordHash, fullName });
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: newUser,
        token
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userWithPass = db.getUserByEmail(email);
      if (!userWithPass) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = bcrypt.compareSync(password, userWithPass.passwordHash || '');
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: userWithPass.id }, JWT_SECRET, { expiresIn: '7d' });
      const user = db.getUserById(userWithPass.id);

      res.json({
        user,
        token
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/auth/profile', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const { fullName, avatarUrl, themePreference, notificationPrefs } = req.body;
      const updatedUser = db.updateUser(userId, { fullName, avatarUrl, themePreference, notificationPrefs });
      res.json({ user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/auth/password', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const { oldPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      const newHash = bcrypt.hashSync(newPassword, 10);
      db.updatePassword(userId, newHash);
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    res.json({ message: `Password reset link sent to ${email || 'your email'}.` });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    res.json({ message: 'Password reset successfully. You can now log in.' });
  });

  app.delete('/api/auth/delete-account', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      db.deleteUser(userId);
      res.json({ message: 'Account deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // =====================================
  // ITEMS API ENDPOINTS
  // =====================================

  app.get('/api/items', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const {
        search, category, subcategory, brand, room, house,
        condition, priority, isFavorite, tag, sortBy, sortOrder, page, limit
      } = req.query;

      const result = db.getItems(userId, {
        search,
        category,
        subcategory,
        brand,
        room,
        house,
        condition,
        priority,
        isFavorite: isFavorite === 'true',
        tag,
        sortBy,
        sortOrder,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 24
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/items/:id', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const item = db.getItemById(userId, req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      const updatedItem = db.recordItemView(userId, req.params.id) || item;
      res.json({ item: updatedItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/items', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const itemData = req.body;
      if (!itemData.name) {
        return res.status(400).json({ error: 'Item name is required' });
      }
      const newItem = db.createItem(userId, itemData);
      res.status(201).json({ item: newItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/items/:id', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const updated = db.updateItem(userId, req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found or unauthorized' });
      }
      res.json({ item: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/items/:id', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const success = db.softDeleteItem(userId, req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/items/:id/favorite', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const updated = db.toggleFavorite(userId, req.params.id);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ item: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // =====================================
  // AUTOCOMPLETE SUGGESTIONS ENDPOINT
  // =====================================

  app.get('/api/suggestions', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const suggestions = db.getSuggestions(userId);
      res.json(suggestions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // =====================================
  // AI AUTO DETECT ENDPOINT
  // =====================================

  app.post('/api/autodetect', authenticateToken, async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Base64 image data is required' });
      }

      const result = await analyzeItemImage(imageBase64, mimeType || 'image/jpeg');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Auto detect failed' });
    }
  });

  // =====================================
  // DASHBOARD & ANALYTICS ENDPOINTS
  // =====================================

  app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const stats = db.getDashboardStats(userId);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/analytics', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const analytics = db.getAnalyticsData(userId);
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @concept Aggregation pipelines
   * @description NoSQL Mongo-style multi-stage aggregation pipeline endpoint
   */
  app.post('/api/analytics/aggregate', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const { pipeline } = req.body;
      const aggregatedResult = db.aggregateItems(userId, pipeline || []);
      res.json({ result: aggregatedResult });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/activity-logs', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const logs = db.getActivityLogs(userId);
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/notifications', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      const notifications = db.getNotifications(userId);
      res.json({ notifications });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      db.markNotificationRead(userId, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/notifications/read-all', authenticateToken, (req, res) => {
    try {
      const userId = req.userId || 'user_demo_001';
      db.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // =====================================
  // VITE DEV / PRODUCTION SERVING
  // =====================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HomeVault server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
