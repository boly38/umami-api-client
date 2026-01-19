/**
 * Test manual: Auth Cloud mode avec Umami v3
 * 
 * Setup:
 * export UMAMI_CLOUD_API_KEY="your-api-key"
 * 
 * Run:
 * node tests/manual/test_v3_cloud_auth.js
 */

import UmamiClient from '../../lib/export.js';

const testCloudAuth = async () => {
    console.log('🧪 Test Umami v3 Cloud Auth\n');
    
    try {
        // 1. Init client
        const client = new UmamiClient();
        console.log('✅ Client initialized (Cloud mode)');
        console.log(`   Server: ${client.umamiBaseUrl}\n`);
        
        // 2. Test me() - validate API key
        console.log('🔑 Testing me() endpoint...');
        const identity = await client.me();
        
        console.log('✅ Authentication successful!');
        console.log('\n📋 User info:');
        console.log(JSON.stringify(identity?.user, null, 2));
        
        // 3. Test websites()
        console.log('\n🗂️  Testing websites() endpoint...');
        const websites = await client.websites();
        
        console.log(`✅ Found ${websites.length} website(s)`);
        
        if (websites.length > 0) {
            const site = websites[0];
            console.log('\n📊 First website:');
            console.log(`   ID: ${site.id}`);
            console.log(`   Name: ${site.name}`);
            console.log(`   Domain: ${site.domain}`);
            console.log(`   Created: ${site.createdAt}`);
            
            // 4. Test websiteStats() - basic v3 endpoint
            console.log('\n📈 Testing websiteStats() endpoint...');
            const stats = await client.websiteStats(site.id, '24h');
            
            console.log('✅ Stats retrieved successfully!');
            console.log('\n📊 24h Stats:');
            console.log(`   PageViews: ${stats.pageviews?.value || stats.pageviews || 'N/A'}`);
            console.log(`   Visitors: ${stats.visitors?.value || stats.visitors || 'N/A'}`);
            console.log(`   Visits: ${stats.visits?.value || stats.visits || 'N/A'}`);
            console.log(`   Bounce rate: ${stats.bounces?.value || stats.bounces || 'N/A'}`);
            
            // Debug: show full stats structure
            console.log('\n🔍 Full stats structure (v3):');
            console.log(JSON.stringify(stats, null, 2));
        }
        
        console.log('\n\n✅ ALL TESTS PASSED! Umami v3 Cloud is working! 🎉');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error(`Error: ${error.message}`);
        console.error('\nStack:', error.stack);
        process.exit(1);
    }
};

// Run test
testCloudAuth().then(() => {
    console.log('\n✨ Test completed successfully');
    process.exit(0);
});
