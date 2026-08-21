import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ─── SECURITY MIDDLEWARE ─────────────────────────────────────────────────────

// 1. Helmet — comprehensive HTTP security headers
//    Sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
//    Referrer-Policy, CSP, and more
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
          },
        }
      : false, // Disable CSP in dev to avoid blocking Vite HMR
    crossOriginEmbedderPolicy: false, // Allow Google Fonts
  })
);

// 2. CORS — lock down to application origin only
const allowedOrigins = isProduction
  ? [process.env.APP_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3005', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// 3. Body size limit — prevent denial-of-service via oversized payloads
app.use(express.json({ limit: '100kb' }));

// 4. Rate limiting — auth endpoints (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again after 15 minutes.' },
});

// 4b. Rate limiting — general API (moderate)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// ─── DATABASE INIT ───────────────────────────────────────────────────────────

initDb();

// ─── AUTH HELPERS ────────────────────────────────────────────────────────────

const SESSION_DURATION_HOURS = 24;

/**
 * Generate a cryptographically secure session token and persist to DB.
 */
function createSession(userId) {
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  db.prepare(`
    INSERT INTO sessions (token, userId, createdAt, expiresAt)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, now.toISOString(), expiresAt.toISOString());

  return { token, expiresAt: expiresAt.toISOString() };
}

/**
 * Generate a random 4-digit OTP and store in DB with 5-minute expiry.
 */
function generateOtp(phone, purpose = 'login') {
  // Invalidate any existing OTPs for this phone+purpose
  db.prepare("UPDATE otps SET used = 1 WHERE phone = ? AND purpose = ? AND used = 0").run(phone, purpose);

  const code = String(Math.floor(1000 + Math.random() * 9000));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

  db.prepare(`
    INSERT INTO otps (phone, code, purpose, createdAt, expiresAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(phone, code, purpose, now.toISOString(), expiresAt.toISOString());

  return code;
}

/**
 * Verify an OTP — checks code, expiry, and marks as used.
 * Returns true if valid, false otherwise.
 */
function verifyOtp(phone, code, purpose = 'login') {
  const otp = db.prepare(`
    SELECT * FROM otps 
    WHERE phone = ? AND code = ? AND purpose = ? AND used = 0 AND expiresAt > datetime('now')
    ORDER BY createdAt DESC LIMIT 1
  `).get(phone, code, purpose);

  if (!otp) return false;

  // Mark as used so it can't be replayed
  db.prepare("UPDATE otps SET used = 1 WHERE id = ?").run(otp.id);
  return true;
}

/**
 * Authentication middleware — validates Bearer token from Authorization header.
 * Attaches `req.user` on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice(7);
  const session = db.prepare(`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.userId = u.id
    WHERE s.token = ? AND s.expiresAt > datetime('now')
  `).get(token);

  if (!session) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  // Attach user info to request (excluding session fields)
  req.user = {
    id: session.userId,
    name: session.name,
    phone: session.phone,
    flatNumber: session.flatNumber,
    block: session.block,
    role: session.role,
  };
  req.sessionToken = token;
  next();
}

// ─── SEED DATABASE ───────────────────────────────────────────────────────────

const seedDatabase = () => {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (usersCount.count === 0) {
    console.log('Seeding initial data (demo users)...');

    db.prepare(`
      INSERT INTO users (id, name, phone, flatNumber, block, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr-demo-res', 'Rajendran N.', '9876543210', 'B-402', 'Block B', 'resident');

    db.prepare(`
      INSERT INTO users (id, name, phone, flatNumber, block, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr-demo-com', 'Committee Admin', '1234567890', 'Office', 'Clubhouse', 'committee');
  }
};

seedDatabase();

// ─── AUTH ROUTES (public — rate-limited) ─────────────────────────────────────

// Step 1: Send OTP to a phone number
app.post('/api/auth/send-otp', (req, res) => {
  const { phone, purpose } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Valid phone number is required.' });
  }

  const validPurpose = purpose === 'register' ? 'register' : 'login';

  // For login, verify the user exists first
  if (validPurpose === 'login') {
    const user = db.prepare('SELECT id, name, flatNumber, block, role FROM users WHERE phone = ?').get(phone);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this number.' });
    }
  }

  try {
    const code = generateOtp(phone, validPurpose);

    // In demo mode, log the OTP to console (in production, send via SMS)
    console.log(`[OTP] Code for ${phone} (${validPurpose}): ${code}`);

    res.json({
      success: true,
      message: 'OTP sent successfully.',
      // Only include demo code in non-production for development convenience
      ...(isProduction ? {} : { demoCode: code }),
    });
  } catch (error) {
    console.error('[Auth Error] send-otp:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Step 2a: Verify OTP and login
app.post('/api/auth/login', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required.' });
  }

  try {
    // Verify OTP
    if (!verifyOtp(phone, otp, 'login')) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Look up user
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Create session
    const session = createSession(user.id);

    res.json({
      user,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('[Auth Error] login:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Step 2b: Verify OTP and register
app.post('/api/auth/register', (req, res) => {
  const { id, name, phone, flatNumber, block, role, otp } = req.body;

  if (!name || !phone || !flatNumber || !block || !role || !otp) {
    return res.status(400).json({ error: 'All fields and OTP are required.' });
  }

  try {
    // Verify OTP
    if (!verifyOtp(phone, otp, 'register')) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Create user
    const stmt = db.prepare(`
      INSERT INTO users (id, name, phone, flatNumber, block, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, phone, flatNumber, block, role);

    const user = { id, name, phone, flatNumber, block, role };

    // Create session
    const session = createSession(id);

    res.status(201).json({
      user,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Phone number already registered.' });
    }
    console.error('[Auth Error] register:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Lookup user by phone (for login preview) — rate-limited, returns minimal info
app.post('/api/auth/lookup', (req, res) => {
  const { phone } = req.body;
  try {
    const user = db.prepare('SELECT id, name, flatNumber, block, role FROM users WHERE phone = ?').get(phone);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error('[Auth Error] lookup:', error);
    res.status(500).json({ error: 'Lookup failed.' });
  }
});

// Logout — invalidate session
app.post('/api/auth/logout', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.sessionToken);
    res.json({ success: true });
  } catch (error) {
    console.error('[Auth Error] logout:', error);
    res.status(500).json({ error: 'Logout failed.' });
  }
});

// Session validation — check if current token is still valid
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// ─── PROTECTED ROUTES (require auth) ─────────────────────────────────────────

// Update own user profile
app.put('/api/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // Users can only update their own profile
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'You can only update your own profile.' });
  }

  const { role } = req.body;
  try {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    stmt.run(role, id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json(user);
  } catch (error) {
    console.error('[Users Error] update:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// --- Complaints Routes (all protected) ---
app.get('/api/complaints', requireAuth, (req, res) => {
  try {
    const complaints = db.prepare('SELECT * FROM complaints ORDER BY reportedAt DESC').all();

    const populatedComplaints = complaints.map(c => {
      const timeline = db.prepare('SELECT * FROM timeline_events WHERE complaint_id = ?').all(c.id);

      const feedback = c.feedbackIsResolved !== null ? {
        isResolved: c.feedbackIsResolved === 1,
        rating: c.feedbackRating,
        comments: c.feedbackComments,
        submittedAt: c.feedbackSubmittedAt
      } : null;

      delete c.feedbackIsResolved;
      delete c.feedbackRating;
      delete c.feedbackComments;
      delete c.feedbackSubmittedAt;

      return {
        ...c,
        timeline,
        feedback
      };
    });

    res.json(populatedComplaints);
  } catch (error) {
    console.error('[Complaints Error] list:', error);
    res.status(500).json({ error: 'Failed to load complaints.' });
  }
});

app.post('/api/complaints', requireAuth, (req, res) => {
  const { id, customId, title, titleTa, description, descriptionTa, category, categoryLabel, categoryLabelTa, reportedBy, reportedAt, status, timeline } = req.body;

  const insertComplaint = db.transaction(() => {
    db.prepare(`
      INSERT INTO complaints (id, customId, title, titleTa, description, descriptionTa, category, categoryLabel, categoryLabelTa, reportedBy, reportedAt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, customId, title, titleTa, description, descriptionTa, category, categoryLabel, categoryLabelTa, reportedBy, reportedAt, status);

    if (timeline && timeline.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO timeline_events (id, complaint_id, senderType, senderName, senderNameTa, timestamp, text, textTa, photoUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const event of timeline) {
        stmt.run(event.id, id, event.senderType, event.senderName, event.senderNameTa, event.timestamp, event.text, event.textTa, event.photoUrl);
      }
    }
  });

  try {
    insertComplaint();
    res.status(201).json(req.body);
  } catch (error) {
    console.error('[Complaints Error] create:', error);
    res.status(500).json({ error: 'Failed to create complaint.' });
  }
});

app.put('/api/complaints/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status, feedback, timeline } = req.body;

  const updateComplaint = db.transaction(() => {
    if (feedback) {
      db.prepare(`
        UPDATE complaints 
        SET status = ?, feedbackIsResolved = ?, feedbackRating = ?, feedbackComments = ?, feedbackSubmittedAt = ?
        WHERE id = ?
      `).run(status, feedback.isResolved ? 1 : 0, feedback.rating, feedback.comments, feedback.submittedAt, id);
    } else {
      db.prepare('UPDATE complaints SET status = ? WHERE id = ?').run(status, id);
    }

    db.prepare('DELETE FROM timeline_events WHERE complaint_id = ?').run(id);

    if (timeline && timeline.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO timeline_events (id, complaint_id, senderType, senderName, senderNameTa, timestamp, text, textTa, photoUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const event of timeline) {
        stmt.run(event.id, id, event.senderType, event.senderName, event.senderNameTa, event.timestamp, event.text, event.textTa, event.photoUrl);
      }
    }
  });

  try {
    updateComplaint();
    res.json(req.body);
  } catch (error) {
    console.error('[Complaints Error] update:', error);
    res.status(500).json({ error: 'Failed to update complaint.' });
  }
});

// --- Notices Routes (all protected) ---
app.get('/api/notices', requireAuth, (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
    const formattedNotices = notices.map(n => ({
      ...n,
      isImportant: n.isImportant === 1
    }));
    res.json(formattedNotices);
  } catch (error) {
    console.error('[Notices Error] list:', error);
    res.status(500).json({ error: 'Failed to load notices.' });
  }
});

app.post('/api/notices', requireAuth, (req, res) => {
  const { id, title, titleTa, content, contentTa, date, type, isImportant } = req.body;
  try {
    db.prepare(`
      INSERT INTO notices (id, title, titleTa, content, contentTa, date, type, isImportant)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, titleTa, content, contentTa, date, type, isImportant ? 1 : 0);
    res.status(201).json(req.body);
  } catch (error) {
    console.error('[Notices Error] create:', error);
    res.status(500).json({ error: 'Failed to create notice.' });
  }
});

// ─── STATIC FILES (production) ───────────────────────────────────────────────

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Catch-all route to serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ─── START SERVER ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
