# Migration Guide: v2.17.3 → v3.0.3

**umami-api-client** v3.0.3 targets **Umami v3.x API**

---

## ⚠️ Breaking Changes

### 1. **Version Alignment**

Client versions now **align with Umami server versions**:

| Client Version | Umami Server | Status |
|----------------|--------------|--------|
| v2.17.3 | Umami v2.17.x | ❌ EOL (stay on v2.17.3) |
| **v3.0.3** | **Umami v3.0.x** | ✅ **Current** |

**Migration path**:
- **Option A**: Stay on `umami-api-client@2.17.3` if using Umami v2.x
- **Option B**: Upgrade to `umami-api-client@3.0.3` if using Umami v3.x

### 2. **Deprecated Methods Removed**

All deprecated methods have been **removed** in v3.0.3:

| ❌ Removed (v2) | ✅ Use instead (v3) |
|----------------|---------------------|
| `getSites(authData)` | `websites()` |
| `getStats(authData, siteData, period)` | `websiteStats(siteId, period)` |
| `getStatsForLast24h(authData, siteData)` | `websiteStats(siteId, '24h')` |
| `getPageViews(authData, siteData, options, period)` | `websitePageViews(siteId, period, options)` |
| `getPageViewsForLast24h(authData, siteData, options)` | `websitePageViews(siteId, '24h', options)` |
| `getEvents(authData, siteData, options, period)` | `websiteEvents(siteId, period, options)` |
| `getEventsForLast24h(authData, siteData, options)` | `websiteEvents(siteId, '24h', options)` |
| `getMetrics(authData, siteData, options, period)` | `websiteMetrics(siteId, period, options)` |
| `getMetricsForLast24h(authData, siteData, options)` | `websiteMetrics(siteId, '24h', options)` |
| `getWebSiteDataForAPeriod(...)` | `websiteData(...)` |
| `verify()` | *(removed - unused)* |

**Migration example**:

```javascript
// v2.17.3 (deprecated)
const authData = await client.login(user, pass);
const sites = await client.getSites(authData);
const stats = await client.getStatsForLast24h(authData, sites[0]);

// v3.0.3 (clean API)
await client.login(user, pass);
const sites = await client.websites();
const stats = await client.websiteStats(sites[0].id, '24h');
```

### 3. **API Response Structure Changes**

Umami v3 API returns **different response structures**:

#### `websiteStats()` - Direct values (not objects)

**v2.17.x response** (Umami v2):
```javascript
{
  pageviews: { value: 100 },
  visitors: { value: 50 },
  visits: { value: 75 },
  bounces: { value: 10 }
}
```

**v3.0.x response** (Umami v3):
```javascript
{
  pageviews: 100,        // ← Direct number
  visitors: 50,
  visits: 75,
  bounces: 10,
  totaltime: 5000,
  comparison: {          // ← NEW: period comparison
    pageviews: 80,
    visitors: 40,
    visits: 60,
    bounces: 8,
    totaltime: 4000
  }
}
```

**Migration**:
```javascript
// v2 code
const stats = await client.websiteStats(siteId, '24h');
const views = stats.pageviews?.value || 0;

// v3 code (simpler!)
const stats = await client.websiteStats(siteId, '24h');
const views = stats.pageviews || 0;
const prevViews = stats.comparison?.pageviews || 0; // NEW: compare periods
```

#### `websitePageViews()` - Wrapped in object

**v2.17.x response** (Umami v2):
```javascript
[
  { x: "2026-01-19T00:00:00Z", y: 10 },
  { x: "2026-01-19T01:00:00Z", y: 15 }
]
```

**v3.0.x response** (Umami v3):
```javascript
{
  pageviews: [                    // ← Wrapped
    { x: "2026-01-19T00:00:00Z", y: 10 },
    { x: "2026-01-19T01:00:00Z", y: 15 }
  ],
  sessions: [                     // ← NEW: sessions timeline
    { x: "2026-01-19T00:00:00Z", y: 8 },
    { x: "2026-01-19T01:00:00Z", y: 12 }
  ]
}
```

**Migration**:
```javascript
// v2 code
const data = await client.websitePageViews(siteId, '24h');
data.forEach(point => console.log(point.y));

// v3 code
const result = await client.websitePageViews(siteId, '24h');
const pageviews = result.pageviews; // ← Access wrapper
pageviews.forEach(point => console.log(point.y));

// BONUS: sessions timeline now available
const sessions = result.sessions;
```

---

## ⚠️ Metric Type Changes

### `websiteMetrics()` - Type parameter renamed

Umami v3 renamed the `url` metric type to `path`:

**v2.17.x metric types** (Umami v2):
```javascript
await client.websiteMetrics(siteId, '24h', { type: 'url' });      // ← Works in v2
await client.websiteMetrics(siteId, '24h', { type: 'referrer' });
```

**v3.0.x metric types** (Umami v3):
```javascript
// ❌ FAILS in v3 - 400 Bad Request
await client.websiteMetrics(siteId, '24h', { type: 'url' });

// ✅ WORKS in v3 - Use 'path' instead
await client.websiteMetrics(siteId, '24h', { type: 'path' });     // ← Renamed!
await client.websiteMetrics(siteId, '24h', { type: 'referrer' });
```

**Available metric types in v3**:

**Event columns** (page-related metrics):
- ✅ `path` (was `url` in v2)
- ✅ `entry`
- ✅ `exit`
- ✅ `referrer`
- ✅ `domain`
- ✅ `title`
- ✅ `query`
- ✅ `event`
- ✅ `tag`
- ✅ `hostname`

**Session columns** (visitor-related metrics):
- ✅ `browser`
- ✅ `os`
- ✅ `device`
- ✅ `screen`
- ✅ `language`
- ✅ `country`
- ✅ `city`
- ✅ `region`

**Special types**:
- ✅ `channel` (new in v3)

**Migration**:
```javascript
// v2 code
const urlStats = await client.websiteMetrics(siteId, '24h', { type: 'url' });

// v3 code - Replace 'url' with 'path'
const pathStats = await client.websiteMetrics(siteId, '24h', { type: 'path' });
```

---

## ✅ Compatible (No Changes Required)

These methods have **identical responses** in v2 and v3:

- ✅ `me()` - User info
- ✅ `websites()` - Websites list
- ✅ `websiteEvents()` - Paginated `{data, count, page, pageSize}`
- ✅ `websiteSessions()` - Paginated `{data, count, page, pageSize}`

**Note**: `websiteMetrics()` is compatible but requires the `type` parameter update (see above).

---

## 🆕 New Features in v3

Umami v3 introduces **new tracking capabilities**:

- ✅ **Links** - Short URLs tracking (read-only, available now)
- 🔜 **Pixels** - Invisible image tracking (in development)
- 🔜 **Segments** - Save and reuse filter sets (in development)
- 🔜 **Admin API** - User/team management (in development, hosted only)

See [issue #43](https://github.com/boly38/umami-api-client/issues/43) for implementation status.

---

## 📦 Installation

```bash
# Umami v3 users
npm install umami-api-client@^3.0.3

# Umami v2 users (stay on v2)
npm install umami-api-client@^2.17.3
```

**Important**: Check your Umami server version before upgrading!

---

## 🧪 Testing Your Migration

### 1. Check Umami server version
- Cloud: Always latest (v3.x)
- Hosted: Check your deployment version

### 2. Update dependencies
```bash
npm install umami-api-client@^3.0.3
```

### 3. Update deprecated method calls
Search your code for:
- `getSites` → `websites`
- `getStats` → `websiteStats`
- `getPageViews` → `websitePageViews`
- etc.

### 4. Update response handling
- `websiteStats()`: Remove `.value` access
- `websitePageViews()`: Access `result.pageviews`

### 5. Run tests
```bash
npm test
```

---

## 🆘 Need Help?

- 📖 [Full API Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/boly38/umami-api-client/issues)
- 💬 [Discussions](https://github.com/boly38/umami-api-client/discussions)
- 📝 [Umami v3 Release Notes](https://umami.is/blog/umami-v3)

---

## 📊 Quick Reference

| Feature | v2.17.3 | v3.0.3 |
|---------|---------|--------|
| Umami v2.x support | ✅ | ❌ |
| Umami v3.x support | ❌ | ✅ |
| Deprecated methods | ⚠️ Working | ❌ Removed |
| Response structure | v2 format | v3 format |
| Version alignment | Unaligned | **Aligned with Umami** |

---

**Last updated**: 2026-01-19  
**Client version**: v3.0.3  
**Target Umami**: v3.0.x
