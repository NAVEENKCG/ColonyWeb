import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the database schema
initDb();

// Seed Database Helper
const seedDatabase = () => {
  // Check if users exist
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (usersCount.count === 0) {
    console.log('Seeding initial data (demo users)...');
    
    // Create demo resident
    db.prepare(`
      INSERT INTO users (id, name, phone, flatNumber, block, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr-demo-res', 'Rajendran N.', '9876543210', 'B-402', 'Block B', 'resident');

    // Create demo committee
    db.prepare(`
      INSERT INTO users (id, name, phone, flatNumber, block, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr-demo-com', 'Committee Admin', '1234567890', 'Office', 'Clubhouse', 'committee');
  }

  // Check if complaints exist
  const complaintsCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  if (complaintsCount.count === 0) {
    console.log('Seeding initial data (complaints and notices)...');
    
    // We will leave complaints and notices empty or let users create them for a clean slate
  }
};

seedDatabase();

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const { id, name, phone, flatNumber, block, role } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, phone, flatNumber, block, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, phone, flatNumber, block, role);
    res.status(201).json(req.body);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Phone number already registered' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/auth/login', (req, res) => {
  const { phone } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // usually just switching roles in this app
  try {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    stmt.run(role, id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Complaints Routes ---
app.get('/api/complaints', (req, res) => {
  try {
    const complaints = db.prepare('SELECT * FROM complaints ORDER BY reportedAt DESC').all();
    
    // Fetch timeline events for each complaint
    const populatedComplaints = complaints.map(c => {
      const timeline = db.prepare('SELECT * FROM timeline_events WHERE complaint_id = ?').all(c.id);
      
      const feedback = c.feedbackIsResolved !== null ? {
        isResolved: c.feedbackIsResolved === 1,
        rating: c.feedbackRating,
        comments: c.feedbackComments,
        submittedAt: c.feedbackSubmittedAt
      } : null;

      // Clean up properties before sending
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
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/complaints', (req, res) => {
  const { id, customId, title, titleTa, description, descriptionTa, category, categoryLabel, categoryLabelTa, reportedBy, reportedAt, status, timeline } = req.body;
  
  const insertComplaint = db.transaction(() => {
    // Insert main complaint
    db.prepare(`
      INSERT INTO complaints (id, customId, title, titleTa, description, descriptionTa, category, categoryLabel, categoryLabelTa, reportedBy, reportedAt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, customId, title, titleTa, description, descriptionTa, category, categoryLabel, categoryLabelTa, reportedBy, reportedAt, status);

    // Insert timeline events
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
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status, feedback, timeline } = req.body;

  const updateComplaint = db.transaction(() => {
    // Update main complaint
    if (feedback) {
      db.prepare(`
        UPDATE complaints 
        SET status = ?, feedbackIsResolved = ?, feedbackRating = ?, feedbackComments = ?, feedbackSubmittedAt = ?
        WHERE id = ?
      `).run(status, feedback.isResolved ? 1 : 0, feedback.rating, feedback.comments, feedback.submittedAt, id);
    } else {
      db.prepare('UPDATE complaints SET status = ? WHERE id = ?').run(status, id);
    }

    // Since timeline is append-only mostly, we can just clear and re-insert, or find new ones.
    // For simplicity with SQLite, clearing and re-inserting is safe for small arrays.
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
    res.status(500).json({ error: error.message });
  }
});

// --- Notices Routes ---
app.get('/api/notices', (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
    const formattedNotices = notices.map(n => ({
      ...n,
      isImportant: n.isImportant === 1
    }));
    res.json(formattedNotices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notices', (req, res) => {
  const { id, title, titleTa, content, contentTa, date, type, isImportant } = req.body;
  try {
    db.prepare(`
      INSERT INTO notices (id, title, titleTa, content, contentTa, date, type, isImportant)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, titleTa, content, contentTa, date, type, isImportant ? 1 : 0);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Catch-all route to serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
