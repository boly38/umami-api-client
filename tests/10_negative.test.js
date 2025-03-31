import {env} from 'node:process';
import UmamiClient from '../src/UmamiClient.js';

import {strict as assert} from 'assert';
import {expect, should} from 'chai';
import {expectRequiredWebsiteId, expectValidPeriod, expectValidWebsiteId, noCommandLineEnv} from "./testUtils.js";

should();

const client = new UmamiClient({server: 'https://fake.umami.exemple.com'});
const AUTH_ERROR = "Authentication is required : please login first (or provide an api key for the cloud mode)";

const validSiteData = {
    id: '51970a0b-f9d5-4e60-9edd-d864ae7225be',
    name: 'test-site-data',
    domain: 'www.example.com',
    createdAt: '2022-02-17T12:57:43.805Z'
};

describe("Test UmamiClient negative cases", function () {
    before(function () {
        noCommandLineEnv();
    });

    it(`UmamiClient should not work without server ${env.UMAMI_SERVER}`, async function () {
        expect(function () {
            new UmamiClient();
        }).to.throw("server is required. ie. set UMAMI_SERVER environment variable or option.");
    });

    it("websites should not work without authentication", async function () {
        try {
            await client.websites();
            fail("auth exception expected");
        } catch (error) {
            expect(error.message).to.be.eql(AUTH_ERROR);
        }
    });

    it("selectSiteByDomain should not work without siteDatas", async function () {
        expect(function () {
            client.selectSiteByDomain([]);
        }).to.throw("No sites data provided");
    });

    it("selectSiteByDomain should not work without valid siteDatas", async function () {
        expect(function () {
            client.selectSiteByDomain([{}]);
        }).to.throw("Unexpected sites data provided");
    });

    it("should not work without valid websiteId", async function () {
        await expectRequiredWebsiteId(client.websiteStats.bind(client));
        await expectRequiredWebsiteId(client.websitePageViews.bind(client));
        await expectRequiredWebsiteId(client.websiteEvents.bind(client));
        await expectRequiredWebsiteId(client.websiteMetrics.bind(client));

        await expectValidWebsiteId(client.websiteStats.bind(client));
        await expectValidWebsiteId(client.websitePageViews.bind(client));
        await expectValidWebsiteId(client.websiteEvents.bind(client));
        await expectValidWebsiteId(client.websiteMetrics.bind(client));
    });

    it("should not work without valid period", async function () {
        let invalidPeriod = 'SEVEN';
        await expectValidPeriod(client.websiteStats.bind(client, validSiteData.id, invalidPeriod));
        await expectValidPeriod(client.websitePageViews.bind(client, validSiteData.id, invalidPeriod));
        await expectValidPeriod(client.websiteEvents.bind(client, validSiteData.id, invalidPeriod));
        await expectValidPeriod(client.websiteMetrics.bind(client, validSiteData.id, invalidPeriod));
    });

});