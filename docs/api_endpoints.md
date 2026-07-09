# AI Content Publisher - API Documentation

This document describes the REST API endpoints and webhooks for the AI Content Publisher SaaS platform. All API endpoints are prefixed with `/api/v1`.

---

## 1. Authentication (`/api/v1/auth`)

### POST `/auth/register`
Creates a new tenant organization and register an owner account.
- **Request Body**:
  ```json
  {
    "email": "owner@company.com",
    "password": "SecurePassword123!",
    "fullName": "John Doe",
    "organizationName": "Innovate LLC"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "userId": "d7b42f61-23d3-4903-8854-3e9112521199",
    "organizationId": "a90dfb39-16a2-4a0b-800d-58721c5fdf6f",
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "e309cb8b..."
  }
  ```

### POST `/auth/login`
Authenticates a user with email and password.
- **Request Body**:
  ```json
  {
    "email": "owner@company.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK` (includes MFA requirements if active)

### POST `/auth/otp/send`
Sends a one-time OTP password for mobile login.
- **Request Body**:
  ```json
  {
    "phoneNumber": "+15550192834"
  }
  ```

### POST `/auth/otp/verify`
Authenticates user using phone number + OTP code.

---

## 2. LinkedIn Integrations (`/api/v1/linkedin`)

### GET `/linkedin/connect`
Returns the OAuth authorization URL to redirect users to LinkedIn.
- **Query Params**: `organizationId`
- **Response**: `200 OK`
  ```json
  {
    "authUrl": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=..."
  }
  ```

### GET `/linkedin/callback`
OAuth callback endpoint that exchanges the code for tokens, retrieves profile details, and registers the connection.

### GET `/linkedin/accounts`
Lists connected LinkedIn profiles/pages.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "e42e1281-a988-4f11-9a72-1c2cd174092b",
      "name": "Jane Developer (Profile)",
      "accountType": "profile",
      "avatarUrl": "https://media.licdn.com/dms/...",
      "isExpired": false
    }
  ]
  ```

---

## 3. Content Categories (`/api/v1/categories`)

### GET `/categories`
Lists all active categories for the tenant (predefined + custom).

### POST `/categories`
Creates a custom category.
- **Request Body**:
  ```json
  {
    "name": "Generative AI",
    "priority": 2,
    "frequencyPerWeek": 3
  }
  ```

---

## 4. AI Content Generation (`/api/v1/posts`)

### POST `/posts/generate`
Generates a new blog article draft, social post, summary, keywords, and hashtags.
- **Request Body**:
  ```json
  {
    "categoryId": "22ff33aa...",
    "sourceType": "trending_news",
    "sourceUrl": "https://techcrunch.com/...",
    "tone": "thoughtful",
    "length": "medium_post"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": "ff23bb41-6101-44bb-9022-77761dccaa55",
    "title": "Scaling AI in 2026: Key Realities",
    "bodyContent": "The journey from AI prototype to production...",
    "linkedinPostContent": "Are you scaling AI this year? 🚀 Check out these findings...",
    "hashtags": ["AI", "Startups", "SaaS"],
    "summary": "This article explores technical parameters...",
    "imageUrl": "https://image.ai-publisher.com/assets/..."
  }
  ```

### POST `/posts/edit-ai`
Processes edits on content via AI toolbar commands.
- **Request Body**:
  ```json
  {
    "postId": "ff23bb41...",
    "field": "linkedinPostContent",
    "action": "rewrite" // or "shorten", "expand", "add_emojis"
  }
  ```

---

## 5. Publishing & Approvals (`/api/v1/queue`)

### GET `/queue`
Fetches items in the publishing lifecycle (pending, scheduled, published).

### POST `/queue/{id}/approve`
Approves post and plans its scheduling.
- **Request Body**:
  ```json
  {
    "scheduledTime": "2026-07-09T10:00:00Z"
  }
  ```

### POST `/queue/{id}/reject`
Rejects a draft post.
- **Request Body**:
  ```json
  {
    "rejectionFeedback": "Rewrite the introduction with a more professional tone."
  }
  ```

---

## 6. WhatsApp Integration Webhooks (`/api/v1/webhooks/whatsapp`)

### POST `/webhooks/whatsapp`
Receives Twilio Sandbox webhook payloads triggered when a user replies to WhatsApp notifications.
- **Twilio Payload**:
  - `Body`: "1" (Approve), "2" (Open editor URL), or "3" (Reject).
  - `From`: User's registered phone number.
- **Internal Actions**:
  - Validates user phone number.
  - Fetches the latest pending post for the organization.
  - If `1`: Transitions status to `scheduled`. Sends confirmation SMS: "Success! Post approved for publication."
  - If `3`: Transitions status to `rejected`. Sends prompt: "Post rejected. Reply with feedback text if desired."
