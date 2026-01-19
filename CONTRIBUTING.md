# How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions).

* you could also fork, feature branch, then submit a pull request.

## HowTo setup

* Install NodeJs and pnpm
* Clone
* Install deps
* setup your test environment (cf. [initenv.template.sh](./env/initenv.template.sh))

````bash
git clone https://github.com/boly38/umami-api-client.git
cd umami-api-client
pnpm install
# setup test env
cp ./env/initenv_project.template.sh ./env/initenv_project.dontpush.sh
# edit ./env/initenv_project.dontpush.sh then source it
. ./env/initenv_project.dontpush.sh
````

## HowTo test

### Run all tests
````bash
. ./env/initenv_project.dontpush.sh
# run all tests
pnpm run test
# run all tests with code coverage
pnpm run ci-test
````

### Run single test file

**Linux/Mac**:
````bash
. ./env/initenv_cloud.dontpush.sh
TST=30_env_based_cloud_umami pnpm run xtst
````

**Windows**:
````cmd
call env\initenv_cloud.dontpush.sh
set TST=30_env_based_cloud_umami && pnpm run tst
````

Available test files: `10_negative`, `20_env_based_hosted_umami`, `30_env_based_cloud_umami`

## HowTo release using Gren

```bash
# provide PAT with permissions to create release on current repository
export GREN_GITHUB_TOKEN=your_token_here
pnpm i -g github-release-notes@latest

git fetch --all && git pull
# make a release vX with all history
gren release --data-source=prs -t v2.2.2 --milestone-match=v2.2.2
# overrides release vX with history from vX-1
gren release --data-source=prs -t "v2.2.2..v2.2.1" --milestone-match="v2.2.2" --override
```
