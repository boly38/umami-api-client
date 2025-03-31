import {env} from 'node:process';
import {isSet} from "./utils.js";
import {expect} from 'chai';
import {strict as assert} from 'assert';
//~ log methods
export const infoAboutTestEnv = () => console.info("You could switch to verbose mode by setting UMAMI_TEST_VERBOSE=true, and/or UMAMI_CLIENT_DEBUG_REQUEST UMAMI_CLIENT_DEBUG_RESPONSE");
export const logWebsite = website => console.info(` * #${website.id} created_at:${website.createdAt} - name:${website.name} domain:${website.domain}`);

//~ setup methods
export const expectEnvNotSet = values => {
    values.forEach(v => expect(env[v], `expect env:${v} to be undefined`).to.be.undefined);
};
export const noCommandLineEnv = () => {
    expectEnvNotSet(["UMAMI_SITE_DOMAIN", "UMAMI_SERVER", "UMAMI_USER", "UMAMI_PASSWORD", "UMAMI_API_KEY"]);
};

//~ check methods
export const expectTestInputOrSkip = (name, data, skipCb) => {
    if (!isSet(data)) {
        console.log(`skip() without ${name}`);
        skipCb();
    }
};
export const assumeObjectResult = (description, siteResult, verbose = false) => {
    if (!isSet(siteResult)) {
        expect.fail(`expect ${description} to be set`);
    } else if (verbose) {
        console.info(` * ${description}:\n${JSON.stringify(siteResult)}`);
    }
};
export const mayBeEmpty = true;
export const assumeListResult = (description, siteResultList, mayBeEmpty = false, verbose = false) => {
    if (!isSet(siteResultList)) {
        expect.fail(`expect list ${description} to be set`);
    } else if (siteResultList.length === 0 && verbose) {
        console.info(" x none");
    } else if (verbose) {
        console.info(` * ${description}:\n${JSON.stringify(siteResultList)}`);
    } else {
        console.info(` * ${description}:\t${siteResultList.length} result(s)`);
    }
    if (!mayBeEmpty) {
        expect(siteResultList).to.not.be.empty;
    }
};
export const expectNotEmptyWebsites = (websites, verbose = false) => {
    if (!isSet(websites) || websites.length < 1) {
        console.info(" x none");
    } else if (verbose) {
        websites.forEach(logWebsite);
    }
    expect(websites).to.not.be.empty;
};
export const expectRequiredWebsiteId = async callable => {
    try {
        await callable(/*websiteId*/undefined);
    } catch (error) {
        assert.equal(error.message, "websiteId is required and must be a non-empty string.",
            "wrong error message for missing websiteId case");
    }
};
export const expectValidWebsiteId = async callable => {
    try {
        await callable("too much exotic");
    } catch (error) {
        assert.equal(error.message, "Invalid websiteId UID format. Must be a valid UUID-like string.",
            "wrong error message for invalid websiteId case");
    }
};
export const expectValidPeriod = async (callable, websiteId, period) => {
    try {
        await callable(websiteId, period);
    } catch (error) {
        //Accepted values are : 1h,1hour,60min,1d,1day,24h,24hours,7d,7days,1w,1week,31d,31days,1m,1month,30d,30days
        expect(error.message).to.have.string('Unexpected period provided');
        expect(error.message).to.have.string('Accepted values are');
        expect(error.message).to.have.string('24h');
        expect(error.message).to.have.string('1w');
    }
};