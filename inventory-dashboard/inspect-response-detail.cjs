const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function detailInspect() {
    console.log("Detailed Inspect...");
    try {
        const r = await boltic.records.findAll("response-table", { page: { page_size: 1 } });
        if (r.data && r.data.length > 0) {
            console.log("All Keys:", Object.keys(r.data[0]));
            console.log("Full Record:", JSON.stringify(r.data[0], null, 2));
        }
    } catch(e) { console.error(e); }
}
detailInspect();
