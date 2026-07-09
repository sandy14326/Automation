import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';

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

  onModuleInit() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('[QueueService] Failed to connect to SQLite:', err.message);
      } else {
        console.log('[QueueService] Database connected successfully.');
        this.verifySchema();
      }
    });
  }

  private verifySchema() {
    // Ensures tables exist in case AuthService hasn't boot-created them yet
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
