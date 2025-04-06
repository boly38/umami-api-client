import queryString from 'query-string';
import fetch from 'node-fetch';
import {env} from 'node:process';

const UMAMI_CLOUD_SERVER = "https://api.umami.is";
/** environment variables **/
let {UMAMI_CLIENT_DEBUG, UMAMI_CLIENT_DEBUG_REQUEST, UMAMI_CLIENT_DEBUG_RESPONSE} = env;
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
export default class UmamiClient {

    constructor(options = {}) {
        this.lastAuthData = null;
        const {UMAMI_SERVER, UMAMI_CLOUD_API_KEY} = env;
        this.cloudApiKey = "cloudApiKey" in options ? options.cloudApiKey : (isSet(UMAMI_CLOUD_API_KEY) ? UMAMI_CLOUD_API_KEY : null);
        this.server = "server" in options ? options.server : (isSet(UMAMI_SERVER) ? UMAMI_SERVER : null);
        if (isSet(this.cloudApiKey) && isSet(this.server) && this.server !== UMAMI_CLOUD_SERVER) {
            throw new Error("UMAMI_SERVER and UMAMI_CLOUD_API_KEY can't be both set. You must choose between cloud or hosted mode.");
        }
        if (isSet(this.cloudApiKey) && !isSet(this.server)) {
            this.server = UMAMI_CLOUD_SERVER;
        }
        this.assumeUmamiApiUrl();
        debugClient(`UmamiClient - server:${this.server}`);
    }

    assumeUmamiApiUrl() {
        //~ cloud mode
        if (this.isCloudMode()) {
            this.umamiBaseUrl = `${UMAMI_CLOUD_SERVER}/v1`;
            debugClient(`* use Umami cloud server (${this.umamiBaseUrl})`);
            return;
        }
        //~ else hosted mode
        if (!isSet(this.server)) {
            throw new Error("server is required. ie. set UMAMI_SERVER environment variable or option.");
        }
        this.umamiBaseUrl = `${this.server}/api`;
        debugClient(`* use Umami hosted server (${this.umamiBaseUrl})`);
    }

    isCloudMode() {
        return isSet(this.cloudApiKey);
    }

    logout() {
        if (this.isCloudMode()) {
            throw new Error("logout is reserved for hosted mode.");
        }
        this.lastAuthData = null;
    }

    /**
     * hosted mode only
     * @param username
     * @param password
     * @returns {Promise<unknown>} authData
     */
    async login(username = env.UMAMI_USER, password = env.UMAMI_PASSWORD) {
        if (this.isCloudMode()) {
            throw new Error("login is reserved for hosted mode.");
        }
        const authResponse = await fetch(`${this.umamiBaseUrl}/auth/login`,
            {
                method: 'POST', body: JSON.stringify({username, password}),
                headers: {'Content-Type': 'application/json'}
            }).catch(rethrow);
        await assumeResponseSuccess(authResponse, `Login failed`);
        const authData = await authResponse.json();
        this.lastAuthData = authData;
        debugResponse(authData);
        return authData;
    }

    // TODO : POST /auth/verify - postponed in 2.0.17's next version
    //  as there is bug on method to use (v2.0.17 - verify works only with GET)
    async verify() {
        throw new Error("NotYetAvailable - wait for https://github.com/umami-software/umami/issues/3339");
    }

    /**
     * cloud mode only
     * check apiKey and return self information
     * @returns {Promise<unknown>}
     */
    async me() {
        const headers = this.authHeaders();
        const url = `${this.umamiBaseUrl}/me`;
        debugRequest(`headers:${Object.keys(headers)} url:${url}`);
        const meResponse = await fetch(url, {headers});
        if (meResponse.status !== 200) {
            throw new Error("Invalid UMAMI_CLOUD_API_KEY");
        }
        const meData = await meResponse.json();
        debugResponse(meData);
        return meData;
    }

    /**
     * provide ready-to-use headers for umami fetch api call
     * - hosted mode : use bearer
     * - cloud mode : use api-key
     */
    authHeaders() {
        if (!isSet(this.lastAuthData) && !this.isCloudMode()) {
            throw new Error("Authentication is required : please login first (or provide an api key for the cloud mode)");
        }
        let headers = {"Accept": "application/json"};
        if (!this.isCloudMode()) {// hosted mode
            headers.Authorization = `Bearer ${this.lastAuthData?.token}`;
        } else {// cloud mode
            headers["x-umami-api-key"] = this.cloudApiKey;
        }
        return headers;
    }

    /**
     * list websites
     * @returns {Promise<*>}
     */
    async websites() {
        const headers = this.authHeaders();
        const getSitesResponse = await fetch(`${this.umamiBaseUrl}/websites`, {headers});
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

    // GET /api/website/{id}/{dataPath}
    async websiteData(websiteId, dataPath = 'stats', period = "24h",
                      options = {unit: 'hour', timezone: 'Europe/Paris'}) {
        this.validateUID(websiteId, "websiteId");
        const queryOptions = enrichOptionsWithPeriod(options, period);
        const headers = this.authHeaders();
        const siteDataUrl = `${this.umamiBaseUrl}/websites/${websiteId}/${dataPath}?` + queryString.stringify(queryOptions);
        debugRequest(`url:${siteDataUrl}`);
        const getDataResponse = await fetch(siteDataUrl, {headers});
        await assumeResponseSuccess(getDataResponse, `Unable to get site ${dataPath}`);
        const dataJson = await getDataResponse.json();
        debugResponse(dataJson);
        return dataJson;
    }

    // GET /api/website/{id}/stats
    // https://umami.is/docs/api/website-stats-api#get-apiwebsiteswebsiteidstats
    async websiteStats(websiteId, period = "24h", options = {unit: 'hour', timezone: 'Europe/Paris'}) {
        return this.websiteData(websiteId, 'stats', period, options);
    }

    // GET /api/website/{id}/pageviews
    // https://umami.is/docs/api/website-stats-api#get-apiwebsiteswebsiteidpageviews
    async websitePageViews(websiteId, period = "24h", options = {
        unit: 'hour', timezone: 'Europe/Paris'
        /* url, referrer, title, host, os, browser, device, country, region, city */
    }) {
        return this.websiteData(websiteId, 'pageviews', period, options);
    }

    // GET /api/website/{id}/events
    // https://umami.is/docs/api/events-api#get-apiwebsiteswebsiteidevents
    async websiteEvents(websiteId, period = "24h", options = {
        /* query, page, pageSize, orderBy */
    }) {
        return this.websiteData(websiteId, 'events', period, options);
    }

    // GET /api/website/{id}/sessions
    // https://umami.is/docs/api/sessions-api#get-apiwebsiteswebsiteidsessions
    async websiteSessions(websiteId, period = "24h", options = {
        /* query, page, pageSize, orderBy */
    }) {
        return this.websiteData(websiteId, 'sessions', period, options);
    }

    // GET /api/website/{id}/metrics
    // https://umami.is/docs/api/website-stats-api#get-apiwebsiteswebsiteidmetrics
    async websiteMetrics(websiteId, period = "24h", options = {type: 'url', unit: 'hour', timezone: 'Europe/Paris'}) {
        return this.websiteData(websiteId, 'metrics', period, options);
    }

    validateUID(uid, name) {
        if (!uid || typeof uid !== 'string' || uid.trim() === '') {
            throw new Error(`${name} is required and must be a non-empty string.`);
        }

        const minLength = 10; // min length
        const maxLength = 50; // max length
        const validChars = /^[0-9a-f-]+$/i;

        if (uid.length < minLength || uid.length > maxLength || !validChars.test(uid)) {
            throw new Error(`Invalid ${name} UID format. Must be a valid UUID-like string.`);
        }
        return true;
    }

    //~ DEPRECATED WORLD

    /**
     * @deprecated : use now websites() - to be removed in futur version
     */
    async getSites(authData) {
        this.lastAuthData = authData;
        return this.websites();
    }

    /**
     * @deprecated : please use websiteStats(id, period) - to be removed in futur version
     */
    async getStats(authData, siteData, period = '24h') {
        this.lastAuthData = authData;
        return await this.websiteStats(siteData.id, period);
    }

    /**
     * @deprecated : please use websiteStats(id, '24h') - to be removed in futur version
     */
    async getStatsForLast24h(authData, siteData) {
        this.lastAuthData = authData;
        return await this.websiteStats(siteData.id, '24h');
    }

    /**
     * @deprecated : please use websitePageViews(id, period, options) - to be removed in futur version
     */
    async getPageViews(authData, siteData, options = {unit: 'hour', timezone: 'Europe/Paris'}, period = '24h') {
        this.lastAuthData = authData;
        return await this.websitePageViews(siteData.id, period, options);
    }

    /**
     * @deprecated : please use websitePageViews(id, '24h', options) - to be removed in futur version
     */
    async getPageViewsForLast24h(authData, siteData, options = {unit: 'hour', timezone: 'Europe/Paris'}) {
        this.lastAuthData = authData;
        return await this.websitePageViews(siteData.id, '24h', options);
    }

    /**
     * @deprecated : please use websiteEvents(id, '24h', options) - to be removed in futur version
     */
    async getEventsForLast24h(authData, siteData, options = {unit: 'hour', timezone: 'Europe/Paris'}) {
        this.lastAuthData = authData;
        return await this.websiteEvents(siteData.id, '24h', options);
    }

    /**
     * @deprecated : please use websiteEvents(id, period, options) - to be removed in futur version
     */
    async getEvents(authData, siteData, options = {unit: 'hour', timezone: 'Europe/Paris'}, period = '24h') {
        this.lastAuthData = authData;
        return await this.websiteEvents(siteData.id, period, options);
    }

    /**
     * @deprecated : use now websiteStats(...) or websitePageviews - to be removed in futur version
     */
    async getWebSiteDataForAPeriod(authData, siteData, dataDescription = 'stats', dataPath = '/stats', period = '24h', options = {}) {
        this.lastAuthData = authData;
        return this.websiteData(siteData.id, dataPath.split('/')[0], period, options);
    }

    /**
     * @deprecated : use now websiteMetrics(siteData.id, '24h', options) - to be removed in futur version
     */
    async getMetricsForLast24h(authData, siteData, options) {
        this.lastAuthData = authData;
        return await this.websiteMetrics(siteData.id, '24h', options);
    }

    /**
     * @deprecated : use now websiteMetrics(siteData.id, period, options) - to be removed in futur version
     */
    async getMetrics(authData, siteData, options, period = '24h') {
        this.lastAuthData = authData;
        return await this.websiteMetrics(siteData.id, period, options);
    }

}

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
        throw new Error(`${response.status} - ${errorMsg} - ` + await response.text());
    }
};
const givenAuthData = (authData) => {
    if (!isSet(authData) || !isSet(authData.token)) {
        throw new Error("expect valid auth data to query api");
    }
};
const givenAuthAndSiteData = (authData, siteData) => {
    givenAuthData(authData);
    if (!isUmamiSiteData(siteData)) {
        throw new Error("Unexpected site data provided");
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
        throw new Error("Unexpected options provided");
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
    throw new Error(`Unexpected period provided. Accepted values are : ${ACCEPTED_PERIODS}`);
};