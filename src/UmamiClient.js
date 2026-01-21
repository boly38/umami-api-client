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
    // Note: In Umami v3, 'url' type was renamed to 'path'
    async websiteMetrics(websiteId, period = "24h", options = {type: 'path', unit: 'hour', timezone: 'Europe/Paris'}) {
        return this.websiteData(websiteId, 'metrics', period, options);
    }

    //~ Links API (Umami v3.x) - READ-ONLY

    /**
     * Get all links (short URLs tracking)
     * GET /api/links
     * @param {Object} options - Query options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.pageSize - Results per page (default: 50)
     * @param {string} options.search - Search text
     * @param {string} options.orderBy - Sort field (default: 'createdAt')
     * @returns {Promise<Object>} Links data with pagination
     */
    async links(options = {}) {
        const defaultOptions = {page: 1, pageSize: 50};
        const queryOptions = {...defaultOptions, ...options};
        const headers = this.authHeaders();
        const url = `${this.umamiBaseUrl}/links?` + queryString.stringify(queryOptions);
        debugRequest(`url:${url}`);
        const response = await fetch(url, {headers});
        await assumeResponseSuccess(response, 'Unable to get links');
        const data = await response.json();
        debugResponse(data);
        return data;
    }

    /**
     * Get a single link by ID
     * GET /api/links/:linkId
     * @param {string} linkId - Link UUID
     * @returns {Promise<Object>} Link details
     */
    async getLink(linkId) {
        this.validateUID(linkId, 'linkId');
        const headers = this.authHeaders();
        const url = `${this.umamiBaseUrl}/links/${linkId}`;
        debugRequest(`url:${url}`);
        const response = await fetch(url, {headers});
        await assumeResponseSuccess(response, 'Unable to get link');
        const data = await response.json();
        debugResponse(data);
        return data;
    }

    /**
     * Get link statistics
     * Note: In Umami v3, links use the websites stats endpoint with linkId as websiteId
     * This is an alias for websiteStats() for semantic clarity when working with links
     * @param {string} linkId - Link UUID (used as websiteId in the stats endpoint)
     * @param {string} period - Time period (1h, 24h, 7d, 30d, etc.)
     * @param {Object} options - Query options
     * @param {string} options.unit - Time unit (hour, day, month, year)
     * @param {string} options.timezone - Timezone (default: 'Europe/Paris')
     * @returns {Promise<Object>} Link statistics
     */
    async linkStats(linkId, period = '24h', options = {unit: 'hour', timezone: 'Europe/Paris'}) {
        // Links use the websites stats endpoint: GET /api/websites/:linkId/stats
        // where linkId serves as the websiteId
        return this.websiteStats(linkId, period, options);
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