# Breaking Changes v2 → v3

**Date**: 2026-01-19  
**Test source**: `tests/manual/test_v3_cloud_auth.js`

---

## ✅ Compatible (no changes)

### Authentication
- ✅ `me()` - Structure identique
- ✅ `login()` - Non testé mais devrait être OK

### Websites
- ✅ `websites()` - Structure identique
  ```javascript
  { id, name, domain, createdAt, ... }
  ```

---

## ❌ Breaking Changes

### 1. `websiteStats()` - Structure réponse modifiée

**v2.17.x** (ancien):
```javascript
{
  pageviews: { value: 3 },
  visitors: { value: 3 },
  visits: { value: 3 },
  bounces: { value: 3 }
}
```

**v3.0.x** (nouveau):
```javascript
{
  pageviews: 3,        // Valeur directe (plus d'objet .value)
  visitors: 3,
  visits: 3,
  bounces: 3,
  totaltime: 0,
  comparison: {        // NOUVEAU: comparaison période précédente
    pageviews: 1,
    visitors: 1,
    visits: 1,
    bounces: 1,
    totaltime: 0
  }
}
```

**Impact**:
- ❌ Code accédant à `stats.pageviews.value` → **ERREUR**
- ✅ Solution: accéder directement à `stats.pageviews`

**Migration**:
```javascript
// v2
const views = stats.pageviews?.value || stats.pageviews || 0;

// v3 (simplifié)
const views = stats.pageviews || 0;
```

---

## 🔍 Tests effectués

### ✅ Endpoints testés (Cloud mode)
- [x] `websiteStats()` - ⚠️ BREAKING (values direct, comparison added)
- [x] `websitePageViews()` - ⚠️ BREAKING (wrapped in object)
- [x] `websiteMetrics(type: url)` - ✅ Compatible
- [x] `websiteMetrics(type: event)` - ✅ Compatible
- [x] `websiteEvents()` - ✅ Compatible
- [x] `websiteSessions()` - ✅ Compatible

### Mode Hosted
- [ ] `login()` - Fonctionne avec v3 ?
- [ ] Endpoints identiques à Cloud ?

### 2. `websitePageViews()` - Structure wrappée

**v2.17.x** (supposé - à confirmer):
```javascript
[
  { x: "2026-01-19T02:00:00Z", y: 1 },
  { x: "2026-01-19T03:00:00Z", y: 1 }
]
```

**v3.0.x** (confirmé):
```javascript
{
  pageviews: [
    { x: "2026-01-19T02:00:00Z", y: 1 },
    { x: "2026-01-19T03:00:00Z", y: 1 }
  ],
  sessions: [        // NOUVEAU: sessions timeline
    { x: "2026-01-19T02:00:00Z", y: 1 },
    { x: "2026-01-19T03:00:00Z", y: 1 }
  ]
}
```

**Impact**:
- ❌ Code attendant un Array direct → **ERREUR**
- ✅ Solution: accéder à `result.pageviews`

**Migration**:
```javascript
// v2
const data = await client.websitePageViews(id, period);
data.forEach(point => console.log(point.y));

// v3
const result = await client.websitePageViews(id, period);
const data = result.pageviews;  // ← Access wrapper
data.forEach(point => console.log(point.y));
```

---

## ✅ Compatible (no changes needed)

### 1. `websiteMetrics()` - Structure maintenue
```javascript
// v2 & v3 identique
[
  { x: "/page/url", y: 1 },
  { x: "/other/page", y: 5 }
]
```

### 2. `websiteEvents()` - Structure paginée maintenue
```javascript
// v2 & v3 identique
{
  data: [...],
  count: 3,
  page: 1,
  pageSize: 10
}
```

### 3. `websiteSessions()` - Structure paginée maintenue
```javascript
// v2 & v3 identique
{
  data: [...],
  count: 3,
  page: 1,
  pageSize: 5
}
```

---

## 📊 Test results

**Cloud mode v3.0.x**:
```
✅ me() - OK (compatible)
✅ websites() - OK (compatible)
⚠️  websiteStats() - BREAKING (values direct + comparison field)
⚠️  websitePageViews() - BREAKING (wrapped in object + sessions)
✅ websiteMetrics() - OK (compatible)
✅ websiteEvents() - OK (compatible)
✅ websiteSessions() - OK (compatible)

Success rate: 67% compatible, 33% breaking changes
```

**Test files**: 
- `tests/manual/test_v3_cloud_auth.js`
- `tests/manual/test_v3_cloud_endpoints.js`

**Test date**: 2026-01-19  
**Umami Cloud version**: v3.0.x
**Output log**: `test_v3_output.log`
