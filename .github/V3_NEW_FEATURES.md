# Umami v3 - New Features to Implement

## Overview

Umami v3 introduces **3 major new tracking capabilities** that didn't exist in v2:
1. **Links** - Short URL tracking & analytics
2. **Pixels** - Invisible image tracking (email opens, external sites)
3. **Segments & Cohorts** - Saved filter sets & user groups

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

### Methods to Implement

```javascript
// List & Search
links(options?: {
  search?: string,
  page?: number,
  pageSize?: number
})

// CRUD
createLink(data: {
  name: string,
  url: string,
  slug?: string  // Auto-generated if not provided
})

getLink(linkId: string)

updateLink(linkId: string, data: {
  name?: string,
  url?: string,
  slug?: string
})

deleteLink(linkId: string)

// Analytics
linkStats(linkId: string, period?: string, options?: {})
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

### Methods to Implement

```javascript
// List & Search
pixels(options?: {
  search?: string,
  page?: number,
  pageSize?: number
})

// CRUD
createPixel(data: {
  name: string,
  slug?: string  // Auto-generated if not provided
})

getPixel(pixelId: string)

updatePixel(pixelId: string, data: {
  name?: string,
  slug?: string
})

deletePixel(pixelId: string)

// Analytics
pixelStats(pixelId: string, period?: string, options?: {})
```

---

## 🎯 3. Segments & Cohorts API

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

### Methods to Implement (Tentative)

```javascript
// Segments
segments(options?: { page?, pageSize? })
createSegment(data: {
  name: string,
  filters: object
})
getSegment(segmentId: string)
updateSegment(segmentId: string, data)
deleteSegment(segmentId: string)

// Cohorts
cohorts(options?: { page?, pageSize? })
createCohort(data: {
  name: string,
  event: string,
  dateRange: string
})
getCohort(cohortId: string)
```

---

## 👨‍💼 4. Admin API (Optional)

**Use case:** Admin-level management of the entire Umami instance (users, teams, websites)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/websites` | List all websites (admin) |
| `GET` | `/api/admin/users` | List all users (admin) |
| `GET` | `/api/admin/teams` | List all teams (admin) |

### Methods to Implement

```javascript
// Admin only (requires admin role)
adminWebsites(options?: { page?, pageSize? })
adminUsers(options?: { page?, pageSize? })
adminTeams(options?: { page?, pageSize? })
```

⚠️ **Note**: Only for **Hosted mode**. Umami Cloud doesn't expose admin API.

---

## 📋 Implementation Checklist

### Phase 2.1 - Links API (v3.1.0)
- [ ] `links()` - List links
- [ ] `createLink()` - Create link
- [ ] `getLink()` - Get link by ID
- [ ] `updateLink()` - Update link
- [ ] `deleteLink()` - Delete link
- [ ] `linkStats()` - Get link statistics
- [ ] Tests for Links API
- [ ] Manual test scripts

### Phase 2.2 - Pixels API (v3.1.0)
- [ ] `pixels()` - List pixels
- [ ] `createPixel()` - Create pixel
- [ ] `getPixel()` - Get pixel by ID
- [ ] `updatePixel()` - Update pixel
- [ ] `deletePixel()` - Delete pixel
- [ ] `pixelStats()` - Get pixel statistics
- [ ] Tests for Pixels API
- [ ] Manual test scripts

### Phase 2.3 - Segments & Cohorts (v3.2.0 or later)
- [ ] Research API endpoints (not documented yet)
- [ ] `segments()` - List segments
- [ ] `createSegment()` - Create segment
- [ ] `getSegment()`, `updateSegment()`, `deleteSegment()`
- [ ] Cohorts methods (if API available)
- [ ] Tests for Segments/Cohorts
- [ ] Manual test scripts

### Phase 2.4 - Admin API (v3.2.0 or later)
- [ ] `adminWebsites()` - List all websites
- [ ] `adminUsers()` - List all users
- [ ] `adminTeams()` - List all teams
- [ ] Tests (require admin role)
- [ ] Hosted-mode only check

---

## 🔗 Resources

- [Links API Docs](https://umami.is/docs/api/links)
- [Pixels API Docs](https://umami.is/docs/api/pixels)
- [Umami v3 Release](https://github.com/umami-software/umami/releases/tag/v3.0.0)
- [Umami v3 Blog](https://umami.is/blog/umami-v3)

---

## 📊 Priority & Effort Estimation

| Feature | Priority | Effort | Target Version |
|---------|----------|--------|----------------|
| Links API | 🔴 High | 2 days | v3.1.0 |
| Pixels API | 🔴 High | 2 days | v3.1.0 |
| Segments API | 🟡 Medium | 3 days | v3.2.0 |
| Cohorts API | 🟡 Medium | 3 days | v3.2.0 |
| Admin API | 🟢 Low | 1 day | v3.2.0 |

**Total estimated effort**: ~11 days for complete v3 feature parity

---

**Last updated**: 2026-01-20
