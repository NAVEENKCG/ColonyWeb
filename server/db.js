import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'colony.db');

// Disable verbose SQL logging in production to prevent leaking query details
const isProduction = process.env.NODE_ENV === 'production';
const db = new Database(dbPath, {
  verbose: isProduction ? null : console.log,
});

// Enable WAL mode for better concurrent access safety
db.pragma('journal_mode = WAL');

// Initialize database schema
export const initDb = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      flatNumber TEXT NOT NULL,
      block TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);

  // Sessions table — server-side auth tokens with expiry
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      expiresAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // OTP table — server-side OTP storage with expiry
  db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'login',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      expiresAt TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      customId TEXT NOT NULL,
      title TEXT NOT NULL,
      titleTa TEXT,
      description TEXT NOT NULL,
      descriptionTa TEXT,
      category TEXT NOT NULL,
      categoryLabel TEXT NOT NULL,
      categoryLabelTa TEXT NOT NULL,
      reportedBy TEXT NOT NULL,
      reportedAt TEXT NOT NULL,
      status TEXT NOT NULL,
      feedbackIsResolved INTEGER,
      feedbackRating INTEGER,
      feedbackComments TEXT,
      feedbackSubmittedAt TEXT
    )
  `);

  // Complaint Timeline Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      senderType TEXT NOT NULL,
      senderName TEXT NOT NULL,
      senderNameTa TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      text TEXT NOT NULL,
      textTa TEXT,
      photoUrl TEXT,
      FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
    )
  `);

  // Notices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      titleTa TEXT,
      content TEXT NOT NULL,
      contentTa TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      isImportant INTEGER DEFAULT 0
    )
  `);

  // Clean up expired sessions and OTPs on startup
  db.prepare("DELETE FROM sessions WHERE expiresAt < datetime('now')").run();
  db.prepare("DELETE FROM otps WHERE expiresAt < datetime('now')").run();
};

export default db;
