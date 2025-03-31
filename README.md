# umami-api-client

[![NPM](https://nodei.co/npm/umami-api-client.png?compact=true)](https://npmjs.org/package/umami-api-client)

Umami [ReST API](https://umami.is/docs/api).

- compatible with JavaScript.

Note that a typescript compatible API client exists (but deprecated/archived) : cf. https://github.com/jakobbouchard/umami-api-client

## UmamiClient
Features

using apiKey:
- login
- getSites
- getStats, getPageViews, getEvents, getMetrics

accepted periods are : `1h`, `1d`, `7d`, `30d`, `31d`.

# Quick start

First, set up your environment :

````bash
cp ./env/initenv_cloud.template.sh ./env/initenv_cloud.dontpush.sh
# update ./env/initenv_cloud.dontpush.sh
. ./env/initenv_cloud.dontpush.sh
````

install umami-api-client

```bash
pnpm install umami-api-client
# or
npm install umami-api-client
```

then let's go, cf. example below.

### HowTo use UmamiClient with Umami Cloud server ?
Umami Cloud is "Umami as a service" : cf. https://cloud.umami.is/

Rely on following mandatory variable ([setup your own](https://cloud.umami.is/api-keys)) : UMAMI_CLOUD_API_KEY

NOTE: when an API key is set, the cloud mode is always activated (!) prior to hosted mode. To use hosted mode, you will have to unset UMAMI_CLOUD_API_KEY or use explicit config.


[`$ node.exe ./tests/manual/cloud_sample.js`](./tests/manual/cloud_sample.js)
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

### HowTo use UmamiClient with an Umami hosted server ?

**Umami hosted server** is a server with [umami product](https://github.com/umami-software/umami) hosted by you or by a company which is not Umami (or for ex. locally using docker).

So a URL is available to query Umami hosted server (aka `UMAMI_SERVER`). Ex. `https://umami.exemple.com`

By default, UmamiClient rely on following environment variables : `UMAMI_SERVER` `UMAMI_USER` `UMAMI_PASSWORD`

[`$ node.exe ./tests/manual/host_sample.js`](./tests/manual/host_sample.js)
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

Note that relying on environment is not mandatory, you could use explicit config or arguments.
ex.
```javascript
var client = new UmamiClient({server:'umami.exemple.com'});
await client.login("admin","mySecret");
```

### HowTo better understand UmamiClient use ?

You could play mocha tests to get more examples (cf. [CONTRIBUTING](./CONTRIBUTING.md)).


## How to contribute

cf. [CONTRIBUTING](./CONTRIBUTING.md)

### Services or activated bots


| ![CI/CD](https://github.com/boly38/umami-api-client/workflows/umami_api_client_ci/badge.svg) | [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/) | [<img src="https://cdn.icon-icons.com/icons2/2148/PNG/512/houndci_icon_132320.png" width="40">](https://houndci.com/) | [<img src="https://codetheweb.blog/assets/img/posts/github-pages-free-hosting/cover.png" width="100">](https://boly38.github.io/umami-api-client/) |
| ---- | ---- | ---- | ---- |

- Github actions : continuous tests + coverage using [c8](https://www.npmjs.com/package/c8) reported on github pages [website](https://boly38.github.io/umami-api-client/)
- Github security checks activated
- [Houndci](https://houndci.com/) : JavaScript  automated review (configured by `.hound.yml`)
- [gren](https://github.com/github-tools/github-release-notes) : [Release notes](https://github.com/boly38/umami-api-client/releases) automation
- Github pages [website](https://boly38.github.io/umami-api-client/) hosts some metrics for the main branch of this project: [code coverage](https://boly38.github.io/umami-api-client/)

