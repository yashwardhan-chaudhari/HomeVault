import 'dotenv/config';
import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { sanitizeFilename, validateItemInput } from './src/server/validators.js';

// =====================================
// 2.1 FIX JWT SECRET HANDLING
// =====================================
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

// Rate limiting for sensitive authentication endpoints (in-memory)
const loginAttemptMap = new Map();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const isRateLimited = (key) => {
  const record = loginAttemptMap.get(key);
  if (!record) return false;
  if (Date.now() - record.startTime > RATE_LIMIT_WINDOW_MS) {
    loginAttemptMap.delete(key);
    return false;
  }
  return record.attempts >= RATE_LIMIT_MAX_ATTEMPTS;
};

const recordFailedAttempt = (key) => {
  const now = Date.now();
  const record = loginAttemptMap.get(key);
  if (!record || (now - record.startTime > RATE_LIMIT_WINDOW_MS)) {
    loginAttemptMap.set(key, { attempts: 1, startTime: now });
  } else {
    record.attempts += 1;
  }
};

const clearFailedAttempts = (key) => {
  loginAttemptMap.delete(key);
};

// =====================================
// 2.2 FIX AUTHENTICATION MIDDLEWARE
// =====================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, error: 'Malformed authentication token' });
    }

    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authenticated account no longer exists' });
    }

    req.userId = user.id;
    req.user = user;
    next();
  });
};

// Input and file validators imported from ./src/server/validators.js

async function startServer() {
  const app = express();

  // =====================================
  // 2.8 SECURITY HEADERS & CORS
  // =====================================
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS configuration
    const allowedOrigins = [
      process.env.APP_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // =====================================
  // HEALTH CHECK
  // =====================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'HomeVault Inventory API'
    });
  });

  // =====================================
  // AUTH API ENDPOINTS
  // =====================================

  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const emailStr = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      if (fullName.trim().length < 2 || fullName.trim().length > 50) {
        return res.status(400).json({ error: 'Full name must be between 2 and 50 characters' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain at least one letter and one number' });
      }

      const existing = db.getUserByEmail(emailStr);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = db.createUser({ email: emailStr, passwordHash, fullName });
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: newUser,
        token
      });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed due to a server error' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitKey = `${clientIp}_${String(email).trim().toLowerCase()}`;

      if (isRateLimited(rateLimitKey)) {
        return res.status(429).json({
          error: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
        });
      }

      const userWithPass = db.getUserByEmail(String(email).trim().toLowerCase());
      if (!userWithPass) {
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = bcrypt.compareSync(password, userWithPass.passwordHash || '');
      if (!isMatch) {
        recordFailedAttempt(rateLimitKey);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      clearFailedAttempts(rateLimitKey);

      const token = jwt.sign({ userId: userWithPass.id }, JWT_SECRET, { expiresIn: '7d' });
      const safeUser = db.getUserById(userWithPass.id);

      res.json({
        user: safeUser,
        token
      });
    } catch (err) {
      res.status(500).json({ error: 'Login failed due to a server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
      const user = db.getUserById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  });

  app.put('/api/auth/profile', authenticateToken, (req, res) => {
    try {
      const { fullName, avatarUrl, themePreference, notificationPrefs } = req.body;
      const updatedUser = db.updateUser(req.userId, { fullName, avatarUrl, themePreference, notificationPrefs });
      res.json({ user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
  });

  app.put('/api/auth/password', authenticateToken, (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current password and new password are required' });
      }

      if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return res.status(400).json({ error: 'New password must be at least 8 characters with letters and numbers' });
      }

      const fullUser = db.data.users.find(u => u.id === req.userId);
      if (!fullUser || !bcrypt.compareSync(oldPassword, fullUser.passwordHash || '')) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      db.updatePassword(req.userId, newHash);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // 2.4 SECURE PASSWORD RESET FLOW
  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email address is required' });
      }

      const result = db.createPasswordResetToken(email.trim().toLowerCase());

      // Safe uniform response preventing email enumeration
      res.json({
        success: true,
        message: 'If an account exists with this email, instructions have been generated.',
        ...(process.env.NODE_ENV !== 'production' && result ? { devResetToken: result.token } : {})
      });
    } catch (err) {
      res.status(500).json({ error: 'Password reset request failed' });
    }
  });

  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Reset token and new password are required' });
      }

      if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return res.status(400).json({ error: 'New password must be at least 8 characters with letters and numbers' });
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      const outcome = db.validateAndConsumePasswordResetToken(token, newHash);

      if (!outcome.success) {
        return res.status(400).json({ error: outcome.error });
      }

      res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  app.delete('/api/auth/delete-account', authenticateToken, (req, res) => {
    try {
      db.deleteUser(req.userId);
      res.json({ success: true, message: 'Account and associated vault items deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // =====================================
  // ITEMS API ENDPOINTS (STRICT AUTHORIZATION)
  // =====================================

  app.get('/api/items', authenticateToken, (req, res) => {
    try {
      const {
        search, category, subcategory, brand, room, house,
        condition, priority, isFavorite, tag, warrantyStatus,
        sortBy, sortOrder, page, limit
      } = req.query;

      const result = db.getItems(req.userId, {
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
        warrantyStatus,
        sortBy,
        sortOrder,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 24
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to fetch items' });
    }
  });

  app.get('/api/items/:id', authenticateToken, (req, res) => {
    try {
      const item = db.getItemById(req.userId, req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found in your vault' });
      }
      const updatedItem = db.recordItemView(req.userId, req.params.id) || item;
      res.json({ item: updatedItem });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch item details' });
    }
  });

  app.post('/api/items', authenticateToken, (req, res) => {
    try {
      const validationErrors = validateItemInput(req.body, false);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: validationErrors.join(', ') });
      }

      const { item: newItem, duplicateWarning } = db.createItem(req.userId, req.body);
      res.status(201).json({
        item: newItem,
        warning: duplicateWarning || undefined,
        duplicateWarning: duplicateWarning || undefined
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to create item' });
    }
  });

  app.put('/api/items/:id', authenticateToken, (req, res) => {
    try {
      const validationErrors = validateItemInput(req.body, true);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: validationErrors.join(', ') });
      }

      const updated = db.updateItem(req.userId, req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found in your vault' });
      }
      res.json({ item: updated });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to update item' });
    }
  });

  app.delete('/api/items/:id', authenticateToken, (req, res) => {
    try {
      const success = db.softDeleteItem(req.userId, req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Item not found in your vault' });
      }
      res.json({ success: true, message: 'Item deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  });

  app.patch('/api/items/:id/favorite', authenticateToken, (req, res) => {
    try {
      const updated = db.toggleFavorite(req.userId, req.params.id);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found in your vault' });
      }
      res.json({ item: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to toggle favorite status' });
    }
  });

  // =====================================
  // AUTOCOMPLETE SUGGESTIONS & LOCATIONS
  // =====================================

  app.get('/api/suggestions', authenticateToken, (req, res) => {
    try {
      const suggestions = db.getSuggestions(req.userId);
      res.json(suggestions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  });

  app.get('/api/locations', authenticateToken, (req, res) => {
    try {
      const locations = db.getLocations(req.userId);
      res.json(locations);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch location hierarchy' });
    }
  });

  // =====================================
  // DASHBOARD & ANALYTICS ENDPOINTS
  // =====================================

  app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    try {
      const stats = db.getDashboardStats(req.userId);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to calculate dashboard statistics' });
    }
  });

  app.get('/api/analytics', authenticateToken, (req, res) => {
    try {
      const analytics = db.getAnalyticsData(req.userId);
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: 'Failed to calculate inventory analytics' });
    }
  });

  app.post('/api/analytics/aggregate', authenticateToken, (req, res) => {
    try {
      const { pipeline } = req.body;
      const aggregatedResult = db.aggregateItems(req.userId, pipeline || []);
      res.json({ result: aggregatedResult });
    } catch (err) {
      res.status(500).json({ error: 'Aggregation pipeline execution failed' });
    }
  });

  app.get('/api/activity-logs', authenticateToken, (req, res) => {
    try {
      const logs = db.getActivityLogs(req.userId);
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  });

  app.get('/api/notifications', authenticateToken, (req, res) => {
    try {
      const notifications = db.getNotifications(req.userId);
      res.json({ notifications });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
    try {
      const success = db.markNotificationRead(req.userId, req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  app.patch('/api/notifications/read-all', authenticateToken, (req, res) => {
    try {
      db.markAllNotificationsRead(req.userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark notifications read' });
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

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ success: false, error: 'An unexpected internal error occurred' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HomeVault] Server listening on http://0.0.0.0:${PORT} (PID ${process.pid})`);
  });
}

startServer();
