import UmamiClient from '../src/UmamiClient.js';
import {expect, should} from 'chai';
import {env} from 'node:process';
import {isSet} from "./utils.js";
import {
    assumeListResult,
    assumeObjectResult,
    expectNotEmptyWebsites,
    expectTestInputOrSkip,
    infoAboutTestEnv,
    logWebsite,
    mayBeEmpty,
    noCommandLineEnv
} from "./testUtils.js";

should();

/** environment variables **/
const {
    UMAMI_TEST_CLOUD_API_KEY,
    UMAMI_TEST_CLOUD_DOMAIN,
    UMAMI_TEST_VERBOSE
} = env;
const verbose = UMAMI_TEST_VERBOSE === 'true';

const timezone = "Europe/Paris";
let client;
let identity = null;
let sitesData = null;
let siteData = null;

describe("env based UmamiClient targeting umami CLOUD", function () {
    before(function () {
        noCommandLineEnv();
        if (!isSet(UMAMI_TEST_CLOUD_API_KEY)) {
            console.log("skip without UMAMI_TEST_CLOUD_API_KEY, you must setup your env to play success cases");
            this.skip();
        }
        client = new UmamiClient({ cloudApiKey: UMAMI_TEST_CLOUD_API_KEY });
        if (verbose) {
            console.info(`Test against Umami Cloud.`);
        } else {
            infoAboutTestEnv();
        }
    });

    it("should verify api key via /me", async function () {
        identity = await client.me();
        identity?.user?.id.should.not.be.empty;
        identity?.user?.username.should.not.be.empty;
        identity?.user?.role.should.not.be.empty;
        identity?.user?.createdAt.should.not.be.empty;
        identity?.user?.isAdmin.should.not.be.undefined;
        // + grant,token,shareToken
    });

    it("should get /websites", async function () {
        expectTestInputOrSkip("identity", identity, this.skip.bind(this));
        sitesData = await client.websites();
        expectNotEmptyWebsites(sitesData, verbose);
    });

    it("should select site by domain", async function () {
        expectTestInputOrSkip("sitesData", sitesData, this.skip.bind(this));
        siteData = client.selectSiteByDomain(sitesData, UMAMI_TEST_CLOUD_DOMAIN);
        if (!isSet(siteData) && verbose) {
            console.info(" x none");
        } else if (verbose) {
            logWebsite(siteData);
        }
        expect(siteData).to.not.be.empty;
    });

    it("should get /website/{id}/stats for 1h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '1h');
        assumeObjectResult(`${siteData.name}'s stats 1 hour`, result);
    });

    it("should get /website/{id}/stats for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '24h');
        assumeObjectResult(`${siteData.name}'s websiteStats for 24h`, result);
    });

    it("should get /website/{id}/stats for 7 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '7d');
        assumeObjectResult(`${siteData.name}'s stats 7 days`, result);
    });

    it("should get /website/{id}/stats for 1 month", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '1m');
        assumeObjectResult(`${siteData.name}'s stats 1 month`, result);
    });

    it("should get /website/{id}/pageviews for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websitePageViews(siteData.id, '24h');
        assumeObjectResult(`${siteData.name}'s pageviews 24h`, result);
    });

    it("should get /website/{id}/pageviews for 7 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websitePageViews(siteData.id, '7d', {unit: 'day', timezone});
        assumeObjectResult(`${siteData.name}'s pageviews 7 days`, result);
    });

    it("should get /website/{id}/events for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteEvents(siteData.id, '24h');
        assumeListResult(`${siteData.name}'s events 24h`, result?.data, mayBeEmpty, verbose);
    });

    it("should get /website/{id}/events for 7 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteEvents(siteData.id, '7d', {unit: 'day', timezone});
        assumeListResult(`${siteData.name}'s events 7 days`, result?.data, mayBeEmpty, verbose);
    });

    it("should get /website/{id}/events for 30 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteEvents(siteData.id, '30d', {unit: 'day', timezone});
        assumeListResult(`${siteData.name}'s events 30 days`, result?.data, mayBeEmpty, verbose);
    });

    // all types are : ['url', 'referrer', 'browser', 'os', 'device', 'country', 'event']
    it("should get /website/{id}/metrics for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        for (const type of ['url', 'referrer']) {
            const result = await client.websiteMetrics(siteData.id, '24h', {type});
            assumeListResult(`${siteData.name}'s 24h metrics type:${type}`, result, mayBeEmpty, verbose);
        }
    });

    it("should get /api/website/{id}/metrics for 1 month", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const type = 'country';
        const result = await client.websiteMetrics(siteData.id, '1month', {type});
        assumeListResult(`${siteData.name}'s 1month metrics type:${type}`, result, mayBeEmpty, verbose);
    });
});