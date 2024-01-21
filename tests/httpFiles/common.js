const verifyReturnCode = (client, response, code ) => {
    client.test(`Request executed successfully with code=${code}`, function() {
        client.assert(response.status === code, `Response status is not ${code}`);
    });
};

const CURRENT_WEBSITE_ID = "current_website_id";
const unsetWebsiteId = (client) => client.global.set(CURRENT_WEBSITE_ID, null);

const listSetWebsiteId = (client, response) => {
    const data = response.body.data;
    const total = response.body.count;
    if (total > 0) {
        const website = data[0];
        client.global.set(CURRENT_WEBSITE_ID, website.id);
        client.log(`${total} website - selected : ${website.name} #${website.id}`);
    } else {
        client.log(`no websites`);
    }
};

export { verifyReturnCode, unsetWebsiteId, listSetWebsiteId};