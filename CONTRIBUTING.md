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
cp ./env/initenv.template.sh ./env/initenv.dontpush.sh
# edit ./env/initenv.dontpush.sh then source it
. ./env/initenv.dontpush.sh
````

## HowTo test
* Then run manual test

````bash
. ./env/initenv.dontpush.sh
pnpm run test
# or with code coverage
pnpm run ci-test
````

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
