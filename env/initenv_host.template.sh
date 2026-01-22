#!/bin/bash

#!/bin/bash
# Umami hosted server - RUNTIME configuration
# Use this for runtime/client usage (NOT for tests)

# Clear cloud mode (avoid conflicts)
unset UMAMI_CLOUD_API_KEY

# Runtime variables (client usage)
export UMAMI_SERVER="https://umami.replace-me.exemple.com"
export UMAMI_USER="admin"
export UMAMI_PASSWORD="your-password"
