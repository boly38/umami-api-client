#!/bin/bash
#!/bin/bash
# Umami hosted server - TEST configuration
# Use this for test suite (NOT for runtime/client)
# Usage: TST=20_env_based_hosted_umami pnpm run xtst

# Clear cloud test mode (avoid conflicts)
unset UMAMI_TEST_CLOUD_API_KEY

# Hosted test variables
export UMAMI_TEST_HOSTED_SERVER="https://umami.replace-me.exemple.com"
export UMAMI_TEST_HOSTED_DOMAIN="example.com"
export UMAMI_TEST_USER="admin"
export UMAMI_TEST_PASSWORD="your-password"
