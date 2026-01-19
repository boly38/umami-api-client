# Issue: Umami v3.x API Support

**Source**: [GitHub Issue #43](https://github.com/boly38/umami-api-client/issues/43)  
**Statut**: 🚧 En cours  
**Priorité**: High  
**Effort estimé**: 2-3 jours

---

## Contexte

- **Version actuelle**: `umami-api-client` v2.17.3 → cible Umami v2.17.x
- **Version cible**: `umami-api-client` **v3.0.0** → Umami v3.0.3+ ONLY
- **⚠️ BREAKING CHANGE**: Pas de rétro-compatibilité v2 (KISS principle)
- **Release notes v3**: https://github.com/umami-software/umami/releases/tag/v3.0.0
- **Blog post v3**: https://umami.is/blog/umami-v3

**Decision**: Clean break → v3 only. Users needing v2 stay on `2.17.3`.

---

## Breaking Changes Umami v3

### Base de données
- ❌ **MySQL abandonné** (PostgreSQL only)

### Nouvelles features v3
- ✅ Links tracking (`/api/links`)
- ✅ Pixels tracking (`/api/pixels`)
- ✅ Segments (`/api/segments`)
- ✅ Cohorts
- ✅ Attribution reports
- ✅ Distinct IDs (identification sessions)
- ✅ Admin page (`/api/admin`)

### Changements API
- Nouvelle structure endpoints
- Schémas réponses modifiés
- Nouveaux paramètres filtres (query string universal)

---

## Plan d'action

### ✅ Phase 1: Compatibilité API v3 - **COMPLÈTE**

- [x] **Tester méthodes actuelles contre Umami v3.0.3**
  - [x] `me()`, `websites()`, `websiteEvents()`, `websiteSessions()` - ✅ Compatible
  - [x] `websiteStats()` - ⚠️ BREAKING (docé)
  - [x] `websitePageViews()` - ⚠️ BREAKING (docé)
  - [x] `websiteMetrics()` - ⚠️ type `url`→`path` (fixé)
  
- [x] **Breaking change: Metric type `url` → `path`**
  - Umami v3 renamed `url` to `path` in EVENT_COLUMNS
  - Fixed: Default type in `websiteMetrics()` changed to `path`
  - Tests updated: All `type: 'url'` → `type: 'path'`
  - Ref: [Umami constants.ts](https://github.com/umami-software/umami/blob/master/src/lib/constants.ts)
  
- [x] **Documentation complète**
  - [x] `MIGRATION_V3.md` créé (breaking changes détaillés)
  - [x] `CHANGELOG.md` créé (historique versions)
  - [x] README.md mis à jour (version notice + lien migration)
  - [x] `.github/breaking_changes_v3.md` (analyse technique)
  
- [x] **Code nettoyé**
  - [x] Supprimé méthodes dépréciées: `getSites()`, `getStats()`, `getPageViews()`, `getEvents()`, `getMetrics()`, `verify()`
  - [x] Tests 11/11 passent (hosted + cloud)
  - [x] Test login err format v3

**✅ Phase 1 = v3.0.3 publiable**

### ✅ Phase 2: Nouvelles méthodes (features v3)

**Status**: 📋 Ready to start (après Phase 1)  
**Priority**: Medium  
**Effort**: 2-3 days  
**Version cible**: v3.1.0 (post v3.0.0)

#### 🔗 Links API - Track short URLs and redirects

**Endpoints**:
- [ ] `links(options)` - GET /api/links
- [ ] `createLink(data)` - POST /api/links
- [ ] `getLink(linkId)` - GET /api/links/:linkId
- [ ] `updateLink(linkId, data)` - POST /api/links/:linkId
- [ ] `deleteLink(linkId)` - DELETE /api/links/:linkId
- [ ] `linkStats(linkId, period, options)` - GET /api/links/:linkId/stats

**Data structure**:
```javascript
// createLink
{
  url: "https://example.com/long-url",
  description: "My link"
}

// Response
{
  id: "uuid",
  url: "https://example.com/long-url",
  description: "My link",
  createdAt: "2025-01-19T..."
}
```

**Tests**:
- [ ] Create link
- [ ] List links
- [ ] Get link stats
- [ ] Update/Delete link

---

#### 📊 Pixels API - Track with invisible images

Track email open rates, external sites.

**Endpoints**:
- [ ] `pixels(options)` - GET /api/pixels
- [ ] `createPixel(data)` - POST /api/pixels
- [ ] `getPixel(pixelId)` - GET /api/pixels/:pixelId
- [ ] `updatePixel(pixelId, data)` - POST /api/pixels/:pixelId
- [ ] `deletePixel(pixelId)` - DELETE /api/pixels/:pixelId
- [ ] `pixelStats(pixelId, period, options)` - GET /api/pixels/:pixelId/stats

**Data structure**:
```javascript
// createPixel
{
  websiteId: "uuid",
  name: "Newsletter open tracker"
}

// Response
{
  id: "uuid",
  websiteId: "uuid",
  name: "Newsletter open tracker",
  createdAt: "2025-01-19T..."
}
```

**Tests**:
- [ ] Create pixel
- [ ] List pixels
- [ ] Get pixel stats
- [ ] Update/Delete pixel

---

#### 🎯 Segments API - Save and reuse filter sets

**Endpoints**:
- [ ] `segments(options)` - GET /api/segments
- [ ] `createSegment(data)` - POST /api/segments
- [ ] `getSegment(segmentId)` - GET /api/segments/:segmentId
- [ ] `updateSegment(segmentId, data)` - POST /api/segments/:segmentId
- [ ] `deleteSegment(segmentId)` - DELETE /api/segments/:segmentId

**Data structure**:
```javascript
// createSegment
{
  websiteId: "uuid",
  name: "Windows users from US",
  filters: {
    os: "Windows",
    country: "US"
  }
}
```

**Tests**:
- [ ] Create segment
- [ ] List segments
- [ ] Apply segment as filter
- [ ] Update/Delete segment

---

#### 👨‍💼 Admin API (optional)

Admin-only endpoints for user/team/website management.

**Endpoints**:
- [ ] `adminWebsites(options)` - GET /api/admin/websites
- [ ] `adminUsers(options)` - GET /api/admin/users
- [ ] `adminTeams(options)` - GET /api/admin/teams

**Requirements**:
- Admin role required
- Only for Hosted mode (Cloud has no admin API)

**Tests**:
- [ ] List all websites (admin)
- [ ] List all users (admin)
- [ ] Check permission denied for non-admin

---

#### 📝 Implementation Pattern

All methods follow same pattern as existing endpoints:

```javascript
// In src/UmamiClient.js

async links(options = { page: 1, pageSize: 10 }) {
    const headers = this.authHeaders();
    const url = `${this.umamiBaseUrl}/links?` + queryString.stringify(options);
    const response = await fetch(url, { headers });
    await assumeResponseSuccess(response, 'Unable to get links');
    return await response.json();
}

async createLink(data) {
    const headers = { ...this.authHeaders(), 'Content-Type': 'application/json' };
    const response = await fetch(`${this.umamiBaseUrl}/links`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });
    await assumeResponseSuccess(response, 'Unable to create link');
    return await response.json();
}

// etc...
```

### ✅ Phase 3: Enhanced Features

- [ ] **Distinct ID support**
  - [ ] Ajouter paramètre `distinctId` dans méthodes tracking
  - [ ] Documenter usage

- [ ] **Nouveaux filtres query string**
  - [ ] Adapter méthodes existantes pour nouveaux params v3
  - [ ] Documenter nouveaux filtres

- [ ] **Attribution reports**
  - [ ] Implémenter méthode `attributionReport()`
  - [ ] Documenter paramètres

### ✅ Phase 4: Tests

- [ ] **Mettre à jour mocks tests**
  - [ ] Adapter réponses mockées v3
  - [ ] Vérifier structure données

- [ ] **Nouvelle suite tests v3**
  - [ ] `tests/40_v3_links.test.js` (Links API)
  - [ ] `tests/41_v3_pixels.test.js` (Pixels API)
  - [ ] `tests/42_v3_segments.test.js` (Segments API)
  - [ ] `tests/43_v3_admin.test.js` (Admin API)
  - [ ] `tests/44_v3_methods.test.js` (distinct ID, attribution)

- [ ] **Tests manuels**
  - [ ] `tests/manual/test_v3_links.js`
  - [ ] `tests/manual/test_v3_pixels.js`
  - [ ] `tests/manual/test_v3_segments.js`

- [ ] **Tests réels**
  - [ ] Tester contre instance Umami Cloud v3
  - [ ] Tester contre instance Umami Hosted v3.0.3

### ✅ Phase 5: Release

- [ ] **Documentation**
  - [ ] Mettre à jour README.md:
    - [ ] ⚠️ BREAKING CHANGE notice (v3 only, no v2 support)
    - [ ] Migration guide v2 → v3 (stay on 2.17.3 or upgrade)
    - [ ] Nouvelles features v3 (Links, Pixels, Segments)
    - [ ] New methods section (Links, Pixels, Segments)
    - [ ] Usage examples for new features
  - [ ] Documenter nouvelles méthodes (JSDoc)
  - [ ] CHANGELOG.md avec breaking changes
  - [ ] Mettre à jour `MIGRATION_V3.md` avec nouvelles features

- [ ] **Versioning**
  - [ ] v3.0.0 - Base v3 compatibility + breaking changes fixes
  - [ ] v3.1.0 - New features (Links, Pixels, Segments, Admin)
  - [ ] Bump version `package.json` selon phase
  - [ ] Supprimer code déprécié (`//~ DEPRECATED WORLD`)
  - [ ] Nettoyer anciens workarounds v2

- [ ] **Publication**
  - [ ] `npm publish` v3.0.0 (base compatibility)
  - [ ] `npm publish` v3.1.0 (new features)
  - [ ] Créer GitHub Release v3.0.0
  - [ ] Créer GitHub Release v3.1.0
  - [ ] Release notes: breaking changes + migration guide
  - [ ] Release notes v3.1.0: new features
  - [ ] Mettre à jour dépendants (action-umami-report)

---

## Endpoints API v3 à implémenter

```javascript
// Links
GET    /api/links                    → links()
POST   /api/links                    → createLink(data)
GET    /api/links/:linkId            → getLink(linkId)
POST   /api/links/:linkId            → updateLink(linkId, data)
DELETE /api/links/:linkId            → deleteLink(linkId)
GET    /api/links/:linkId/stats      → linkStats(linkId, period, options)

// Pixels
GET    /api/pixels                   → pixels()
POST   /api/pixels                   → createPixel(data)
GET    /api/pixels/:pixelId          → getPixel(pixelId)
POST   /api/pixels/:pixelId          → updatePixel(pixelId, data)
DELETE /api/pixels/:pixelId          → deletePixel(pixelId)
GET    /api/pixels/:pixelId/stats    → pixelStats(pixelId, period, options)

// Segments
GET    /api/segments                 → segments()
POST   /api/segments                 → createSegment(data)
GET    /api/segments/:segmentId      → getSegment(segmentId)
POST   /api/segments/:segmentId      → updateSegment(segmentId, data)
DELETE /api/segments/:segmentId      → deleteSegment(segmentId)

// Admin (optionnel)
GET    /api/admin/websites           → adminWebsites()
GET    /api/admin/users              → adminUsers()
GET    /api/admin/teams              → adminTeams()
```

---

## ✅ Décisions prises (KISS)

### 1. Versioning: **3.0.0** → **3.1.0** (staged release)
- ✅ **v3.0.0** - Base compatibility (breaking changes fixes)
- ✅ **v3.1.0** - New features (Links, Pixels, Segments)
- ✅ **v3 ONLY** - Pas de rétro-compatibilité v2
- ✅ Clean break, align avec Umami v3
- ✅ Code simple (pas de dual support)
- 📌 Users v2 **restent sur `2.17.3`**

### 2. Support v2: **ABANDONNÉ**
- ❌ Pas de maintenance v2.17.x
- ❌ Pas de patches v2 (sauf sécurité critique)
- 📌 Branch `v2` gelée sur 2.17.3

### 3. Migration
- README: **BREAKING CHANGE** notice bien visible
- Guide migration: "Stay on 2.17.3 OR upgrade to 3.0.0"
- Pas de période transition dual support

---

## Ressources

- [Umami v3 Blog Post](https://umami.is/blog/umami-v3)
- [Umami API Docs](https://umami.is/docs/api)
- [Umami v3 Releases](https://github.com/umami-software/umami/releases?q=v3)
- [Links API Docs](https://umami.is/docs/api/links)
- [Pixels API Docs](https://umami.is/docs/api/pixels)
- [Segments Docs](https://umami.is/docs/segments)
- [Issue #42 - getVersion()](https://github.com/boly38/umami-api-client/issues/42)

---

## Checkboxes globales

- [ ] Phase 1: Compatibilité API v3 (tests, breaking changes, cleanup v2) → **v3.0.0**
- [ ] Phase 2: Nouvelles méthodes (Links, Pixels, Segments, Admin) → **v3.1.0**
- [ ] Phase 3: Enhanced features (Distinct ID, filters, attribution) → **v3.1.0**
- [ ] Phase 4: Tests (mocks v3, suite tests, tests réels)
- [ ] Phase 5: Release 3.0.0 (doc BREAKING, cleanup, publish)
- [ ] Phase 5: Release 3.1.0 (new features doc, publish)
- [ ] Migration guide (v2.17.3 vs v3.0.0 vs v3.1.0)
- [ ] Issue fermée ✅

---

**Date création**: 2026-01-19  
**Dernière mise à jour**: 2026-01-19  
**Assigné**: @boly38
