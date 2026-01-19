#!/bin/bash
# Umami hosted server to test
#  TST=20_env_based_hosted_umami pnpm run xtst
unset UMAMI_CLOUD_API_KEY
unset UMAMI_TEST_CLOUD_API_KEY
unset UMAMI_SERVER
unset UMAMI_USER
unset UMAMI_PASSWORD
export UMAMI_TEST_HOSTED_SERVER="https://umami.replace-me.exemple.com"
export UMAMI_TEST_USER="admin"
export UMAMI_TEST_PASSWORD="12333321"
