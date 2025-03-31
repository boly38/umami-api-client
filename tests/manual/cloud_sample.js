import UmamiClient from "../../lib/export.js" ;
// import UmamiClient from 'umami-api-client';

const doIt = async () => {
    try {
        const client = new UmamiClient();
        // default is // new UmamiClient({cloudApiKey:process.env.UMAMI_CLOUD_API_KEY});
        const identity = await client.me();
        console.log(`🔑 Api key details:\n${JSON.stringify(identity?.user,null,2)}`);

        const sitesData = await client.websites();
        const filteredSitesData = sitesData.map(({ id, name, createdAt, domain }) => ({ id, name, createdAt, domain }));
        console.log("🗂️ List of Tracked Websites:");
        console.table(filteredSitesData);

        const websiteStats = await client.websiteStats(sitesData[0].id);
        console.log(`📊 Website Stats for: ${sitesData[0].name}`);
        console.table(websiteStats);
    } catch(error) {
        console.error(error);
    }
};

doIt().then(r => {});