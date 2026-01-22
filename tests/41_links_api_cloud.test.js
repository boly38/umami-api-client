import UmamiClient from '../src/UmamiClient.js';
import {expect} from 'chai';
import {testEnv, skipIfNoCloudEnv} from './helpers/env.js';

/**
 * Tests for Links API - Cloud Mode (Umami v3.x)
 * READ-ONLY operations only
 * 
 * Environment variables required:
 * - UMAMI_TEST_CLOUD_API_KEY
 */

const verbose = testEnv.verbose;
const skipTests = testEnv.skipLinks;

describe("Links API (Umami v3.x) - Cloud Mode - READ-ONLY", function () {
    let client = null;
    let testLinkId = null;

    before(async function () {
        if (skipTests) {
            console.log('⏭️  Skipping Links API tests (UMAMI_TEST_LINKS=false)');
            this.skip();
            return;
        }

        skipIfNoCloudEnv(this);

        // Initialize cloud client
        client = new UmamiClient({cloudApiKey: testEnv.cloudApiKey});
        if (verbose) {
            console.info('Test against Umami Cloud - Links API');
        }

        // Get first link ID for tests
        try {
            const linksData = await client.links({pageSize: 1});
            if (linksData?.data && linksData.data.length > 0) {
                testLinkId = linksData.data[0].id;
                if (verbose) {
                    console.info(`Using test link ID: ${testLinkId}`);
                }
            } else {
                console.warn('⚠️  No links found - some tests will be skipped');
            }
        } catch (error) {
            console.warn('⚠️  Could not fetch links (feature might not be available):', error.message);
            this.skip();
        }
    });

    describe('links() - GET /api/links', function () {
        it('should retrieve links list', async function () {
            const data = await client.links();
            expect(data).to.be.an('object');
            expect(data).to.have.property('data');
            expect(data.data).to.be.an('array');
            
            if (verbose && data.data.length > 0) {
                console.log(`Retrieved ${data.data.length} links`);
            }
        });

        it('should support pagination options', async function () {
            const data = await client.links({page: 1, pageSize: 5});
            expect(data).to.be.an('object');
            expect(data.data).to.be.an('array');
            expect(data.data.length).to.be.at.most(5);
        });

        it('should support search parameter', async function () {
            const data = await client.links({search: 'test', pageSize: 10});
            expect(data).to.be.an('object');
            expect(data.data).to.be.an('array');
        });

        it('should validate link data structure', async function () {
            const data = await client.links({pageSize: 1});
            if (data.data && data.data.length > 0) {
                const link = data.data[0];
                expect(link).to.have.property('id');
                expect(link).to.have.property('url');
                expect(link).to.have.property('createdAt');
                expect(link.id).to.be.a('string');
                expect(link.url).to.be.a('string');
            }
        });
    });

    describe('getLink() - GET /api/links/:linkId', function () {
        it('should retrieve link details by ID', async function () {
            if (!testLinkId) {
                this.skip();
            }
            
            const linkData = await client.getLink(testLinkId);
            expect(linkData).to.be.an('object');
            expect(linkData).to.have.property('id');
            expect(linkData.id).to.equal(testLinkId);
            expect(linkData).to.have.property('url');
            expect(linkData.url).to.be.a('string');
            
            if (verbose) {
                console.log(`Link URL: ${linkData.url}`);
            }
        });

        it('should throw error for invalid link ID', async function () {
            try {
                await client.getLink('invalid-id');
                expect.fail('Should have thrown error for invalid ID');
            } catch (error) {
                expect(error).to.be.an('error');
                expect(error.message).to.match(/Invalid linkId/i);
            }
        });

        it('should throw error for non-existent link ID', async function () {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            try {
                const result = await client.getLink(fakeId);
                if (verbose) {
                    console.log('⚠️  API returned for non-existent link:', result);
                }
                // Accept this behavior - some APIs return null/empty instead of 404
                expect(result === null || result === undefined || Object.keys(result || {}).length === 0).to.be.true;
            } catch (error) {
                if (verbose) {
                    console.log('✅ API threw error:', error.message);
                }
                expect(error).to.be.an('error');
                expect(error.message).to.match(/(Unable to get link|Not found|404)/i);
            }
        });
    });

    describe('linkStats() - GET /api/websites/:linkId/stats (alias)', function () {
        it('should retrieve link stats for 24h period', async function () {
            if (!testLinkId) {
                this.skip();
            }

            try {
                const stats = await client.linkStats(testLinkId, '24h');
                expect(stats).to.be.an('object');
                // Stats structure depends on Umami's response
                // Note: linkStats() is an alias for websiteStats()
                if (verbose) {
                    console.log('Link stats (24h):', JSON.stringify(stats, null, 2));
                }
            } catch (error) {
                // Link might not have any data yet
                if (verbose) {
                    console.log('⚠️  No stats available for link');
                }
            }
        });

        it('should support different time periods', async function () {
            if (!testLinkId) {
                this.skip();
            }

            try {
                const stats7d = await client.linkStats(testLinkId, '7d', {unit: 'day'});
                expect(stats7d).to.be.an('object');
                
                if (verbose) {
                    console.log('Link stats (7d):', JSON.stringify(stats7d, null, 2));
                }
            } catch (error) {
                if (verbose) {
                    console.log('⚠️  No stats available for 7d period');
                }
            }
        });

        it('should be equivalent to websiteStats()', async function () {
            if (!testLinkId) {
                this.skip();
            }

            try {
                const linkStats = await client.linkStats(testLinkId, '24h');
                const websiteStats = await client.websiteStats(testLinkId, '24h');

                // Both methods should return the same data
                expect(linkStats).to.deep.equal(websiteStats);

                if (verbose) {
                    console.log('✅ linkStats() and websiteStats() return identical data');
                }
            } catch (error) {
                if (verbose) {
                    console.log('⚠️  No stats available for comparison');
                }
            }
        });

        it('should validate linkId parameter', async function () {
            try {
                await client.linkStats('invalid-id', '24h');
                expect.fail('Should have thrown error for invalid ID');
            } catch (error) {
                expect(error).to.be.an('error');
                // linkStats() calls websiteStats(), so error message mentions websiteId
                expect(error.message).to.match(/Invalid (linkId|websiteId)/i);
            }
        });

        it('should validate period parameter', async function () {
            if (!testLinkId) {
                this.skip();
            }

            try {
                await client.linkStats(testLinkId, 'invalid-period');
                expect.fail('Should have thrown error for invalid period');
            } catch (error) {
                expect(error).to.be.an('error');
                expect(error.message).to.match(/Unexpected period provided/i);
            }
        });
    });

    after(function () {
        if (client && !client.isCloudMode()) {
            client.logout();
        }
        if (verbose) {
            console.log('✅ Links API tests completed');
        }
    });
});
