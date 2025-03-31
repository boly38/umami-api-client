import UmamiClient from '../src/UmamiClient.js';

import {strict as assert} from 'assert';
import {expect, should} from 'chai';
import {env} from 'node:process';
import {
    assumeListResult,
    assumeObjectResult,
    expectNotEmptyWebsites,
    expectTestInputOrSkip,
    infoAboutTestEnv,
    mayBeEmpty,
    noCommandLineEnv
} from "./testUtils.js";
import {isSet} from "./utils.js";

should();

/** environment variables **/
const {
    UMAMI_TEST_VERBOSE,
    UMAMI_TEST_HOSTED_SERVER,
    UMAMI_TEST_HOSTED_DOMAIN,
    UMAMI_TEST_USER,
    UMAMI_TEST_PASSWORD
} = env;

const verbose = UMAMI_TEST_VERBOSE === 'true';

let client;
let authData = null;
let sitesData = null;
let siteData = null;

describe(`env based UmamiClient targeting hosted umami instance`, function () {
    before(function () {
        noCommandLineEnv();
        if (!isSet(UMAMI_TEST_HOSTED_SERVER)) {
            console.log("skip without UMAMI_TEST_HOSTED_SERVER, you must setup your env to play success cases");
            this.skip();
        }
        client = new UmamiClient({
            "server": UMAMI_TEST_HOSTED_SERVER,
            "apiKey": null
        });
        if (verbose) {
            console.info(`Test against umami server: ${UMAMI_TEST_HOSTED_SERVER}`);
        } else {
            infoAboutTestEnv();
        }
    });

    it("should login", async function () {
        if (!isSet(UMAMI_TEST_USER) || !isSet(UMAMI_TEST_PASSWORD)) {
            console.log("skip without UMAMI_TEST_USER, UMAMI_TEST_PASSWORD");
            this.skip();
        }
        authData = await client.login(UMAMI_TEST_USER, UMAMI_TEST_PASSWORD);
        authData.should.not.be.empty;
        authData.token.should.not.be.empty;
    });

    it("should not login", async function () {
        try {
            await client.login("admin", "hack!Me");
        } catch (error) {
            assert.equal(error.message, `401 - Login failed - {"error":"message.incorrect-username-password"}`);
        }
    });

    it("should get /websites", async function () {
        sitesData = await client.websites();
        expectNotEmptyWebsites(sitesData, verbose);
    });

    it("should select sites by domain", async function () {
        expectTestInputOrSkip("sitesData", sitesData, this.skip.bind(this));
        siteData = client.selectSiteByDomain(sitesData, sitesData[0].domain);
        if (!isSet(siteData) && verbose) {
            console.info(" x none");
        } else if (verbose) {
            console.info(" * #" + siteData.id + " created_at:" + siteData.createdAt + " - name:" + siteData.name + " domain:" + siteData.domain);
        }
        siteData.should.not.be.empty;
        expect(siteData).to.be.eql(client.selectSiteByDomain(sitesData)); // return first by default
        expect(siteData).to.be.eql(client.selectSiteByDomain(sitesData, '*first*'));
        if (UMAMI_TEST_HOSTED_DOMAIN) {
            siteData = client.selectSiteByDomain(sitesData, UMAMI_TEST_HOSTED_DOMAIN);
            expect(siteData, `no site data for domain UMAMI_TEST_HOSTED_DOMAIN:${UMAMI_TEST_HOSTED_DOMAIN}`).to.not.be.empty;
        }
    });

    it("should get /website/{id}/stats for 1h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '1h');
        assumeObjectResult(`${siteData.name}'s stats 1 hour`, result);
    });

    it("should get /website/{id}/stats for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '24h');
        assumeObjectResult(`${siteData.name}'s stats 24h`, result);
    });

    it("should get /website/{id}/stats for 7 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '7d');
        assumeObjectResult(`${siteData.name}'s stats 7 days`, result);
    });

    it("should get /website/{id}/stats for 30d", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteStats(siteData.id, '30d');
        assumeObjectResult(`${siteData.name}'s stats 30d`, result);
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
        const result = await client.websitePageViews(siteData.id, '7d', {unit: 'day', timezone: 'Europe/Paris'});
        assumeObjectResult(`${siteData.name}'s pageviews 7 days`, result);
    });

    it("should get /website/{id}/events for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteEvents(siteData.id, '24h');
        assumeListResult(`${siteData.name}'s events 24h`, result.data, mayBeEmpty, verbose);
    });

    it("should get /website/{id}/events for 7 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteEvents(siteData.id, '7d', {unit: 'day', timezone: 'Europe/Paris'});
        assumeListResult(`${siteData.name}'s events 7 days`, result.data, mayBeEmpty, verbose);
    });

    it("should get /website/{id}/events for 30 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const result = await client.websiteEvents(siteData.id, '30d', {unit: 'day', timezone: 'Europe/Paris'});
        assumeListResult(`${siteData.name}'s events 30 days`, result.data, mayBeEmpty, verbose);
    });

    // all types are : ['url', 'referrer', 'browser', 'os', 'device', 'country', 'event']
    it("should get /website/{id}/metrics for 24h", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        for (const type of ['url', 'referrer']) {
            const result = await client.websiteMetrics(siteData.id, '24h', {type});
            assumeListResult(`${siteData.name}'s 24h metrics type:${type}`, result, mayBeEmpty, verbose);
        }
    });

    it("should get /website/{id}/metrics for 7 days", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const type = 'country';
        const result = await client.websiteMetrics(siteData.id, '7d', {type});
        assumeListResult(`${siteData.name}'s 7d metrics type:${type}`, result, mayBeEmpty, verbose);
    });

    it("should get /website/{id}/metrics for 1 month", async function () {
        expectTestInputOrSkip("siteData", siteData, this.skip.bind(this));
        const type = 'browser';
        const result = await client.websiteMetrics(siteData.id, '1month', {type});
        assumeListResult(`${siteData.name}'s 1month metrics type:${type}`, result, mayBeEmpty, verbose);
    });
});
