/**
 * Test environment variables helper
 * 
 * STRICT SEPARATION:
 * - Runtime vars (UMAMI_*) are ONLY for runtime/client usage
 * - Test vars (UMAMI_TEST_*) are ONLY for test suite
 * 
 * No fallback between runtime and test vars!
 */

import {env} from 'node:process';

/**
 * Test environment configuration
 */
export const testEnv = {
    // ============================================
    // HOSTED MODE (Self-hosted Umami instance)
    // ============================================
    hostedServer: env.UMAMI_TEST_HOSTED_SERVER || '',
    user: env.UMAMI_TEST_USER || '',
    password: env.UMAMI_TEST_PASSWORD || '',
    hostedDomain: env.UMAMI_TEST_HOSTED_DOMAIN || '',
    
    // ============================================
    // CLOUD MODE (Umami Cloud)
    // ============================================
    cloudApiKey: env.UMAMI_TEST_CLOUD_API_KEY || '',
    cloudDomain: env.UMAMI_TEST_CLOUD_DOMAIN || '',
    
    // ============================================
    // TEST CONTROL FLAGS
    // ============================================
    skipLinks: env.UMAMI_TEST_LINKS === 'false',
    skipPixels: env.UMAMI_TEST_PIXELS === 'false',
    verbose: env.VERBOSE === 'true',
};

/**
 * Check if hosted mode test environment is configured
 */
export function hasHostedTestEnv() {
    return !!(testEnv.hostedServer && testEnv.user && testEnv.password);
}

/**
 * Check if cloud mode test environment is configured
 */
export function hasCloudTestEnv() {
    return !!testEnv.cloudApiKey;
}

/**
 * Get test mode based on available environment variables
 * @returns {'hosted'|'cloud'|null} Test mode or null if no valid config
 */
export function getTestMode() {
    if (hasCloudTestEnv()) {
        return 'cloud';
    }
    if (hasHostedTestEnv()) {
        return 'hosted';
    }
    return null;
}

/**
 * Skip test if hosted environment is not configured
 * Use in mocha before() hook
 */
export function skipIfNoHostedEnv(testContext) {
    if (!hasHostedTestEnv()) {
        console.log('⏭️  Skipping hosted tests (missing UMAMI_TEST_HOSTED_SERVER, UMAMI_TEST_USER, or UMAMI_TEST_PASSWORD)');
        testContext.skip();
    }
}

/**
 * Skip test if cloud environment is not configured
 * Use in mocha before() hook
 */
export function skipIfNoCloudEnv(testContext) {
    if (!hasCloudTestEnv()) {
        console.log('⏭️  Skipping cloud tests (missing UMAMI_TEST_CLOUD_API_KEY)');
        testContext.skip();
    }
}

/**
 * Skip test if no test environment is configured
 * Use in mocha before() hook
 */
export function skipIfNoTestEnv(testContext) {
    const mode = getTestMode();
    if (!mode) {
        console.log('⏭️  Skipping tests (no test environment configured)');
        console.log('   Set UMAMI_TEST_HOSTED_* or UMAMI_TEST_CLOUD_API_KEY environment variables');
        testContext.skip();
    }
}
