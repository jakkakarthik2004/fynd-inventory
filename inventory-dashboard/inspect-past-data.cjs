const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function inspectPastData() {
    console.log("Inspecting 'past_data'...");
    try {
        const r = await boltic.records.findAll("past_data", { page: { page_size: 1 } });
        if (r.data && r.data.length > 0) {
            console.log("Sample Record:", JSON.stringify(r.data[0], null, 2));
        } else {
            console.log("No records found in 'past-data'.");
             const tables = await boltic.tableResource.tablesApiClient.listTables();
             const tab = tables.data.find(t => t.name === "past-data" || t.display_name === "past-data");
             if (tab) console.log("Table found but empty:", tab.id);
             else console.log("Table 'past-data' NOT found.");
        }
    } catch(e) { console.error("Error:", e.message); }
}
inspectPastData();
