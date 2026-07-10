import { Injectable, OnModuleInit, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as crypto from 'crypto';
import * as https from 'https';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private db: sqlite3.Database;
  private readonly dbPath = path.resolve(process.cwd(), '../database.sqlite');
  
  // In-memory active OTP cache (Valid for 5 minutes)
  private activeOtps = new Map<string, { code: string; expiresAt: number }>();

  constructor(private readonly jwtService: JwtService) {}

  onModuleInit() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
      } else {
        console.log('[SQLite Database] Connected successfully at:', this.dbPath);
        this.createTables();
      }
    });
  }

  /**
   * Initializes database schema tables
   */
  private createTables() {
    const userTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fullName TEXT NOT NULL,
        phoneNumber TEXT,
        role TEXT NOT NULL DEFAULT 'end_user',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const blogPostsQuery = `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        linkedin_post_content TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const queueQuery = `
      CREATE TABLE IF NOT EXISTS publishing_queue (
        id TEXT PRIMARY KEY,
        post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_approval',
        whatsapp_notification_sent INTEGER DEFAULT 0,
        scheduledTime TEXT,
        publishedAt TEXT,
        rejectionFeedback TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;
    this.db.run(userTableQuery, (err) => {
      if (err) {
        console.error('Failed to create users table:', err.message);
      } else {
        console.log('[SQLite Database] Users schema verified.');
        this.db.run(blogPostsQuery, (err) => {
          if (err) console.error('Failed to create blog_posts table:', err.message);
        });
        this.db.run(queueQuery, (err) => {
          if (err) console.error('Failed to create publishing_queue table:', err.message);
        });
        // Seed default super admin if none exists
        this.seedDefaultAdmin();
      }
    });
  }

  /**
   * Seed default Admin to guarantee testing capability
   */
  private seedDefaultAdmin() {
    const adminEmail = 'admin@autopilot-ai.com';
    this.findUserByEmail(adminEmail).then((user) => {
      if (!user) {
        const hashedPassword = this.hashPassword('admin1234');
        const insertQuery = `
          INSERT INTO users (id, email, password_hash, fullName, phoneNumber, role)
          VALUES (?, ?, ?, ?, ?, ?);
        `;
        this.db.run(insertQuery, [
          crypto.randomUUID(),
          adminEmail,
          hashedPassword,
          'Super Admin',
          '+919893854811',
          'super_admin'
        ], (err) => {
          if (err) {
            console.error('Failed to seed default admin user:', err.message);
          } else {
            console.log('[SQLite Database] Seeded default Admin user (admin@autopilot-ai.com / admin1234).');
          }
        });
      }
    });
  }

  /**
   * Helper function to query a user by email
   */
  findUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM users WHERE email = ? LIMIT 1;`;
      this.db.get(selectQuery, [email.toLowerCase().trim()], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Helper function to query a user by phone number
   */
  findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    let cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM users WHERE phoneNumber = ? LIMIT 1;`;
      this.db.get(selectQuery, [cleanPhone], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Helper function to query a user by id
   */
  findUserById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT id, email, fullName, phoneNumber, role, createdAt FROM users WHERE id = ? LIMIT 1;`;
      this.db.get(selectQuery, [id], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Queries all registered users
   */
  findAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT id, email, fullName, phoneNumber, role, createdAt FROM users ORDER BY createdAt DESC;`;
      this.db.all(selectQuery, [], (err, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Hashes a password using secure native node pbkdf2 algorithm
   */
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies an input password against stored pbkdf2 hash
   */
  private verifyPassword(password: string, storedHash: string): boolean {
    try {
      const [salt, hash] = storedHash.split(':');
      if (!salt || !hash) return false;
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch {
      return false;
    }
  }

  /**
   * Registers a new user
   */
  async register(email: string, password: string, fullName: string, phoneNumber?: string): Promise<any> {
    const existing = await this.findUserByEmail(email);
    if (existing) {
      throw new ConflictException('A user with this email address already exists.');
    }

    if (phoneNumber) {
      const existingPhone = await this.findUserByPhoneNumber(phoneNumber);
      if (existingPhone) {
        throw new ConflictException('A user with this phone number already exists.');
      }
    }

    let cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, '') : null;
    if (cleanPhone && !cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }

    const userId = crypto.randomUUID();
    const hashedPassword = this.hashPassword(password);
    const role = 'end_user';

    const insertQuery = `
      INSERT INTO users (id, email, password_hash, fullName, phoneNumber, role)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
      this.db.run(insertQuery, [
        userId,
        email.toLowerCase().trim(),
        hashedPassword,
        fullName.trim(),
        cleanPhone,
        role
      ], (err) => {
        if (err) {
          reject(err);
        } else {
          // Auto-seed a default pending approval post draft for this user in SQLite
          const postId = crypto.randomUUID();
          const queueId = crypto.randomUUID();
          const title = 'Leveraging Generative AI in Enterprise SaaS';
          const postContent = `🚀 Telemetry loops and agentic AI represent the future of SaaS scaling! By utilizing autonomous draft validation pipelines, modern companies reduce deployment overhead from weeks to minutes.\n\nRead more on our engineering blog: http://autopilot-ai.com/scaling-pipelines #SaaS #AI #Scaling`;
          
          this.db.run('INSERT INTO blog_posts (id, user_id, title, linkedin_post_content) VALUES (?, ?, ?, ?);', [postId, userId, title, postContent]);
          this.db.run('INSERT INTO publishing_queue (id, post_id, user_id, status, whatsapp_notification_sent) VALUES (?, ?, ?, ?, 0);', [queueId, postId, userId, 'pending_approval']);

          resolve({
            id: userId,
            email,
            fullName,
            phoneNumber,
            role,
            message: 'User registered successfully!'
          });
        }
      });
    });
  }

  /**
   * Auths user and yields a JWT access token
   */
  async login(email: string, password: string): Promise<any> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    const isMatch = this.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  /**
   * Outbound basic HTTPS request mapping to Twilio Messages API
   */
  private sendTwilioSms(to: string, body: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

      if (!sid || !token || sid.startsWith('your_') || token.startsWith('your_')) {
        console.log('[Auth Service] Twilio credentials are not configured inside the .env file. Outbound WhatsApp message bypassed.');
        return resolve(null);
      }

      const cleanTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const cleanFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

      const postData = new URLSearchParams({
        To: cleanTo,
        From: cleanFrom,
        Body: body
      }).toString();

      const authHeaderValue = Buffer.from(`${sid}:${token}`).toString('base64');

      const options = {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${sid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeaderValue}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseBody));
          } else {
            reject(new Error(`Twilio API status ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Generates and dispatches a 6-digit OTP code to the user's phone
   */
  async sendOtp(phoneNumber: string): Promise<any> {
    let cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }
    const user = await this.findUserByPhoneNumber(cleanPhone);

    if (!user) {
      throw new UnauthorizedException('No registered account was found linked to this phone number.');
    }

    // Generate random 6-digit number
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Code valid for 5 minutes
    this.activeOtps.set(cleanPhone, { code: otpCode, expiresAt });

    // Print code in terminal for local debugging / testing copy-paste
    console.log(`\n🔑 [OTP CODE SERVICE] Generated verification code for ${cleanPhone}: "${otpCode}" (Valid for 5 minutes)\n`);

    // Dispatch WhatsApp (Temporarily bypassed for sandbox debugging)
    /*
    try {
      await this.sendTwilioSms(
        cleanPhone,
        `🔑 LinkedIn Autopilot Verification:\n\nYour 6-digit OTP code is: ${otpCode}\n\nValid for 5 minutes.`
      );
    } catch (e) {
      console.error('[Auth Service] Twilio output dispatch warning:', e.message);
    }
    */

    return {
      message: 'Verification code sent successfully! (View code on your screen)',
      phoneNumber: cleanPhone,
      debugOtpCode: otpCode
    };
  }

  /**
   * Verifies verification code and yields a JWT access token
   */
  async verifyOtp(phoneNumber: string, code: string): Promise<any> {
    let cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }
    const record = this.activeOtps.get(cleanPhone);

    if (!record) {
      throw new UnauthorizedException('No active OTP verification request found for this phone number.');
    }

    if (Date.now() > record.expiresAt) {
      this.activeOtps.delete(cleanPhone);
      throw new UnauthorizedException('The verification code has expired. Please request a new one.');
    }

    if (record.code !== code.trim()) {
      throw new UnauthorizedException('Invalid verification code.');
    }

    // Pull user details
    const user = await this.findUserByPhoneNumber(cleanPhone);
    if (!user) {
      throw new UnauthorizedException('Authentication credentials expired.');
    }

    // Clear session
    this.activeOtps.delete(cleanPhone);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  /**
   * Generates a CSV table of all registered users
   */
  async exportUsersToCSV(): Promise<string> {
    const users = await this.findAllUsers();
    
    // Header
    let csv = 'ID,Email,Full Name,Phone Number,Role,Created At\n';
    
    for (const u of users) {
      const escapedName = `"${u.fullName.replace(/"/g, '""')}"`;
      csv += `${u.id},${u.email},${escapedName},${u.phoneNumber || 'N/A'},${u.role},${u.createdAt}\n`;
    }

    return csv;
  }
}
