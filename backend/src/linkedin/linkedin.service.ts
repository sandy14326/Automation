import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

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
}
