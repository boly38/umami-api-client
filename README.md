# umami-api-client

[![NPM](https://nodei.co/npm/umami-api-client.png?compact=true)](https://npmjs.org/package/umami-api-client)

Umami [ReST API](https://umami.is/docs/api) client for Node.js.

## ⚠️ Version Notice

**Current version: v3.0.3** - Targets **Umami v3.x API**

| umami-api-client | Umami Server   | Status        |
|------------------|----------------|---------------|
| **v3.0.3**       | **Umami v3.x** | ✅ **Current** |
| v2.17.3          | Umami v2.x     | ❌ EOL         |

📚 **[Migration Guide v2 → v3](./MIGRATION_V3.md)** - Breaking changes & upgrade instructions

---

## Features

- ✅ **Dual mode**: Umami Cloud (API key) & Hosted (login/password)
- ✅ **Read-only API**: Retrieve websites, stats, pageviews, events, metrics, sessions, links
- ✅ **Periods**: `1h`, `24h`, `7d`, `1w`, `30d`, `1m`
- ✅ **v3 compatible**: Works with Umami v3.0.x API
- ✅ **Links API**: Track short URLs and redirects (read-only)
- 🔜 **More v3 features**: Pixels, Segments read APIs (in development)

### Current Limitations
- ❌ No website creation/modification/deletion
- ❌ No user/team management
- ❌ No event tracking (send events to Umami)
- ❌ No write operations on Links/Pixels/Segments (read-only when implemented)

## Installation

```bash
npm install umami-api-client@^3.0.3
# or
pnpm add umami-api-client@^3.0.3
```

**Upgrading from v2.x?** Read the **[Migration Guide](./MIGRATION_V3.md)**

---

## Quick Start

### Umami Cloud (API Key)
Umami Cloud: https://cloud.umami.is/ ([Get your API key](https://cloud.umami.is/api-keys))
````javascript
import UmamiClient from 'umami-api-client';

const doIt = async () => {
    try {
        const client = new UmamiClient();
        // default is // new UmamiClient({cloudApiKey:process.env.UMAMI_CLOUD_API_KEY});
        const identity = await client.me();
        console.log(`🔑 Api key details:\n${JSON.stringify(identity?.user,null,2)}`);

        const sitesData = await client.websites();
        const filteredSitesData = sitesData.map(({ id, name, createdAt, domain }) => ({ id, name, createdAt, domain }));
        console.log("🗂️ List of Tracked Websites:");
        console.table(filteredSitesData);

        const websiteStats = await client.websiteStats(sitesData[0].id);
        console.log(`📊 Website Stats for: ${sitesData[0].name}`);
        console.table(websiteStats);
    } catch(error) {
        console.error(error);
    }
};

doIt().then(r => {});
````

### Umami Hosted (Self-hosted)

Self-hosted Umami instance with login/password authentication.
````javascript
import UmamiClient from 'umami-api-client';

const doIt = async () => {
    try {
        const client = new UmamiClient();
        // default is // new UmamiClient({server:process.env.UMAMI_SERVER});
        await client.login();
        // default is // client.login(process.env.UMAMI_USER, process.env.UMAMI_PASSWORD)
        const sitesData = await client.websites();
        const filteredSitesData = sitesData.map(({ id, name, createdAt, domain }) => ({ id, name, createdAt, domain }));
        console.log("🗂️ List of Tracked Websites:");
        console.table(filteredSitesData);

        const websiteStats = await client.websiteStats(sitesData[0].id);
        console.log(`📊 Website Stats for: ${sitesData[0].name}`);
        console.table(websiteStats);
    } catch(error) {
        console.error(error);
    }
};

doIt().then(r => {});
````

### Explicit Configuration (no env vars)

```javascript
// Cloud mode
const client = new UmamiClient({ cloudApiKey: 'your-api-key' });

// Hosted mode
const client = new UmamiClient({ server: 'https://umami.example.com' });
await client.login('admin', 'password');
```

---

## API Methods

### Authentication
- `me()` - Get user info (Cloud mode)
- `login(username, password)` - Login (Hosted mode)
- `logout()` - Logout (Hosted mode)

### Websites
- `websites()` - List all websites
- `selectSiteByDomain(sites, domain)` - Select site by domain

### Statistics
- `websiteStats(websiteId, period, options)` - Get website stats
- `websitePageViews(websiteId, period, options)` - Get pageviews timeline
- `websiteMetrics(websiteId, period, options)` - Get metrics (urls, referrers, browsers, etc.)
- `websiteEvents(websiteId, period, options)` - Get events (paginated)
- `websiteSessions(websiteId, period, options)` - Get sessions (paginated)

### Links (Umami v3.x)
- `links(options)` - List all links (short URLs)
- `getLink(linkId)` - Get link details
- `linkStats(linkId, period, options)` - Get link statistics (alias for `websiteStats`)

> **📝 Note**: In Umami v3, links use the websites stats endpoint. `linkStats()` is an alias for `websiteStats()` where `linkId` serves as `websiteId`.

### Periods
Accepted values: `1h`, `24h`, `7d`, `1w`, `30d`, `1m`

### Usage Examples

#### Links API
```javascript
import UmamiClient from 'umami-api-client';

const client = new UmamiClient();
await client.login(); // or use cloud API key

// Get all links
const linksData = await client.links({ page: 1, pageSize: 10 });
console.log(`Total links: ${linksData.data.length}`);

// Get specific link
const linkId = linksData.data[0].id;
const linkDetails = await client.getLink(linkId);
console.log(`Link URL: ${linkDetails.url}`);

// Get link statistics (uses /api/websites/:linkId/stats)
const stats = await client.linkStats(linkId, '7d', { unit: 'day' });
console.log('Link stats:', stats);

// Alternative: use websiteStats() directly (same result)
const sameStats = await client.websiteStats(linkId, '7d', { unit: 'day' });
```

See [tests/manual/](./tests/manual/) for more examples.

---


## Documentation

- 📚 **[Migration Guide v2 → v3](./MIGRATION_V3.md)** - Breaking changes & upgrade path
- 👨‍💻 **[Contributing Guide](./CONTRIBUTING.md)** - Setup, tests, release process
- 🧪 **[Tests Documentation](./tests/TestsReadme.md)** - Running tests
- 📝 **[Umami API Docs](https://umami.is/docs/api)** - Official API reference

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Services or activated bots


| ![CI/CD](https://github.com/boly38/umami-api-client/workflows/umami_api_client_ci/badge.svg) | [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/) | [<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="40">](https://houndci.com/) | [<img src="https://codetheweb.blog/assets/img/posts/github-pages-free-hosting/cover.png" width="100">](https://boly38.github.io/umami-api-client/) |
| ---- | ---- | ---- | ---- |

- Github actions : continuous tests + coverage using [c8](https://www.npmjs.com/package/c8) reported on github pages [website](https://boly38.github.io/umami-api-client/)
- Github security checks activated
- [Houndci](https://houndci.com/) : JavaScript  automated review (configured by `.hound.yml`)
- [gren](https://github.com/github-tools/github-release-notes) : [Release notes](https://github.com/boly38/umami-api-client/releases) automation
- Github pages [website](https://boly38.github.io/umami-api-client/) hosts some metrics for the main branch of this project: [code coverage](https://boly38.github.io/umami-api-client/)

---

## License

MIT - See [LICENSE](./LICENSE)

