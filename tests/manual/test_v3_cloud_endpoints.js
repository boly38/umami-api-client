/**
 * Test manual: Tous les endpoints Cloud v3
 * 
 * Setup:
 * export UMAMI_CLOUD_API_KEY="your-api-key"
 * 
 * Run:
 * source env/initenv_cloud.dontpush.sh
 * node tests/manual/test_v3_cloud_endpoints.js
 */

import UmamiClient from '../../lib/export.js';

const testAllEndpoints = async () => {
    console.log('🧪 Test complet Umami v3 Cloud - Tous les endpoints\n');
    
    const results = {
        compatible: [],
        breaking: [],
        errors: []
    };
    
    try {
        // Init client
        const client = new UmamiClient();
        console.log('✅ Client initialized\n');
        
        // Get first website for tests
        const websites = await client.websites();
        if (websites.length === 0) {
            throw new Error('No websites found. Cannot test endpoints.');
        }
        
        const site = websites[0];
        console.log(`📊 Testing with website: ${site.name} (${site.domain})\n`);
        console.log('─'.repeat(80));
        
        // ===== TEST 1: websiteStats =====
        console.log('\n1️⃣  Testing websiteStats(id, "24h")...');
        try {
            const stats = await client.websiteStats(site.id, '24h');
            console.log('   ✅ Request successful');
            console.log('   📋 Structure:');
            console.log(JSON.stringify(stats, null, 6));
            
            // Check structure
            if (typeof stats.pageviews === 'number') {
                results.breaking.push({
                    method: 'websiteStats',
                    reason: 'Values are now direct numbers (not objects with .value)',
                    v2: '{ pageviews: { value: X } }',
                    v3: '{ pageviews: X }'
                });
                console.log('   ⚠️  BREAKING: Values are direct numbers (v2 had .value)');
            }
            if (stats.comparison) {
                results.breaking.push({
                    method: 'websiteStats',
                    reason: 'New field: comparison (period comparison)',
                    added: 'comparison object'
                });
                console.log('   ℹ️  NEW: comparison field added');
            }
        } catch (error) {
            results.errors.push({ method: 'websiteStats', error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(80));
        
        // ===== TEST 2: websitePageViews =====
        console.log('\n2️⃣  Testing websitePageViews(id, "24h", {unit: "hour"})...');
        try {
            const pageviews = await client.websitePageViews(site.id, '24h', {
                unit: 'hour',
                timezone: 'Europe/Paris'
            });
            console.log('   ✅ Request successful');
            console.log('   📋 Structure:');
            console.log(JSON.stringify(pageviews, null, 6));
            
            // Check if structure changed
            if (Array.isArray(pageviews)) {
                if (pageviews.length > 0) {
                    const first = pageviews[0];
                    console.log('   ℹ️  First item keys:', Object.keys(first));
                }
                results.compatible.push({ method: 'websitePageViews', note: 'Array structure maintained' });
            } else {
                results.breaking.push({
                    method: 'websitePageViews',
                    reason: 'Structure changed from v2',
                    structure: typeof pageviews
                });
            }
        } catch (error) {
            results.errors.push({ method: 'websitePageViews', error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(80));
        
        // ===== TEST 3: websiteMetrics =====
        console.log('\n3️⃣  Testing websiteMetrics(id, "24h", {type: "path"})...');
        try {
            const metricsPath = await client.websiteMetrics(site.id, '24h', {
                type: 'path',
                unit: 'hour',
                timezone: 'Europe/Paris'
            });
            console.log('   ✅ Request successful');
            console.log('   📋 Structure (first 3 items):');
            console.log(JSON.stringify(metricsPath?.slice(0, 3) || metricsPath, null, 6));

            if (Array.isArray(metricsPath)) {
                results.compatible.push({ method: 'websiteMetrics (path)', note: 'Array structure OK' });
            }
        } catch (error) {
            results.errors.push({ method: 'websiteMetrics (path)', error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(80));
        
        // ===== TEST 4: websiteMetrics (event) =====
        console.log('\n4️⃣  Testing websiteMetrics(id, "24h", {type: "event"})...');
        try {
            const metricsEvent = await client.websiteMetrics(site.id, '24h', {
                type: 'event',
                unit: 'hour',
                timezone: 'Europe/Paris'
            });
            console.log('   ✅ Request successful');
            console.log('   📋 Structure (first 3 items):');
            console.log(JSON.stringify(metricsEvent?.slice(0, 3) || metricsEvent, null, 6));
            
            if (Array.isArray(metricsEvent)) {
                results.compatible.push({ method: 'websiteMetrics (event)', note: 'Array structure OK' });
            }
        } catch (error) {
            results.errors.push({ method: 'websiteMetrics (event)', error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(80));
        
        // ===== TEST 5: websiteEvents =====
        console.log('\n5️⃣  Testing websiteEvents(id, "24h")...');
        try {
            const events = await client.websiteEvents(site.id, '24h', {
                pageSize: 10
            });
            console.log('   ✅ Request successful');
            console.log('   📋 Structure:');
            console.log(JSON.stringify(events, null, 6));
            
            if (events.data && Array.isArray(events.data)) {
                results.compatible.push({ method: 'websiteEvents', note: 'Paginated structure OK' });
                console.log(`   ℹ️  Found ${events.data.length} events (paginated)`);
            }
        } catch (error) {
            results.errors.push({ method: 'websiteEvents', error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(80));
        
        // ===== TEST 6: websiteSessions =====
        console.log('\n6️⃣  Testing websiteSessions(id, "24h")...');
        try {
            const sessions = await client.websiteSessions(site.id, '24h', {
                pageSize: 5,
                orderBy: '-createdAt'
            });
            console.log('   ✅ Request successful');
            console.log('   📋 Structure:');
            console.log(JSON.stringify(sessions, null, 6));
            
            if (sessions.data && Array.isArray(sessions.data)) {
                results.compatible.push({ method: 'websiteSessions', note: 'Paginated structure OK' });
                console.log(`   ℹ️  Found ${sessions.data.length} sessions (paginated)`);
            }
        } catch (error) {
            results.errors.push({ method: 'websiteSessions', error: error.message });
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(80));
        
        // ===== SUMMARY =====
        console.log('\n\n📊 TEST SUMMARY\n');
        console.log('═'.repeat(80));
        
        console.log(`\n✅ COMPATIBLE (${results.compatible.length}):`);
        results.compatible.forEach(r => {
            console.log(`   - ${r.method}: ${r.note}`);
        });
        
        console.log(`\n⚠️  BREAKING CHANGES (${results.breaking.length}):`);
        results.breaking.forEach(r => {
            console.log(`   - ${r.method}: ${r.reason}`);
            if (r.v2) console.log(`     v2: ${r.v2}`);
            if (r.v3) console.log(`     v3: ${r.v3}`);
            if (r.added) console.log(`     Added: ${r.added}`);
        });
        
        console.log(`\n❌ ERRORS (${results.errors.length}):`);
        if (results.errors.length === 0) {
            console.log('   None! 🎉');
        } else {
            results.errors.forEach(r => {
                console.log(`   - ${r.method}: ${r.error}`);
            });
        }
        
        console.log('\n' + '═'.repeat(80));
        
        if (results.errors.length === 0) {
            console.log('\n✅ ALL ENDPOINTS TESTED SUCCESSFULLY! 🎉');
        } else {
            console.log('\n⚠️  Some endpoints failed. See errors above.');
        }
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR!');
        console.error(`Error: ${error.message}`);
        console.error('\nStack:', error.stack);
        process.exit(1);
    }
};

// Run test
testAllEndpoints().then(() => {
    console.log('\n✨ Test completed');
    process.exit(0);
}).catch(err => {
    console.error('\n💥 Unhandled error:', err);
    process.exit(1);
});
