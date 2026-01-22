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

### ✅ Phase 2: Nouvelles méthodes (features v3) - READ-ONLY

**Status**: ✅ **Partiel - Links & Pixels implémentés**  
**Priority**: Medium  
**Effort**: 1-2 days (Links & Pixels done)  
**⚠️ SCOPE**: Read-only APIs only (no write operations)  
**📦 Implemented**: Links API ✅ | Pixels API ✅  
**🚧 Pending**: Segments API, Cohorts, Admin API (not planned for now)

#### ✅ Links API - Read short URLs and redirects stats

**Endpoints** (READ-ONLY):
- [x] `links(options)` - GET /api/links
- [x] `getLink(linkId)` - GET /api/links/:linkId
- [x] `linkStats(linkId, period, options)` - Alias for websiteStats (links use GET /api/websites/:linkId/stats)

**Architecture Note**: In Umami v3, links reuse the websites stats infrastructure. The `linkId` serves as `websiteId` in the stats endpoint. `linkStats()` is an alias for `websiteStats()` for semantic clarity.

**Data structure**:
```javascript
// Response from links()
[
  {
    id: "uuid",
    url: "https://example.com/long-url",
    description: "My link",
    createdAt: "2025-01-19T..."
  }
]
```

**Tests**:
- [x] List links
- [x] Get link details
- [x] Get link stats
- [x] Manual test script (`tests/manual/test_links.js`)
- [x] Unit tests (`tests/40_links_api.test.js`)

**Documentation**:
- [x] JSDoc comments in `UmamiClient.js`
- [x] README.md updated (API methods + usage examples)
- [x] agent.md updated (methods reference)

---

#### ✅ Pixels API - Read pixel tracking stats

Read email open rates, external sites tracking data.

**Endpoints** (READ-ONLY):
- [x] `pixels(options)` - GET /api/pixels
- [x] `getPixel(pixelId)` - GET /api/pixels/:pixelId
- [x] `pixelStats(pixelId, period, options)` - GET /api/pixels/:pixelId/stats

**Data structure**:
```javascript
// Response from pixels()
[
  {
    id: "uuid",
    websiteId: "uuid",
    name: "Newsletter open tracker",
    createdAt: "2025-01-19T..."
  }
]
```

**Tests**:
- [x] List pixels
- [x] Get pixel details
- [x] Get pixel stats
- [x] Manual test script (`tests/manual/test_pixels.js`)
- [x] Unit tests (`tests/41_pixels_api.test.js`)

**Documentation**:
- [x] JSDoc comments in `UmamiClient.js`
- [x] README.md updated (API methods + usage examples)
- [x] agent.md updated (methods reference)

**✅ Tests validés**:
- [x] Tests activés par défaut (opt-out avec `UMAMI_TEST_PIXELS=false`)
- [x] 12 tests passent avec pixels réels
- [x] Validation regex messages d'erreur corrigée
- [x] Support API retournant `null` pour ressources inexistantes

---

## ❌ Out of Scope (Not Implemented)

### Umami v3 Features NOT in this client:
- **Segments API** - Use Umami UI
- **Cohorts** - Use Umami UI
- **Admin API** - Use Umami UI
- **Attribution reports** - Use Umami UI
- **Distinct IDs** - Not implemented
- **Write operations** (POST/PUT/DELETE) on Links/Pixels - Read-only client

---

## ✅ Décisions prises (KISS)

### 1. Versioning: **v3.0.3** (single release)
- ✅ **v3.0.3** - Base compatibility + Links API + Pixels API
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

- [x] Phase 1: Compatibilité API v3 (tests, breaking changes, cleanup v2)
- [x] Phase 2: Links & Pixels API (Read-only)
- [x] Migration guide v2 → v3
- [x] Documentation complète (README, JSDoc, examples)
- [x] Tests validés (40_links, 50_pixels)
- [ ] CHANGELOG.md à compléter pour v3.0.3
- [ ] Publication npm v3.0.3
- [ ] Issue fermée ✅

---

**Date création**: 2026-01-19  
**Dernière mise à jour**: 2026-01-19 (Phase 2 partiellement complète: Links ✅ Pixels ✅)  
**Assigné**: @boly38
