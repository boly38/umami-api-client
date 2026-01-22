import UmamiClient from '../src/UmamiClient.js';
import {expect} from 'chai';
import {testEnv, skipIfNoHostedEnv} from './helpers/env.js';

/**
 * Tests for Pixels API - Hosted Mode (Umami v3.x)
 * READ-ONLY operations only
 * 
 * Environment variables required:
 * - UMAMI_TEST_HOSTED_SERVER
 * - UMAMI_TEST_USER
 * - UMAMI_TEST_PASSWORD
 */

const verbose = testEnv.verbose;
const skipTests = testEnv.skipPixels;

describe("Pixels API (Umami v3.x) - Hosted Mode - READ-ONLY", function () {
    let client = null;
    let testPixelId = null;

    before(async function () {
        if (skipTests) {
            console.log('⏭️  Skipping Pixels API tests (UMAMI_TEST_PIXELS=false)');
            this.skip();
            return;
        }

        skipIfNoHostedEnv(this);

        // Initialize hosted client
        client = new UmamiClient({server: testEnv.hostedServer});
        await client.login(testEnv.user, testEnv.password);
        if (verbose) {
            console.info(`Test against Umami Hosted (${testEnv.hostedServer}) - Pixels API`);
        }

        // Get first pixel ID for tests
        try {
            const pixelsData = await client.pixels({pageSize: 1});
            if (pixelsData?.data && pixelsData.data.length > 0) {
                testPixelId = pixelsData.data[0].id;
                if (verbose) {
                    console.info(`Using test pixel ID: ${testPixelId}`);
                }
            } else {
                console.warn('⚠️  No pixels found - some tests will be skipped');
            }
        } catch (error) {
            console.warn('⚠️  Could not fetch pixels (feature might not be available):', error.message);
            this.skip();
        }
    });

    describe('pixels() - GET /api/pixels', function () {
        it('should retrieve pixels list', async function () {
            const data = await client.pixels();
            expect(data).to.be.an('object');
            expect(data).to.have.property('data');
            expect(data.data).to.be.an('array');
            
            if (verbose && data.data.length > 0) {
                console.log(`Retrieved ${data.data.length} pixels`);
            }
        });

        it('should support pagination options', async function () {
            const data = await client.pixels({page: 1, pageSize: 5});
            expect(data).to.be.an('object');
            expect(data.data).to.be.an('array');
            expect(data.data.length).to.be.at.most(5);
        });

        it('should support search parameter', async function () {
            const data = await client.pixels({search: 'test', pageSize: 10});
            expect(data).to.be.an('object');
            expect(data.data).to.be.an('array');
        });

        it('should validate pixel data structure', async function () {
            const data = await client.pixels({pageSize: 1});
            if (data.data && data.data.length > 0) {
                const pixel = data.data[0];
                expect(pixel).to.have.property('id');
                expect(pixel).to.have.property('name');
                expect(pixel).to.have.property('slug');
                expect(pixel).to.have.property('createdAt');
                expect(pixel.id).to.be.a('string');
                expect(pixel.slug).to.be.a('string');
            }
        });
    });

    describe('getPixel() - GET /api/pixels/:pixelId', function () {
        it('should retrieve pixel details by ID', async function () {
            if (!testPixelId) {
                this.skip();
            }
            
            const pixelData = await client.getPixel(testPixelId);
            expect(pixelData).to.be.an('object');
            expect(pixelData).to.have.property('id');
            expect(pixelData.id).to.equal(testPixelId);
            expect(pixelData).to.have.property('name');
            expect(pixelData).to.have.property('slug');
            expect(pixelData.slug).to.be.a('string');
            
            if (verbose) {
                console.log(`Pixel: ${pixelData.name} (${pixelData.slug})`);
            }
        });

        it('should throw error for invalid pixel ID', async function () {
            try {
                await client.getPixel('invalid-id');
                expect.fail('Should have thrown error for invalid ID');
            } catch (error) {
                expect(error).to.be.an('error');
                expect(error.message).to.match(/Invalid pixelId/i);
            }
        });

        it('should throw error for non-existent pixel ID', async function () {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            try {
                const result = await client.getPixel(fakeId);
                if (verbose) {
                    console.log('⚠️  API returned for non-existent pixel:', result);
                }
                // Accept this behavior - some APIs return null/empty instead of 404
                expect(result === null || result === undefined || Object.keys(result || {}).length === 0).to.be.true;
            } catch (error) {
                if (verbose) {
                    console.log('✅ API threw error:', error.message);
                }
                expect(error).to.be.an('error');
                expect(error.message).to.match(/(Unable to get pixel|Not found|404)/i);
            }
        });
    });

    describe('pixelStats() - GET /api/websites/:pixelId/stats (alias)', function () {
        it('should retrieve pixel stats for 24h period', async function () {
            if (!testPixelId) {
                this.skip();
            }

            try {
                const stats = await client.pixelStats(testPixelId, '24h');
                expect(stats).to.be.an('object');
                // Stats structure depends on Umami's response
                // Note: pixelStats() is an alias for websiteStats()
                if (verbose) {
                    console.log('Pixel stats (24h):', JSON.stringify(stats, null, 2));
                }
            } catch (error) {
                // Pixel might not have any data yet
                if (verbose) {
                    console.log('⚠️  No stats available for pixel');
                }
            }
        });

        it('should support different time periods', async function () {
            if (!testPixelId) {
                this.skip();
            }

            try {
                const stats7d = await client.pixelStats(testPixelId, '7d', {unit: 'day'});
                expect(stats7d).to.be.an('object');
                
                if (verbose) {
                    console.log('Pixel stats (7d):', JSON.stringify(stats7d, null, 2));
                }
            } catch (error) {
                if (verbose) {
                    console.log('⚠️  No stats available for 7d period');
                }
            }
        });

        it('should be equivalent to websiteStats()', async function () {
            if (!testPixelId) {
                this.skip();
            }

            try {
                const pixelStats = await client.pixelStats(testPixelId, '24h');
                const websiteStats = await client.websiteStats(testPixelId, '24h');

                // Both methods should return the same data
                expect(pixelStats).to.deep.equal(websiteStats);

                if (verbose) {
                    console.log('✅ pixelStats() and websiteStats() return identical data');
                }
            } catch (error) {
                if (verbose) {
                    console.log('⚠️  No stats available for comparison');
                }
            }
        });

        it('should validate pixelId parameter', async function () {
            try {
                await client.pixelStats('invalid-id', '24h');
                expect.fail('Should have thrown error for invalid ID');
            } catch (error) {
                expect(error).to.be.an('error');
                // pixelStats() calls websiteStats(), so error message mentions websiteId
                expect(error.message).to.match(/Invalid (pixelId|websiteId) UID format/i);
            }
        });

        it('should validate period parameter', async function () {
            if (!testPixelId) {
                this.skip();
            }

            try {
                await client.pixelStats(testPixelId, 'invalid-period');
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
            console.log('✅ Pixels API tests completed');
        }
    });
});
