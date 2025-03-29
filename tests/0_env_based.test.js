import UmamiClient from '../src/UmamiClient.js';

import {strict as assert} from 'assert';
import {expect, should} from 'chai';
import { env } from 'node:process';

should();

/** environment variables **/
const {
    UMAMI_TEST_VERBOSE,
    UMAMI_SERVER,
    UMAMI_USER, UMAMI_PASSWORD,
    UMAMI_SITE_DOMAIN} = env;
const verbose = UMAMI_TEST_VERBOSE === 'true';

let client;
let authData = null;
let sitesData = null;
let siteData = null;

describe("Test UmamiClient env based cases", () => {
    before( () =>{
        if (!isSet(UMAMI_SERVER)) {
            console.log("skip without UMAMI_SERVER, you must setup your env to play success cases");
            this.skip();
        }
        client = new UmamiClient();
        if (verbose) {
            console.info(`Test against umami server: ${UMAMI_SERVER}`);
        } else {
            console.info("You could switch to verbose mode by setting UMAMI_TEST_VERBOSE=true, and/or UMAMI_CLIENT_DEBUG_REQUEST UMAMI_CLIENT_DEBUG_RESPONSE");
        }
    });

    it("should login", async () => {
        if (!isSet(UMAMI_USER) || !isSet(UMAMI_PASSWORD)) {
            console.log("skip without UMAMI_USER, UMAMI_PASSWORD");
            this.skip();
        }
        authData = await client.login(UMAMI_USER, UMAMI_PASSWORD).catch(_expectNoError);
        authData.should.not.be.empty;
        authData.token.should.not.be.empty;
    });

    it("should not login", async () => {
        try {
            await client.login("admin", "hack!Me");
        } catch (error) {
            assert.equal(error, `401 - Login failed - {"error":"message.incorrect-username-password"}`);
        }
    });

    it("should get sites", async () => {
        expectAuthData();
        sitesData = await client.getSites(authData).catch(_expectNoError);
        if (!isSet(sitesData) || sitesData.length < 1) {
            console.info(" x none");
        } else if (verbose) {
            sitesData.forEach(siteData => {
                console.info(` * #${siteData.id} created_at:${siteData.createdAt} - name:${siteData.name} domain:${siteData.domain}`);
            });
        }
        sitesData.should.not.be.empty;
    });

    it("should get sites by domain", async () => {
        expectSitesData();
        siteData = client.selectSiteByDomain(sitesData, sitesData[0].domain);
        if (!isSet(siteData) && verbose) {
            console.info(" x none");
        } else if (verbose) {
            console.info(" * #" + siteData.id + " created_at:" + siteData.createdAt + " - name:" + siteData.name + " domain:" + siteData.domain);
        }
        siteData.should.not.be.empty;
        expect(siteData).to.be.eql(client.selectSiteByDomain(sitesData)); // return first by default
        expect(siteData).to.be.eql(client.selectSiteByDomain(sitesData, '*first*'));
        if (UMAMI_SITE_DOMAIN) {
            siteData = client.selectSiteByDomain(sitesData, UMAMI_SITE_DOMAIN);
            expect(siteData, `no site data for domain UMAMI_SITE_DOMAIN:${UMAMI_SITE_DOMAIN}`).to.not.be.empty;
        }
    });

    it("should GET /api/website/{id}/stats for 1h", async () => {
        expectAuthAndSiteData();
        const result = await client.getStats(authData, siteData, '1h');
        assumeObjectResult('stats 1 hour', result);
    });

    it("should GET /api/website/{id}/stats for 24h", async () => {
        expectAuthAndSiteData();
        const result = await client.getStatsForLast24h(authData, siteData);
        assumeObjectResult('stats 24h', result);
    });

    it("should GET /api/website/{id}/stats for 7 days", async () => {
        expectAuthAndSiteData();
        const result = await client.getStats(authData, siteData, '7d');
        assumeObjectResult('stats 7 days', result);
    });

    it("should GET /api/website/{id}/stats for 30d", async () => {
        expectAuthAndSiteData();
        const result = await client.getStats(authData, siteData, '30d');
        assumeObjectResult('stats 30d', result);
    });

    it("should GET /api/website/{id}/stats for 1 month", async () => {
        expectAuthAndSiteData();
        const result = await client.getStats(authData, siteData, '1m');
        assumeObjectResult('stats 1 month', result);
    });

    it("should GET /api/website/{id}/pageviews for 24h", async () => {
        expectAuthAndSiteData();
        const result = await client.getPageViewsForLast24h(authData, siteData);
        assumeObjectResult('pageviews 24h', result);
    });

    it("should GET /api/website/{id}/pageviews for 7 days", async () => {
        expectAuthAndSiteData();
        const result = await client.getPageViews(authData, siteData, {unit: 'day', timezone: 'Europe/Paris'}, '7d');
        assumeObjectResult('pageviews 7 days', result);
    });

    it("should GET /api/website/{id}/events for 24h", async () => {
        expectAuthAndSiteData();
        const result = await client.getEventsForLast24h(authData, siteData);
        assumeListResult('events 24h', result);
    });

    it("should GET /api/website/{id}/events for 7 days", async () => {
        expectAuthAndSiteData();
        const result = await client.getEvents(authData, siteData, {unit: 'day', timezone: 'Europe/Paris'}, '7d');
        assumeListResult('events 7 days', result);
    });

    it("should GET /api/website/{id}/events for 30 days", async () => {
        expectAuthAndSiteData();
        const result = await client.getEvents(authData, siteData, {unit: 'day', timezone: 'Europe/Paris'}, '30d');
        assumeListResult('events 30 days', result);
    });

    // all types are : ['url', 'referrer', 'browser', 'os', 'device', 'country', 'event']
    it("should GET /api/website/{id}/metrics for 24h", async () => {
        expectAuthAndSiteData();
        for (const type of ['url', 'referrer']) {
            const result = await client.getMetricsForLast24h(authData, siteData, {type});
            assumeListResult(`24h metrics type:${type}`, result, true);
        }
    });

    it("should GET /api/website/{id}/metrics for 7 days", async () => {
        expectAuthAndSiteData();
        const type = 'url';
        const result = await client.getMetrics(authData, siteData, {type}, '7d');
        assumeListResult(`7d metrics type:${type}`, result);
    });

    it("should GET /api/website/{id}/metrics for 1 month", async () => {
        expectAuthAndSiteData();
        const type = 'url';
        const result = await client.getMetrics(authData, siteData, {type}, '1month');
        assumeListResult(`1month metrics type:${type}`, result);
    });
});

const isSet = (value) => value !== null && value !== undefined;
const _expectNoError = (err) => expect.fail(err);
const expectAuthData = () => {
    if (!isSet(authData?.token)) {
        console.log("skip without authData");
        this.skip();
    }
};
const expectSitesData = () => {
    if (!isSet(sitesData)) {
        console.log("skip without sitesData");
        this.skip();
    }
};
const expectSiteData = () => {
    if (!isSet(siteData)) {
        console.log("skip without siteData");
        this.skip();
    }
};
const expectAuthAndSiteData = () => {
    expectAuthData();
    expectSiteData();
};
const assumeObjectResult = (description, siteResult) => {
    if (!isSet(siteResult)) {
        expect.fail(`expect ${description} to be set`);
    } else if (verbose) {
        console.info(` * ${siteData.domain} ${description}:\n${JSON.stringify(siteResult)}`);
    }
};
const assumeListResult = (description, siteResultList, mayBeEmpty = false) => {
    if (!isSet(siteResultList)) {
        expect.fail(`expect list ${description} to be set`);
    } else if (siteResultList.length === 0 && verbose) {
        console.info(" x none");
    } else if (verbose) {
        console.info(` * ${siteData.domain} ${description}:\n${JSON.stringify(siteResultList)}`);
    } else {
        console.info(` * ${siteData.domain} ${description}:\t${siteResultList.length} result(s)`);
    }
    if (!mayBeEmpty) {
        siteResultList.should.not.be.empty;
    }
};