/**
 * Pixels API Sample - Umami v3.x
 * 
 * Demonstrates how to use the Pixels API (read-only):
 * - List tracking pixels
 * - Get pixel details
 * - Analyze pixel statistics
 * 
 * Setup (Hosted mode):
 *   export UMAMI_SERVER=https://your-umami-instance.com
 *   export UMAMI_USER=your-username
 *   export UMAMI_PASSWORD=your-password
 * 
 * Setup (Cloud mode):
 *   export UMAMI_CLOUD_API_KEY=your-api-key
 * 
 * Usage:
 *   node tests/manual/pixels_sample.js
 */

import UmamiClient from "../../lib/export.js";
// import UmamiClient from 'umami-api-client';

const doIt = async () => {
    try {
        const client = new UmamiClient();
        // default is // new UmamiClient({cloudApiKey:process.env.UMAMI_CLOUD_API_KEY});
        // or        // new UmamiClient({server:process.env.UMAMI_SERVER});

        // Authenticate (auto-detects mode)
        if (client.isCloudMode()) {
            const me = await client.me();
            console.log(`🔑 Cloud mode - Authenticated as: ${me?.user?.username || 'N/A'}`);
        } else {
            await client.login();
            // default is // client.login(process.env.UMAMI_USER, process.env.UMAMI_PASSWORD)
            console.log('🔑 Hosted mode - Login successful');
        }

        // 1. List all pixels
        const pixelsData = await client.pixels({ pageSize: 10 });
        const pixels = pixelsData?.data || [];

        if (pixels.length === 0) {
            console.log('⚠️  No pixels found. Create some in Umami UI first.');
            return;
        }

        console.log('🖼️  Tracking Pixels:');
        const pixelsTable = pixels.map(({ id, name, slug, createdAt }) => ({
            id: id.substring(0, 8) + '...',
            name: name || 'N/A',
            slug: slug,
            created: new Date(createdAt).toLocaleDateString()
        }));
        console.table(pixelsTable);

        // 2. Get first pixel details
        const firstPixel = pixels[0];
        const pixelDetails = await client.getPixel(firstPixel.id);
        console.log(`\n📄 Pixel Details for: ${firstPixel.name || firstPixel.slug}`);
        console.log(JSON.stringify(pixelDetails, null, 2));

        // 3. Get pixel statistics
        const displayStats = (stats, periodLabel) => {
            const tableData = {
                Previous: {
                    'Page Views': stats.comparison?.pageviews || 0,
                    'Visitors': stats.comparison?.visitors || 0,
                    'Visits': stats.comparison?.visits || 0,
                    'Bounces': stats.comparison?.bounces || 0,
                    'Total Time (s)': stats.comparison?.totaltime || 0
                },
                Current: {
                    'Page Views': stats.pageviews || 0,
                    'Visitors': stats.visitors || 0,
                    'Visits': stats.visits || 0,
                    'Bounces': stats.bounces || 0,
                    'Total Time (s)': stats.totaltime || 0
                },
                Change: {
                    'Page Views': `${stats.pageviews - (stats.comparison?.pageviews || 0) > 0 ? '+' : ''}${stats.pageviews - (stats.comparison?.pageviews || 0)}`,
                    'Visitors': `${stats.visitors - (stats.comparison?.visitors || 0) > 0 ? '+' : ''}${stats.visitors - (stats.comparison?.visitors || 0)}`,
                    'Visits': `${stats.visits - (stats.comparison?.visits || 0) > 0 ? '+' : ''}${stats.visits - (stats.comparison?.visits || 0)}`,
                    'Bounces': `${stats.bounces - (stats.comparison?.bounces || 0) > 0 ? '+' : ''}${stats.bounces - (stats.comparison?.bounces || 0)}`,
                    'Total Time (s)': `${stats.totaltime - (stats.comparison?.totaltime || 0) > 0 ? '+' : ''}${stats.totaltime - (stats.comparison?.totaltime || 0)}`
                }
            };
            console.table(tableData);
        };

        // Stats for last 24 hours
        console.log('\n📊 Pixel Stats (last 24 hours):');
        console.log('─'.repeat(60));
        try {
            const stats24h = await client.pixelStats(firstPixel.id, '24h', { unit: 'hour' });
            displayStats(stats24h, 'last 24 hours');
        } catch (error) {
            console.log(`⚠️  No stats available: ${error.message}`);
        }

        // Stats for last 7 days
        console.log('\n\n📊 Pixel Stats (last 7 days):');
        console.log('─'.repeat(60));
        try {
            const stats7d = await client.pixelStats(firstPixel.id, '7d', { unit: 'day' });
            displayStats(stats7d, 'last 7 days');
        } catch (error) {
            console.log(`⚠️  No stats available: ${error.message}`);
        }

        // 4. Search pixels (optional)
        if (pixels.length > 3) {
            const searchQuery = 'newsletter'; // Change to test search
            const searchResults = await client.pixels({ search: searchQuery, pageSize: 5 });
            console.log(`\n🔍 Search results for "${searchQuery}": ${searchResults?.data?.length || 0} found`);
        }

    } catch (error) {
        console.error(error);
    }
};

doIt().then(r => {});
