import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as https from 'https';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';

@Injectable()
export class LinkedinService implements OnModuleInit {
  private readonly logger = new Logger(LinkedinService.name);
  private db: sqlite3.Database;
  private readonly dbPath = path.resolve(process.cwd(), '../database.sqlite');

  /**
   * Publishes content to the LinkedIn API (supports URN projection for Profiles and Company Pages)
   */
  async publishShare(
    accessToken: string,
    authorUrn: string, // e.g. 'urn:li:person:12345' or 'urn:li:organization:67890'
    text: string,
    mediaUrl?: string,
  ): Promise<{ shareUrn: string }> {
    this.logger.log(`Publishing share to LinkedIn for author ${authorUrn}`);

    // Check if credentials are placeholders
    if (
      !accessToken ||
      accessToken.startsWith('your_') ||
      accessToken.trim() === '' ||
      !authorUrn ||
      authorUrn.startsWith('urn:li:person:your_') ||
      authorUrn.trim() === ''
    ) {
      this.logger.log('[LinkedIn Service] Credentials not configured in .env. Falling back to Sandbox Mock.');
      const mockPostId = Math.random().toString(36).substring(7);
      return {
        shareUrn: `urn:li:share:${mockPostId}`,
      };
    }

    const postData = {
      author: authorUrn.trim(),
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: mediaUrl ? 'IMAGE' : 'NONE',
          media: mediaUrl ? [{ status: 'READY', originalUrl: mediaUrl }] : []
        }
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };

    const bodyString = JSON.stringify(postData);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.linkedin.com',
        path: '/v2/ugcPosts',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.trim()}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyString),
          'X-Restli-Protocol-Version': '2.0.0'
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(responseBody);
              resolve({ shareUrn: json.id || `urn:li:share:${Math.random().toString(36).substring(7)}` });
            } catch {
              resolve({ shareUrn: `urn:li:share:${Math.random().toString(36).substring(7)}` });
            }
          } else {
            reject(new Error(`LinkedIn API returned status ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(bodyString);
      req.end();
    });
  }

  async getProfileDetails(accessToken: string) {
    if (!accessToken || accessToken.startsWith('your_') || accessToken.trim() === '') {
      return {
        id: 'person-abc',
        localizedFirstName: 'Jane',
        localizedLastName: 'Doe',
        profilePicture: 'https://media.licdn.com/dms/image/mock-avatar.jpg',
      };
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.linkedin.com',
        path: '/v2/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.trim()}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(responseBody));
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`LinkedIn API returned status ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.end();
    });
  }

  onModuleInit() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        this.logger.error(`Failed to connect to database: ${err.message}`);
        return;
      }
      const query = `
        CREATE TABLE IF NOT EXISTS linkedin_accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          login_id TEXT NOT NULL,
          password TEXT,
          auth_method TEXT NOT NULL,
          access_token TEXT,
          member_urn TEXT,
          is_active INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `;
      this.db.run(query, (err2) => {
        if (err2) {
          this.logger.error(`Failed to create linkedin_accounts table: ${err2.message}`);
        } else {
          this.seedDefaultAccount();
        }
      });
    });
  }

  private seedDefaultAccount() {
    this.db.get("SELECT COUNT(*) as count FROM linkedin_accounts", [], (err, row: any) => {
      if (!err && row && row.count === 0) {
        const token = process.env.LINKEDIN_ACCESS_TOKEN || '';
        const urn = process.env.LINKEDIN_MEMBER_URN || '';
        const query = `
          INSERT INTO linkedin_accounts (id, user_id, name, login_id, password, auth_method, access_token, member_urn, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        this.db.run(query, [
          'acc-sandy',
          'default_user',
          'Sandy Sharma (Personal Profile)',
          'sandeep.s@cisinlabs.com',
          '********',
          'oauth_token',
          token,
          urn,
          1
        ], (err3) => {
          if (err3) {
            this.logger.error(`Failed to seed default LinkedIn account: ${err3.message}`);
          } else {
            this.logger.log('Seeded default Sandy Sharma LinkedIn account successfully.');
          }
        });
      }
    });
  }

  async getActiveCredentials(): Promise<{ token: string; urn: string }> {
    return new Promise((resolve) => {
      this.db.get("SELECT access_token, member_urn FROM linkedin_accounts WHERE is_active = 1", [], (err, row: any) => {
        if (!err && row) {
          resolve({
            token: row.access_token || process.env.LINKEDIN_ACCESS_TOKEN || '',
            urn: row.member_urn || process.env.LINKEDIN_MEMBER_URN || ''
          });
        } else {
          resolve({
            token: process.env.LINKEDIN_ACCESS_TOKEN || '',
            urn: process.env.LINKEDIN_MEMBER_URN || ''
          });
        }
      });
    });
  }

  async getAccounts(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM linkedin_accounts ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async addAccount(body: any): Promise<any> {
    const { name, login_id, password, auth_method, access_token, member_urn } = body;
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    
    const query = `
      INSERT INTO linkedin_accounts (id, user_id, name, login_id, password, auth_method, access_token, member_urn, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    return new Promise((resolve, reject) => {
      this.db.run(query, [
        id,
        'default_user',
        name || 'LinkedIn Account',
        login_id || '',
        password || '',
        auth_method || 'password_passkey',
        access_token || '',
        member_urn || '',
        0
      ], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id, success: true });
        }
      });
    });
  }

  async deleteAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM linkedin_accounts WHERE id = ?", [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  async setActiveAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("UPDATE linkedin_accounts SET is_active = 0", [], (err) => {
          if (err) return reject(err);
          this.db.run("UPDATE linkedin_accounts SET is_active = 1 WHERE id = ?", [id], (err2) => {
            if (err2) return reject(err2);
            resolve({ success: true });
          });
        });
      });
    });
  }
}
