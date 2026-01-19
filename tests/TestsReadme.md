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
