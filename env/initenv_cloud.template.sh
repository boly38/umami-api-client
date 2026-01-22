#!/bin/bash

#!/bin/bash
# Umami Cloud - RUNTIME configuration
# API access via api key - https://cloud.umami.is/api-keys
# Use this for runtime/client usage (NOT for tests)

# Clear hosted mode (avoid conflicts)
unset UMAMI_SERVER
unset UMAMI_USER
unset UMAMI_PASSWORD

# Runtime variables (client usage)
export UMAMI_CLOUD_API_KEY="api_xxxyyyzzz"
