# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.3] - 2026-01-19

### ⚠️ BREAKING CHANGES

**This version targets Umami v3.x API only. Not compatible with Umami v2.x.**

📚 **Full migration guide**: [MIGRATION_V3.md](./MIGRATION_V3.md)

### Added

- **Links API (Umami v3.x)** - Read-only support for short URL tracking:
  - `links(options)` - List all links (paginated)
  - `getLink(linkId)` - Get link details
  - `linkStats(linkId, period, options)` - Get link statistics
  - Tests: `tests/40_links_api.test.js` (12 passing)
  - Documentation: README.md with API methods and usage examples

- **Pixels API (Umami v3.x)** - Read-only support for pixel tracking:
  - `pixels(options)` - List all pixels (paginated)
  - `getPixel(pixelId)` - Get pixel details
  - `pixelStats(pixelId, period, options)` - Get pixel statistics
  - Tests: `tests/50_pixels_api.test.js` (12 passing)
  - Documentation: README.md with API methods and usage examples

⚠️ **Note**: Links and Pixels APIs are **read-only**. Write operations (create/update/delete) are not implemented. Use Umami web UI for management.

### Changed

- **API alignment**: Client version now aligns with Umami server version (v3.0.3 → Umami v3.x)
- **`websiteMetrics()`**: Default metric type changed from `url` to `path` (Umami v3 renamed this type)
- **Response structures**: Adapted to match Umami v3 API responses:
  - `websiteStats()`: Returns direct values instead of objects (e.g., `pageviews: 100` not `pageviews: {value: 100}`)
  - `websitePageViews()`: Returns wrapped object with `pageviews` and `sessions` properties
  - Login error format updated for Umami v3

### Removed

- **Deprecated methods** (use modern equivalents):
  - `getSites()` → use `websites()`
  - `getStats()` → use `websiteStats()`
  - `getStatsForLast24h()` → use `websiteStats(id, '24h')`
  - `getPageViews()` → use `websitePageViews()`
  - `getPageViewsForLast24h()` → use `websitePageViews(id, '24h')`
  - `getEvents()` → use `websiteEvents()`
  - `getEventsForLast24h()` → use `websiteEvents(id, '24h')`
  - `getMetrics()` → use `websiteMetrics()`
  - `getMetricsForLast24h()` → use `websiteMetrics(id, '24h')`
  - `getWebSiteDataForAPeriod()` → use `websiteData()`
  - `verify()` → removed (unused)

### Fixed

- Test suite updated for Umami v3 API compatibility (35 tests passing total)
- Metric type `url` replaced with `path` in all tests and documentation
- Tests now use opt-out pattern (`UMAMI_TEST_LINKS=false` to skip instead of opt-in)

### Out of Scope

The following Umami v3 features are **NOT implemented** in this client:
- ❌ Segments API - Use Umami UI
- ❌ Cohorts - Use Umami UI
- ❌ Admin API - Use Umami UI
- ❌ Write operations on Links/Pixels - Use Umami UI

### Migration

**If you're using Umami v2.x**: Stay on `umami-api-client@2.17.3`

**If you're using Umami v3.x**: Upgrade to `umami-api-client@3.0.3` and follow the [Migration Guide](./MIGRATION_V3.md)

---

## [2.17.3] - 2024-12-XX

### Changed

- Last version supporting Umami v2.x API
- All deprecated methods still available but marked for removal in v3

### Deprecated

- All `get*()` methods deprecated in favor of modern `website*()` equivalents

---

## [2.17.0] - 2024-XX-XX

### Added

- Support for Umami v2.17.x API
- Modern API methods: `websites()`, `websiteStats()`, `websitePageViews()`, etc.

### Deprecated

- Legacy methods marked as deprecated (still functional)

---

## Earlier versions

See [GitHub Releases](https://github.com/boly38/umami-api-client/releases) for older version history.

---

## Version Support Matrix

| umami-api-client | Umami Server | Status | Notes |
|------------------|--------------|--------|-------|
| **3.0.3+** | **Umami v3.x** | ✅ **Current** | Breaking changes from v2 |
| 2.17.3 | Umami v2.x | ⚠️ **EOL** | No new features, security fixes only |
| < 2.17.0 | Umami v2.x | ❌ **Unsupported** | Upgrade recommended |

---

**Legend**:
- ✅ Current - Actively maintained
- ⚠️ EOL - End of Life, minimal support
- ❌ Unsupported - No support

