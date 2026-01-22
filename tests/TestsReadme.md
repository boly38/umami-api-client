# DEV note about tests

## Rules
- Don't duplicate, factorize
- `mocha`: Don't use arrow functions https://mochajs.org/#arrow-functions  
  (ex. `this.skip()` requires mocha context)

## Running tests

### All tests
```bash
pnpm test              # Run all tests
pnpm run ci-test       # Run all tests + coverage (c8)
```

### Single test file

**Linux/Mac**:
```bash
TST=30_env_based_cloud_umami pnpm run xtst
```

**Windows**:
```cmd
set TST=30_env_based_cloud_umami && pnpm run tst
```

### Available test files
- `10_negative.test.js` - Negative tests (errors expected)
- `20_env_based_hosted_umami.test.js` - Hosted mode core tests
- `30_env_based_cloud_umami.test.js` - Cloud mode core tests
- `40_links_api_hosted.test.js` - Links API tests (Hosted mode)
- `41_links_api_cloud.test.js` - Links API tests (Cloud mode)
- `50_pixels_api_hosted.test.js` - Pixels API tests (Hosted mode)
- `51_pixels_api_cloud.test.js` - Pixels API tests (Cloud mode)

### Environment Variables

**IMPORTANT**: Strict separation between runtime and test environments:

#### Runtime Variables (Client Usage Only)
```bash
UMAMI_SERVER          # Hosted server URL (runtime only, NOT for tests)
UMAMI_USER            # Hosted username (runtime only, NOT for tests)
UMAMI_PASSWORD        # Hosted password (runtime only, NOT for tests)
UMAMI_CLOUD_API_KEY   # Cloud API key (runtime only, NOT for tests)
```

#### Test Variables (Test Suite Only)
```bash
# Hosted mode tests
UMAMI_TEST_HOSTED_SERVER    # Server URL for tests
UMAMI_TEST_USER             # Username for tests
UMAMI_TEST_PASSWORD         # Password for tests
UMAMI_TEST_HOSTED_DOMAIN    # Test website domain

# Cloud mode tests
UMAMI_TEST_CLOUD_API_KEY    # Cloud API key for tests
UMAMI_TEST_CLOUD_DOMAIN     # Test website domain in cloud

# Test control (opt-out pattern)
UMAMI_TEST_LINKS=false      # Skip Links API tests
UMAMI_TEST_PIXELS=false     # Skip Pixels API tests
VERBOSE=true                # Enable verbose test output
```

### Environment setup

**Cloud mode**:
```bash
source env/initenv_cloud.dontpush.sh
TST=30_env_based_cloud_umami pnpm run xtst
```

**Hosted mode**:
```bash
source env/initenv_host.dontpush.sh
TST=20_env_based_hosted_umami pnpm run xtst
```

**Links API tests** (runs by default, requires links created in Umami):
```bash
# Hosted mode
source env/initenv_host_test.dontpush.sh
TST=40_links_api_hosted pnpm run xtst

# Cloud mode
source env/initenv_cloud_test.dontpush.sh
TST=41_links_api_cloud pnpm run xtst

# Skip Links tests if needed
UMAMI_TEST_LINKS=false pnpm test
```

**Pixels API tests** (runs by default, requires pixels created in Umami):
```bash
# Hosted mode
source env/initenv_host_test.dontpush.sh
TST=50_pixels_api_hosted pnpm run xtst

# Cloud mode
source env/initenv_cloud_test.dontpush.sh
TST=51_pixels_api_cloud pnpm run xtst

# Skip Pixels tests if needed
UMAMI_TEST_PIXELS=false pnpm test
```
