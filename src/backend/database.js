const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/opmo.db');
    this.init();
  }

  init() {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table created successfully');
      }
    });

    // Connections table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER,
        username TEXT,
        password_encrypted TEXT,
        url TEXT,
        description TEXT,
        group_name TEXT,
        is_favorite INTEGER DEFAULT 0,
        tags TEXT,
        pre_script TEXT,
        post_script TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating connections table:', err);
      } else {
        console.log('Connections table created successfully');
      }
    });

    // Audit logs table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        connection_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (connection_id) REFERENCES connections (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating audit_logs table:', err);
      } else {
        console.log('Audit logs table created successfully');
      }
    });

    // User sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating user_sessions table:', err);
      } else {
        console.log('User sessions table created successfully');
        // Create default user after all tables are created
        setTimeout(() => this.createDefaultUser(), 1000);
      }
    });
  }

  createDefaultUser() {
    this.db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err);
        return;
      }

      if (row.count === 0) {
        const defaultPassword = 'admin123';
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
        
        this.db.run(
          'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['admin', 'admin@opmo.local', hashedPassword, 'admin'],
          (err) => {
            if (err) {
              console.error('Error creating default admin user:', err);
            } else {
              console.log('Default admin user created (username: admin, password: admin123)');
            }
          }
        );
      }
    });
  }

  // Encryption/Decryption methods for sensitive data
  encrypt(text, key = 'opmo-secret-key') {
    return crypto.AES.encrypt(text, key).toString();
  }

  decrypt(encryptedText, key = 'opmo-secret-key') {
    const bytes = crypto.AES.decrypt(encryptedText, key);
    return bytes.toString(crypto.enc.Utf8);
  }

  // Helper method to run queries with promises
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Database;
