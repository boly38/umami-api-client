# Umami v3 - New Features Implementation Status

## Overview

Umami v3 introduces **3 major new tracking capabilities** that didn't exist in v2:
1. **Links** - Short URL tracking & analytics ✅ **Implemented (read-only)**
2. **Pixels** - Invisible image tracking (email opens, external sites) ✅ **Implemented (read-only)**
3. **Segments & Cohorts** - Saved filter sets & user groups ❌ **Not implemented**

---

## 🔗 1. Links API - Short URL Tracking

**Use cases:**
- Track click-through rates on marketing links
- Measure file download counts
- Monitor external link engagement

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/links` | List all links (paginated) |
| `POST` | `/api/links` | Create new link |
| `GET` | `/api/links/:linkId` | Get link details |
| `POST` | `/api/links/:linkId` | Update link |
| `DELETE` | `/api/links/:linkId` | Delete link |
| `GET` | `/api/links/:linkId/stats` | Get link statistics |

### Data Model

```typescript
{
  id: string;          // UUID
  name: string;        // Display name
  url: string;         // Destination URL
  slug: string;        // Short URL identifier (min 8 chars)
  userId: string;      // Owner UUID
  teamId: string | null;
  createdAt: string;   // ISO timestamp
  updatedAt: string;
  deletedAt: string | null;
}
```

### List Response (Paginated)

```json
{
  "data": [...],
  "count": 1,
  "page": 1,
  "pageSize": 20
}
```

### ✅ Methods Implemented (Read-Only)

```javascript
// List & Search ✅
links(options?: {
  search?: string,
  page?: number,
  pageSize?: number
})

// Get Link ✅
getLink(linkId: string)

// Analytics ✅
linkStats(linkId: string, period?: string, options?: {})
```

### ❌ Methods NOT Implemented (Write Operations)

```javascript
// CRUD - Not implemented (read-only client)
createLink()   ❌
updateLink()   ❌
deleteLink()   ❌
```

---

## 📊 2. Pixels API - Invisible Tracking

**Use cases:**
- Track email open rates (newsletters, campaigns)
- Monitor traffic on external sites where you can't install JavaScript
- Embed in platforms that allow images but not scripts

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pixels` | List all pixels (paginated) |
| `POST` | `/api/pixels` | Create new pixel |
| `GET` | `/api/pixels/:pixelId` | Get pixel details |
| `POST` | `/api/pixels/:pixelId` | Update pixel |
| `DELETE` | `/api/pixels/:pixelId` | Delete pixel |
| `GET` | `/api/pixels/:pixelId/stats` | Get pixel statistics |

### Data Model

```typescript
{
  id: string;          // UUID
  name: string;        // Display name
  slug: string;        // Pixel identifier (min 8 chars)
  userId: string;      // Owner UUID
  teamId: string | null;
  createdAt: string;   // ISO timestamp
  updatedAt: string;
  deletedAt: string | null;
}
```

### ✅ Methods Implemented (Read-Only)

```javascript
// List & Search ✅
pixels(options?: {
  search?: string,
  page?: number,
  pageSize?: number
})

// Get Pixel ✅
getPixel(pixelId: string)

// Analytics ✅
pixelStats(pixelId: string, period?: string, options?: {})
```

### ❌ Methods NOT Implemented (Write Operations)

```javascript
// CRUD - Not implemented (read-only client)
createPixel()  ❌
updatePixel()  ❌
deletePixel()  ❌
```

---

## 🎯 3. Segments & Cohorts API ❌ **NOT IMPLEMENTED**

> **⚠️ Status**: Not implemented in `umami-api-client`.  
> Use the Umami web UI to manage segments and cohorts.

**Use cases:**
- **Segments**: Save frequently-used filter sets (e.g., "iOS users from France")
- **Cohorts**: Track user groups over time (e.g., "Users who signed up in November")

### Segments

Segments are **saved filter sets** that can be reused across analytics.

**Example Segment:**
```json
{
  "name": "Windows users from US",
  "filters": {
    "os": "Windows",
    "country": "US"
  }
}
```

### Cohorts

Cohorts are **user groups** defined by a common event/experience in a time period, tracked over time for retention analysis.

**Example Cohort:**
```json
{
  "name": "November signups",
  "event": "signup",
  "dateRange": "2025-11-01/2025-11-30"
}
```

### API Endpoints (Estimated)

⚠️ **Note**: Segments/Cohorts API documentation is not yet publicly available. Based on Umami v3 features, expected endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/segments` | List all segments |
| `POST` | `/api/segments` | Create segment |
| `GET` | `/api/segments/:segmentId` | Get segment |
| `POST` | `/api/segments/:segmentId` | Update segment |
| `DELETE` | `/api/segments/:segmentId` | Delete segment |
| `GET` | `/api/cohorts` | List all cohorts |
| `POST` | `/api/cohorts` | Create cohort |

### ❌ Methods NOT Implemented

```javascript
// All Segments/Cohorts methods are NOT implemented
segments()        ❌
createSegment()   ❌
getSegment()      ❌
updateSegment()   ❌
deleteSegment()   ❌

cohorts()         ❌
createCohort()    ❌
getCohort()       ❌
```

> Use Umami web UI for segments and cohorts management.

---

## 👨‍💼 4. Admin API ❌ **NOT IMPLEMENTED**

> **⚠️ Status**: Not implemented in `umami-api-client`.  
> Use the Umami web UI for admin operations.

**Use case:** Admin-level management of the entire Umami instance (users, teams, websites)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/websites` | List all websites (admin) |
| `GET` | `/api/admin/users` | List all users (admin) |
| `GET` | `/api/admin/teams` | List all teams (admin) |

### ❌ Methods NOT Implemented

```javascript
// All Admin API methods are NOT implemented
adminWebsites()   ❌
adminUsers()      ❌
adminTeams()      ❌
```

⚠️ **Note**: Only for **Hosted mode**. Umami Cloud doesn't expose admin API.

---

## ✅ Implementation Status (v3.0.3)

### Links API (Read-Only) ✅ COMPLETE
- [x] `links()` - List links
- [x] `getLink()` - Get link by ID
- [x] `linkStats()` - Get link statistics
- [x] Tests for Links API (`tests/40_links_api.test.js`)
- [x] Manual test scripts (`tests/manual/test_links.js`)
- [x] Documentation in README.md (API methods + usage examples)
- ❌ Write operations NOT implemented (read-only client)

### Pixels API (Read-Only) ✅ COMPLETE
- [x] `pixels()` - List pixels
- [x] `getPixel()` - Get pixel by ID
- [x] `pixelStats()` - Get pixel statistics
- [x] Tests for Pixels API (`tests/50_pixels_api.test.js`)
- [x] Manual test scripts (`tests/manual/test_pixels.js`)
- [x] Documentation in README.md (API methods + usage examples)
- ❌ Write operations NOT implemented (read-only client)

### Segments & Cohorts ❌ NOT IMPLEMENTED
- ❌ Not planned for `umami-api-client` (use Umami UI)

### Admin API ❌ NOT IMPLEMENTED
- ❌ Not planned for `umami-api-client` (use Umami UI)

---

## 🔗 Resources

- [Links API Docs](https://umami.is/docs/api/links)
- [Pixels API Docs](https://umami.is/docs/api/pixels)
- [Umami v3 Release](https://github.com/umami-software/umami/releases/tag/v3.0.0)
- [Umami v3 Blog](https://umami.is/blog/umami-v3)

---

## 📊 Implementation Summary

| Feature | Status | Version | Notes |
|---------|--------|---------|-------|
| Links API (read) | ✅ Complete | v3.0.3 | Read-only |
| Pixels API (read) | ✅ Complete | v3.0.3 | Read-only |
| Links API (write) | ❌ Not planned | - | Use Umami UI |
| Pixels API (write) | ❌ Not planned | - | Use Umami UI |
| Segments API | ❌ Not planned | - | Use Umami UI |
| Cohorts API | ❌ Not planned | - | Use Umami UI |
| Admin API | ❌ Not planned | - | Use Umami UI |

**Design decision**: `umami-api-client` is a **read-only analytics client**.  
For write operations and admin tasks, use the Umami web interface.

---

**Last updated**: 2026-01-19  
**Current version**: v3.0.3
