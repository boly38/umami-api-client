# umami-api-client - Agent Context

## Stack

NPM package (ESM) - Umami API Client v2.17.3 → v3.x.x  
Node.js | node-fetch, query-string, winston | Mocha, Chai, c8

## Principes

SOLID, KISS, DRY | Tests avant commit | pnpm only (sauf npm publish)

## Workflow

1. Analyser existant
2. Méthode API → Auth headers → Fetch → Validation réponse
3. Tests Mocha (pas arrow functions: besoin `this.skip()`)
4. Test manuel: `pnpm run cloud|hosted`
5. Doc: README + JSDoc méthodes publiques

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
pnpm install               # Setup
pnpm test                  # Tests
pnpm run ci-test           # Tests + coverage c8
TST=20_env pnpm run tst    # Test ciblé
pnpm run cloud|hosted      # Test manuel

# Debug (env vars)
UMAMI_CLIENT_DEBUG=true              # Global
UMAMI_CLIENT_DEBUG_REQUEST=true      # Requêtes
UMAMI_CLIENT_DEBUG_RESPONSE=true     # Réponses
```

## MCP IntelliJ

Priorité outils IDE: Refactor, Search, Navigate, Git UI  
Éviter: scripts bash (sed/awk/grep), npm (utiliser pnpm)

## Conventions

Branches: `feature/xxx`, `fix/xxx`  
Commits/Code: Anglais (open-source)  
ESM: imports `.js` explicites  
Versioning: Semver (2.x.x=v2, 3.x.x=v3)  
Publish: `npm publish` (CI doit être OK)

## API UmamiClient

**Modes**: Cloud (`UMAMI_CLOUD_API_KEY` → `api.umami.is/v1`) | Hosted (`UMAMI_SERVER`+creds → `<server>/api`)  
**Périodes**: `1h`, `1d`, `7d`, `30d`, `31d` (variantes: `24h`, `1week`...)

**Méthodes**:
```javascript
new UmamiClient({cloudApiKey, server}) // Auto-détection mode
login(user, pass)                      // Hosted only
me()                                   // Cloud only
websites()                             // Liste sites
websiteStats(id, period, options)
websitePageViews(id, period, options)
websiteMetrics(id, period, options)   // type: url|event
websiteEvents(id, period, options)
websiteSessions(id, period, options)
```

**Déprécié v2 (à supprimer v3)**: `getSites()`, `getStats()`, `getPageViews()`... (cf. `//~ DEPRECATED WORLD`)

## Références

`src/UmamiClient.js`, `tests/TestsReadme.md`, `CONTRIBUTING.md`  
Issues: [#43 v3](https://github.com/boly38/umami-api-client/issues/43), [#42 getVersion](https://github.com/boly38/umami-api-client/issues/42)
