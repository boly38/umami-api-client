# umami-api-client - Agent Context

## Stack

NPM package (ESM) - Umami API Client **v3.0.3** (targets Umami v3.x API)  
Node.js | node-fetch, query-string, winston | Mocha, Chai, c8

## Principes

SOLID, KISS, DRY | Tests avant commit | pnpm only (sauf npm publish)

**Doc DRY/SRP**: 1 info = 1 endroit, utiliser liens (pas duplication)
- README.md: Quick Start + API ref
- MIGRATION_V3.md: Breaking changes v2→v3
- CHANGELOG.md: Historique versions
- CONTRIBUTING.md: Setup dev/release

## Workflow

1. Analyser existant
2. Méthode API → Auth headers → Fetch → Validation réponse
3. Tests Mocha (pas arrow functions: besoin `this.skip()`)
4. Test manuel: `pnpm run cloud|hosted`
5. Doc: JSDoc + mettre à jour fichier approprié (DRY/SRP)

## Structure

```
lib/export.js              ← Entry point (export UmamiClient)
src/UmamiClient.js         ← Classe principale
tests/*.test.js            ← Tests (10_negative, 20_hosted, 30_cloud)
tests/manual/              ← Samples (cloud_sample.js, host_sample.js)
env/initenv_*.template.sh  ← Config templates
```

## Commandes

```bash
pnpm install                               # Setup
pnpm test                                  # All tests
pnpm run ci-test                           # Tests + coverage c8
TST=30_env_based_cloud_umami pnpm run xtst # Test ciblé (Linux/Mac)
TST=30_env_based_cloud_umami pnpm run tst  # Test ciblé (Windows)
pnpm run cloud|hosted                      # Test manuel

# Debug (env vars)
UMAMI_CLIENT_DEBUG=true              # Global
UMAMI_CLIENT_DEBUG_REQUEST=true      # Requêtes
UMAMI_CLIENT_DEBUG_RESPONSE=true     # Réponses
```

## MCP IntelliJ

Priorité outils IDE: Refactor, Search, Navigate, Git UI  
Éviter: scripts bash (sed/awk/grep), npm (utiliser pnpm)

**Modification fichiers problématiques**:  
Si échec modification directe → Créer fichier temporaire + `mv` :  
```bash
cp original.md original_TEMP.md  # ou créer nouveau contenu
# ... modifications ...
rm original.md
mv original_TEMP.md original.md
```

## Conventions

Branches: `feature/xxx`, `fix/xxx`  
Commits/Code: Anglais (open-source)  
ESM: imports `.js` explicites  
Versioning: Semver (2.x.x=v2, 3.x.x=v3)  
Publish: `npm publish` (CI doit être OK)

## API UmamiClient

**Modes**: Cloud (`UMAMI_CLOUD_API_KEY` → `api.umami.is/v1`) | Hosted (`UMAMI_SERVER`+creds → `<server>/api`)  
**Périodes**: `1h`, `1d`, `7d`, `30d`, `31d` (variantes: `24h`, `1week`...)

**Méthodes** (READ-ONLY):
```javascript
// Auth
new UmamiClient({cloudApiKey, server}) // Auto-détection mode
login(user, pass)                      // Hosted only
me()                                   // Cloud only

// Websites
websites()                             // Liste sites
websiteStats(id, period, options)
websitePageViews(id, period, options)
websiteMetrics(id, period, options)   // type: path|event|referrer|browser|os|device|country|...
websiteEvents(id, period, options)
websiteSessions(id, period, options)

// Links (v3.x) - Short URLs tracking
links(options)                         // Liste short URLs (page, pageSize, search)
getLink(linkId)                        // Détails link
linkStats(linkId, period, options)     // Stats link
```

**v3 Breaking**: Deprecated v2 methods removed. See [MIGRATION_V3.md](../MIGRATION_V3.md)

## Références

`src/UmamiClient.js`, `tests/TestsReadme.md`, `CONTRIBUTING.md`  
Issues: [#43 v3](https://github.com/boly38/umami-api-client/issues/43), [#42 getVersion](https://github.com/boly38/umami-api-client/issues/42)
