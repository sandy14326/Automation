import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { LinkedinService } from '../linkedin/linkedin.service';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as https from 'https';

export interface QueueItem {
  id: string;
  post_id: string;
  user_id: string;
  status: string;
  whatsapp_notification_sent: number;
  scheduledTime?: string;
  publishedAt?: string;
  rejectionFeedback?: string;
  title: string;
  linkedin_post_content: string;
  createdAt: string;
}

@Injectable()
export class QueueService implements OnModuleInit {
  private db: sqlite3.Database;
  private readonly dbPath = path.resolve(process.cwd(), '../database.sqlite');

  constructor(private readonly linkedinService: LinkedinService) {}

  onModuleInit() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('[QueueService] Failed to connect to SQLite:', err.message);
      } else {
        console.log('[QueueService] Database connected successfully.');
        this.verifySchema();
        // Start background publisher worker checking for scheduled posts every 10 seconds
        setInterval(() => this.processScheduledPublishing(), 10000);
      }
    });
  }

  private verifySchema() {
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
    this.db.run(blogPostsQuery, (err) => {
      if (err) console.error('[QueueService] Failed to create blog_posts table:', err.message);
    });
    this.db.run(queueQuery, (err) => {
      if (err) console.error('[QueueService] Failed to create publishing_queue table:', err.message);
    });
  }

  /**
   * Background publisher loop executing scheduled queue items automatically
   */
  private async processScheduledPublishing() {
    const nowStr = new Date().toISOString();
    const query = `
      SELECT q.id as queue_id, q.post_id, q.user_id, p.title, p.linkedin_post_content, u.phoneNumber
      FROM publishing_queue q
      JOIN blog_posts p ON q.post_id = p.id
      JOIN users u ON q.user_id = u.id
      WHERE q.status = 'scheduled' AND (q.scheduledTime IS NULL OR q.scheduledTime <= ?);
    `;

    this.db.all(query, [nowStr], async (err, rows: any[]) => {
      if (err) {
        console.error('[QueueService] Error querying scheduled posts:', err.message);
        return;
      }

      if (!rows || rows.length === 0) return;

      for (const item of rows) {
        console.log(`[QueueService] Found scheduled post ready to publish: "${item.title}" (Queue ID: ${item.queue_id})`);

        const token = process.env.LINKEDIN_ACCESS_TOKEN;
        const urn = process.env.LINKEDIN_MEMBER_URN;

        let publishLog = '';
        let success = true;
        let shareUrn = '';

        try {
          const result = await this.linkedinService.publishShare(token, urn, item.linkedin_post_content);
          shareUrn = result.shareUrn;
          publishLog = `\n\nLive Link: https://linkedin.com/feed/update/${shareUrn}`;
        } catch (publishErr) {
          console.error(`[QueueService] Direct LinkedIn publishing failed for post ${item.queue_id}:`, publishErr.message);
          publishLog = `\n\n(Error: ${publishErr.message})`;
          success = false;
        }

        // Update queue item state to published (or failed)
        const finalStatus = success ? 'published' : 'failed';
        await this.updateQueueStatus(item.queue_id, finalStatus);

        // Notify user via WhatsApp
        if (item.phoneNumber) {
          const cleanPhone = item.phoneNumber.replace(/\s+/g, '');
          const messageText = success
            ? `🚀 *[Autopilot Alert]* Your scheduled post *"${item.title}"* has been published live to your LinkedIn profile!${publishLog}`
            : `⚠️ *[Autopilot Alert]* Failed to publish your scheduled post *"${item.title}"* to LinkedIn.${publishLog}`;

          try {
            await this.sendTwilioSms(cleanPhone, messageText);
          } catch (smsErr) {
            console.error(`[QueueService] Failed to send WhatsApp alert to ${cleanPhone}:`, smsErr.message);
          }
        }
      }
    });
  }

  /**
   * Helper HTTPS POST request mapping to Twilio Messages API
   */
  private sendTwilioSms(to: string, body: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

      if (!sid || !token || sid.startsWith('your_') || token.startsWith('your_')) {
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
            reject(new Error(`Twilio status ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(postData);
      req.end();
    });
  }

  /**
   * Looks up a user (as organization context) by their phone number
   */
  async findOrganizationByPhoneNumber(phone: string): Promise<any | null> {
    const cleanPhone = phone.replace(/\s+/g, '');
    return new Promise((resolve) => {
      const selectQuery = `SELECT id, fullName, phoneNumber FROM users WHERE phoneNumber = ? LIMIT 1;`;
      this.db.get(selectQuery, [cleanPhone], (err, row: any) => {
        if (err || !row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            name: row.fullName,
            phoneNumber: row.phoneNumber,
          });
        }
      });
    });
  }

  /**
   * Pulls the latest pending post awaiting WhatsApp approval
   */
  async getLatestPendingQueueItem(userId: string): Promise<QueueItem | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*, p.title, p.linkedin_post_content 
        FROM publishing_queue q 
        JOIN blog_posts p ON q.post_id = p.id 
        WHERE q.user_id = ? AND q.status = 'pending_approval' 
        ORDER BY q.createdAt DESC 
        LIMIT 1;
      `;
      this.db.get(query, [userId], (err, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  /**
   * Pulls the latest rejected queue item for comment appending
   */
  async getLatestRejectedQueueItem(userId: string): Promise<QueueItem | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*, p.title, p.linkedin_post_content 
        FROM publishing_queue q 
        JOIN blog_posts p ON q.post_id = p.id 
        WHERE q.user_id = ? AND q.status = 'rejected' 
        ORDER BY q.createdAt DESC 
        LIMIT 1;
      `;
      this.db.get(query, [userId], (err, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  /**
   * Updates queue status (e.g. approved, rejected, published)
   */
  async updateQueueStatus(
    queueId: string,
    status: string,
    options?: { scheduledTime?: Date; rejectionFeedback?: string }
  ): Promise<any> {
    const scheduledStr = options?.scheduledTime ? options.scheduledTime.toISOString() : null;
    const feedback = options?.rejectionFeedback || null;

    return new Promise((resolve, reject) => {
      const updateQuery = `
        UPDATE publishing_queue 
        SET status = ?, 
            scheduledTime = COALESCE(?, scheduledTime), 
            rejectionFeedback = COALESCE(?, rejectionFeedback),
            publishedAt = CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE publishedAt END
        WHERE id = ?;
      `;
      this.db.run(updateQuery, [status, scheduledStr, feedback, status, queueId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id: queueId, status });
        }
      });
    });
  }

  /**
   * Appends user WhatsApp text feedback to a rejected draft post
   */
  async appendRejectionFeedback(queueId: string, feedback: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT rejectionFeedback FROM publishing_queue WHERE id = ? LIMIT 1;`;
      this.db.get(selectQuery, [queueId], (err, row: any) => {
        if (err) {
          return reject(err);
        }
        const currentFeedback = row?.rejectionFeedback || '';
        const newFeedback = currentFeedback ? `${currentFeedback} | ${feedback}` : feedback;
        
        const updateQuery = `UPDATE publishing_queue SET rejectionFeedback = ? WHERE id = ?;`;
        this.db.run(updateQuery, [newFeedback, queueId], (updateErr) => {
          if (updateErr) reject(updateErr);
          else resolve();
        });
      });
    });
  }
}
