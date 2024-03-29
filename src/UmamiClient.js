import queryString from 'query-string';
import fetch from 'node-fetch';
import { env } from 'node:process';

/** environment variables **/
let { UMAMI_CLIENT_DEBUG, UMAMI_CLIENT_DEBUG_REQUEST, UMAMI_CLIENT_DEBUG_RESPONSE } = env;
UMAMI_CLIENT_DEBUG = UMAMI_CLIENT_DEBUG === 'true';
UMAMI_CLIENT_DEBUG_REQUEST = UMAMI_CLIENT_DEBUG_REQUEST === 'true';
UMAMI_CLIENT_DEBUG_RESPONSE = UMAMI_CLIENT_DEBUG_RESPONSE === 'true';
const debugClient = msg => {
    if (UMAMI_CLIENT_DEBUG) {
        console.log(msg);
    }
};

const debugResponse = msg => {
    if (UMAMI_CLIENT_DEBUG_RESPONSE) {
        console.log(msg);
    }
};
const debugRequest = msg => {
    if (UMAMI_CLIENT_DEBUG_REQUEST) {
        console.log(msg);
    }
};

/**
 * this utility class implement Umami API CLient
 * https://umami.is/docs/api
 **/
class UmamiClient {

    constructor(options = {}) {
        const { UMAMI_SERVER } = env;
        this.server = "server" in options ? options.server : (isSet(UMAMI_SERVER) ? UMAMI_SERVER : null);
        this._assumeUmamiServer();
        debugClient(`UmamiClient - server:${this.server}`);
    }

    async login(username = env.UMAMI_USER, password = env.UMAMI_PASSWORD) {
        const authResponse = await fetch(this.server + "/api/auth/login",
            {
                method: 'POST', body: JSON.stringify({username, password}),
                headers: {'Content-Type': 'application/json'}
            }).catch(rethrow);
        await assumeResponseSuccess(authResponse, "Login failed");
        const authData = await authResponse.json();
        debugResponse(authData);
        return authData;
    }

    async getSites(authData) {
        givenAuthData(authData);
        const getSitesResponse = await fetch(this.server + "/api/websites",
            {headers: {"Authorization": `Bearer ${authData.token}`}}).catch(rethrow);
        await assumeResponseSuccess(getSitesResponse, "Unable to get sites");
        const sitesData = await getSitesResponse.json();
        debugResponse(sitesData);
        return sitesData.data;
    }

    selectSiteByDomain(sitesData, siteDomain = '*first*') {
        if (!isNotEmptyArray(sitesData)) {
            throw "No sites data provided";
        }
        if (!isUmamiSiteData(sitesData[0])) {
            throw "Unexpected sites data provided";
        }
        if (siteDomain === '*first*') {
            return sitesData[0];
        }
        return sitesData.find(d => d.domain === siteDomain);
    }

    async getWebSiteDataForAPeriod(authData, siteData, dataDescription = 'stats', dataPath = '/stats', period = '24h', options = {}) {
        givenAuthAndSiteData(authData, siteData);
        const queryOptions = enrichOptionsWithPeriod(options, period);
        const siteDataUrl = this.server + `/api/websites/${siteData.id}${dataPath}?` + queryString.stringify(queryOptions);
        debugRequest(`url:${siteDataUrl}`);
        const getDataResponse = await fetch(siteDataUrl, {headers: {"Authorization": `Bearer ${authData.token}`}}).catch(rethrow);
        await assumeResponseSuccess(getDataResponse, `Unable to get site ${dataDescription}`);
        const dataJson = await getDataResponse.json();
        debugResponse(dataJson);
        return dataJson;
    }

    // GET /api/website/{id}/stats
    /*
     * @deprecated : please use getStats(...)
     */
    async getStatsForLast24h(authData, siteData) {
        return await this.getStats(authData, siteData);
    }

    async getStats(authData, siteData, period = '24h') {
        return await this.getWebSiteDataForAPeriod(authData, siteData, 'stats', '/stats', period);
    }

    // GET /api/website/{id}/pageviews
    /*
     * @deprecated : please use getPageViews(...)
     */
    async getPageViewsForLast24h(authData, siteData, options = {unit: 'hour', tz: 'Europe/Paris'}) {
        return await this.getPageViews(authData, siteData, options, '24h');
    }

    async getPageViews(authData, siteData, options = {unit: 'hour', tz: 'Europe/Paris'}, period = '24h') {
        return await this.getWebSiteDataForAPeriod(authData, siteData, 'page views', '/pageviews', period, options);
    }

    // GET /api/website/{id}/events
    /*
     * @deprecated : please use getEvents(...)
     */
    async getEventsForLast24h(authData, siteData, options = {unit: 'hour', tz: 'Europe/Paris'}) {
        return await this.getEvents(authData, siteData, options);
    }

    async getEvents(authData, siteData, options = {unit: 'hour', tz: 'Europe/Paris'}, period = '24h') {
        return await this.getWebSiteDataForAPeriod(authData, siteData, 'page events', '/events', period, options);
    }

    // GET /api/website/{id}/metrics
    /*
     * @deprecated : please use getMetrics(...)
     */
    async getMetricsForLast24h(authData, siteData, options = {type: 'url'}) {
        return await this.getMetrics(authData, siteData, options);
    }

    async getMetrics(authData, siteData, options = {type: 'url'}, period = '24h') {
        return await this.getWebSiteDataForAPeriod(authData, siteData, 'metrics', '/metrics', period, options);
    }

    _assumeUmamiServer() {
        if (!isSet(this.server)) {
            throw new Error("server is required. ie. set UMAMI_SERVER environment variable or option.");
        }
    }
}

export default UmamiClient;

//~ private
const EXPECTED_SITE_DATA_KEYS = ['id', 'name', 'domain', 'createdAt'];
const isObject = (a) => (!!a) && (a.constructor === Object);
const isSet = (value) => value !== null && value !== undefined && value !== "";
const isNotEmptyArray = (value) => isSet(value) && Array.isArray(value) && value.length > 0;
const arrayIncludesAllOf = (arr, target) => target.every(v => arr.includes(v));
const isUmamiSiteData = (data) => isSet(data) && Object.keys(data).length >= EXPECTED_SITE_DATA_KEYS.length && arrayIncludesAllOf(Object.keys(data), EXPECTED_SITE_DATA_KEYS);
const rethrow = (err) => {
    throw new Error(err);
};
const assumeResponseSuccess = async function (response, errorMsg) {
    if (response.status < 200 || response.status > 299) {
        throw `${response.status} - ${errorMsg} - ` + await response.text();
    }
};
const givenAuthData = (authData) => {
    if (!isSet(authData) || !isSet(authData.token)) {
        throw "expect valid auth data to query api";
    }
};
const givenAuthAndSiteData = (authData, siteData) => {
    givenAuthData(authData);
    if (!isUmamiSiteData(siteData)) {
        throw "Unexpected site data provided";
    }
};
const HOUR_IN_MS = (60000 * 60);
const DAY_IN_MS = (HOUR_IN_MS * 24);
const HOUR_PERIODS = ['1h', '1hour', '60min'];
const DAY_PERIODS = ['1d', '1day', '24h', '24hours'];
const WEEK_PERIODS = ['7d', '7days', '1w', '1week'];
const MONTH_PERIODS = ['31d', '31days', '1m', '1month'];
const THIRTY_DAYS_PERIODS = ['30d', '30days'];
const ACCEPTED_PERIODS = [...HOUR_PERIODS, ...DAY_PERIODS, ...WEEK_PERIODS, ...MONTH_PERIODS, ...THIRTY_DAYS_PERIODS];
const buildPeriodOptions = (options, diffMs) => {
    const startAt = Date.now() + diffMs;
    const endAt = Date.now();
    options = {...options, startAt, endAt};
    return options;
};
const enrichOptionsWithPeriod = (options = {}, period = '24h') => {
    if (!isObject(options)) {
        throw "Unexpected options provided";
    }
    if (HOUR_PERIODS.includes(period)) {
        return buildPeriodOptions(options, -HOUR_IN_MS);
    } else if (DAY_PERIODS.includes(period)) {
        return buildPeriodOptions(options, -DAY_IN_MS);
    } else if (WEEK_PERIODS.includes(period)) {
        return buildPeriodOptions(options, -(7 * DAY_IN_MS));
    } else if (MONTH_PERIODS.includes(period)) {
        return buildPeriodOptions(options, -(31 * DAY_IN_MS));
    } else if (THIRTY_DAYS_PERIODS.includes(period)) {
        return buildPeriodOptions(options, -(30 * DAY_IN_MS));
    }
    throw `Unexpected period provided. Accepted values are : ${ACCEPTED_PERIODS}`;
};