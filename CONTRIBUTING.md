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
