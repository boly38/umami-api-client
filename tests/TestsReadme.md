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
- `20_env_based_hosted_umami.test.js` - Hosted mode tests
- `30_env_based_cloud_umami.test.js` - Cloud mode tests
- `40_links_api.test.js` - Links API tests (requires UMAMI_TEST_LINKS=true)
- `50_pixels_api.test.js` - Pixels API tests (requires UMAMI_TEST_PIXELS=true)

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

**Links API tests** (requires links created in Umami):
```bash
# Cloud mode
export UMAMI_TEST_LINKS=true
source env/initenv_cloud.dontpush.sh
TST=40_links_api pnpm run xtst

# Hosted mode
export UMAMI_TEST_LINKS=true
source env/initenv_host.dontpush.sh
TST=40_links_api pnpm run xtst
```

**Pixels API tests** (requires pixels created in Umami):
```bash
# Cloud mode
export UMAMI_TEST_PIXELS=true
source env/initenv_cloud.dontpush.sh
TST=50_pixels_api pnpm run xtst

# Hosted mode
export UMAMI_TEST_PIXELS=true
source env/initenv_host.dontpush.sh
TST=50_pixels_api pnpm run xtst
```
