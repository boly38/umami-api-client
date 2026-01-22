#!/bin/bash
# Umami Cloud - TEST configuration
# Use this for test suite (NOT for runtime/client)
# Usage: TST=30_env_based_cloud_umami pnpm run xtst

# Clear hosted test mode (avoid conflicts)
unset UMAMI_TEST_HOSTED_SERVER

# Cloud test variables
export UMAMI_TEST_CLOUD_API_KEY="api_xxxyyyzzz"
export UMAMI_TEST_CLOUD_DOMAIN="example.com"
