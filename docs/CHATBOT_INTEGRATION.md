# Orbis-Track Chatbot Integration Contract

## Overview

This document defines the integration contract between the **Main App (Orbis-Track)** and the **Chatbot (giga-chatbot)** for SSO authentication, API access, and real-time data synchronization via PostgreSQL NOTIFY.

---

## 1. Shared Authentication Contract

### Cookie Configuration

| Property    | Value                        | Description               |
| ----------- | ---------------------------- | ------------------------- |
| Cookie Name | `orbistrack_jwt`             | Shared JWT cookie name    |
| Path        | `/`                          | Accessible from all paths |
| HttpOnly    | `true`                       | Prevent JavaScript access |
| Secure      | `true` (prod)                | HTTPS only in production  |
| SameSite    | `Lax`                        | CSRF protection           |
| Domain      | `.yourdomain.com` (optional) | For subdomain sharing     |

### JWT Claims

```json
{
  "sub": 123, // User ID (required)
  "role": "ADMIN", // User role (required)
  "dept": 1, // Department ID (nullable)
  "sec": 2, // Section ID (nullable)
  "iss": "orbistrack", // Issuer
  "aud": "orbistrack-web", // Audience
  "iat": 1700000000, // Issued at (Unix timestamp)
  "exp": 1700007200 // Expiration (Unix timestamp)
}
```

### Environment Variables (Shared)

```bash
# Both repos must use the same values
JWT_SECRET=your-shared-secret-min-32-chars
JWT_EXPIRES_IN=2h
COOKIE_DOMAIN=.yourdomain.com  # Optional, for subdomain SSO
```

---

## 2. Authentication Endpoints

### GET /api/auth/session

**Purpose:** Verify session status from Chatbot

**Auth:** Required (via cookie or Bearer token)

**Response (200):**

```json
{
  "message": "Session valid",
  "data": {
    "user": {
      "sub": 123,
      "role": "ADMIN",
      "dept": 1,
      "sec": 2
    },
    "roles": ["ADMIN"],
    "exp": 1700007200
  }
}
```

**Error (401):**

```json
{
  "code": "UNAUTHORIZED",
  "message": "Not authenticated",
  "request_id": "uuid"
}
```

### POST /api/auth/login/cookie

**Purpose:** Login with HttpOnly cookie (SSO)

**Request:**

```json
{
  "username": "john.doe",
  "passwords": "MySecurePassword123!",
  "isRemember": false
}
```

**Response (200):**

```json
{
  "message": "Login successful"
}
```

**Sets:** `Set-Cookie: orbistrack_jwt=...; HttpOnly; Secure; SameSite=Lax; Path=/`

### POST /api/auth/logout/cookie

**Purpose:** Logout and clear cookie

**Auth:** Required

**Response (200):**

```json
{
  "message": "Logout successful"
}
```

**Clears:** `Set-Cookie: orbistrack_jwt=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`

---

## 3. Device API Endpoints

### GET /api/v1/inventory

**Purpose:** List all devices with pagination

**Auth:** Required

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (optional)
- `category`: number (optional)

### GET /api/v1/inventory/devices/:id

**Purpose:** Get device details with child devices status

**Auth:** Required

**Response:** Device with childs, category, section details

### GET /api/v1/inventory/device-child-status

**Purpose:** Get aggregated device child status counts

**Auth:** Required

---

## 4. Ticket API Endpoints

### GET /api/v1/tickets/borrow-return

**Purpose:** List borrow-return tickets

**Auth:** Required

**Query Parameters:**

- `status`: PENDING | APPROVED | IN_USE | OVERDUE | COMPLETED | REJECTED
- `user_id`: number (optional)
- `date_from`: ISO date (optional)
- `date_to`: ISO date (optional)
- `page`: number
- `limit`: number

### GET /api/v1/tickets/borrow-return/:id

**Purpose:** Get ticket details by ID

**Auth:** Required

---

## 5. Issue API Endpoints

### GET /api/v1/history-issue

**Purpose:** List ticket issues

**Auth:** Required

**Query Parameters:**

- `status`: PENDING | IN_PROGRESS | COMPLETED
- `de_id`: device ID (optional)
- `brt_id`: borrow ticket ID (optional)
- `q`: search query (optional)

---

## 6. Notification API Endpoints

### GET /api/v1/notifications

**Purpose:** Get user notifications

**Auth:** Required

**Query Parameters:**

- `unread`: true | false (optional)
- `page`: number
- `limit`: number

### PATCH /api/v1/notifications/read

**Purpose:** Mark notification as read

**Auth:** Required

**Request:**

```json
{
  "ids": [1, 2, 3]
}
```

---

## 7. Health Check Endpoints

### GET /api/healthz

**Purpose:** Liveness probe

**Auth:** None

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/readyz

**Purpose:** Readiness probe (includes DB check)

**Auth:** None

**Response (200):**

```json
{
  "status": "ready",
  "checks": {
    "database": "ok"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (503):**

```json
{
  "status": "not_ready",
  "checks": {
    "database": "error"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 8. PostgreSQL NOTIFY Contract (RAG Updates)

### Channel

```
rag_update
```

### Payload Format

```json
{
  "table": "devices",
  "pk": 123,
  "action": "INSERT" | "UPDATE" | "DELETE"
}
```

### Tracked Tables

| Table                   | Watched Columns                                                                       | Trigger Events         |
| ----------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| `devices`               | de_name, de_description, de_location, de_ca_id, de_sec_id, de_af_id                   | INSERT, UPDATE, DELETE |
| `device_childs`         | dec_asset_code, dec_serial_number, dec_status, dec_de_id                              | INSERT, UPDATE, DELETE |
| `categories`            | ca_name                                                                               | INSERT, UPDATE, DELETE |
| `borrow_return_tickets` | brt_status, brt_user_id, brt_start_date, brt_end_date, brt_af_id                      | INSERT, UPDATE, DELETE |
| `ticket_issues`         | ti_title, ti_description, ti_status, ti_result, ti_resolved_note, ti_de_id, ti_brt_id | INSERT, UPDATE, DELETE |

### Example: Listening in Node.js

```javascript
const { Client } = require("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query("LISTEN rag_update");

client.on("notification", (msg) => {
  const payload = JSON.parse(msg.payload);
  console.log("RAG update:", payload);
  // { table: 'devices', pk: 123, action: 'UPDATE' }

  // Queue for re-embedding
  ragWorker.enqueue(payload);
});
```

---

## 9. Error Response Format

All errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "request_id": "uuid-for-tracing"
}
```

### Common Error Codes

| Code             | HTTP Status | Description              |
| ---------------- | ----------- | ------------------------ |
| UNAUTHORIZED     | 401         | Missing or invalid token |
| FORBIDDEN        | 403         | Insufficient permissions |
| NOT_FOUND        | 404         | Resource not found       |
| VALIDATION_ERROR | 400         | Invalid request data     |
| RATE_LIMITED     | 429         | Too many requests        |
| INTERNAL_ERROR   | 500         | Server error             |

---

## 10. Rate Limits

| Endpoint                  | Limit       |
| ------------------------- | ----------- |
| POST /api/auth/login      | 5 req/min   |
| POST /api/auth/send-otp   | 3 req/min   |
| POST /api/auth/verify-otp | 5 req/min   |
| All other endpoints       | 300 req/min |

---

## 11. Security Headers

Nginx adds these headers to all responses:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 12. Nginx Routing

```nginx
# Priority order (important!)
location ^~ /chat/ { proxy_pass http://chatbot; }  # 1
location /api/ { proxy_pass http://backend; }      # 2
location / { proxy_pass http://frontend; }         # 3 (SPA fallback)
```

---

## 13. Chatbot Base Path Configuration

In the Chatbot (Next.js), set:

```javascript
// next.config.js
module.exports = {
  basePath: "/chat",
  // Optional: assetPrefix if assets don't load correctly
  // assetPrefix: '/chat',
};
```

---

## 14. Integration Checklist

### Main App (Orbis-Track)

- [x] JWT with iss/aud claims
- [x] HttpOnly cookie support
- [x] GET /api/auth/session endpoint
- [x] Cookie-based login/logout
- [x] Health endpoints (/healthz, /readyz)
- [x] RAG triggers on relevant tables
- [x] Nginx /chat routing
- [x] CSRF protection middleware

### Chatbot (giga-chatbot)

- [ ] basePath: "/chat" configured
- [ ] JWT verify with iss/aud
- [ ] Cookie-based auth middleware
- [ ] Redirect to /login?next=/chat on 401
- [ ] LISTEN rag_update channel
- [ ] Debounce/queue for re-embedding
- [ ] Health endpoint at /chat/api/healthz

---

## 15. Testing Integration

### Test SSO Flow

```bash
# 1. Login via Main App
curl -X POST http://localhost/api/auth/login/cookie \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","passwords":"pass"}' \
  -c cookies.txt

# 2. Access Chatbot (cookie should be sent automatically)
curl http://localhost/chat \
  -b cookies.txt

# 3. Verify session from Chatbot context
curl http://localhost/api/auth/session \
  -b cookies.txt
```

### Test RAG Notify

```sql
-- Trigger an update
UPDATE devices SET de_name = 'New Name' WHERE de_id = 1;

-- Should see NOTIFY in PostgreSQL logs
```

---

## 16. Troubleshooting

### Cookie Not Sent to Chatbot

- Check `SameSite=Lax` (not Strict)
- Verify `Path=/`
- Check `Domain` matches (or is not set for same-domain)

### 401 from /api/auth/session

- Verify JWT_SECRET matches between repos
- Check token has `iss` and `aud` claims
- Verify cookie is being sent (browser DevTools)

### RAG NOTIFY Not Working

- Check triggers exist: `SELECT * FROM pg_trigger WHERE tgname LIKE 'rag_update_%'`
- Verify LISTEN is active: `SELECT * FROM pg_stat_activity WHERE query LIKE '%LISTEN%'`
- Check PostgreSQL logs for errors

---

**Document Version:** 1.0  
**Last Updated:** 2024-02-24  
**Author:** Orbis-Track Team
