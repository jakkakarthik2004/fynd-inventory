const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function inspectResponseTable() {
    console.log("Inspecting 'response-table'...");
    try {
        // Fetch 1 record to see structure
        const r = await boltic.records.findAll("response-table", { page: { page_size: 1 } });
        if (r.data && r.data.length > 0) {
            console.log("Sample Record:", JSON.stringify(r.data[0], null, 2));
        } else {
            console.log("No records found. Listing columns...");
            // If empty, list columns to guess structure
             const tables = await boltic.tableResource.tablesApiClient.listTables();
             const tab = tables.data.find(t => t.name === "response-table" || t.display_name === "response-table");
             if (tab) {
                 const cols = await boltic.columnResource.columnsApiClient.listColumns(tab.id);
                 const colNames = cols.data.map(c => c.name || c.display_name);
                 console.log("Columns:", colNames);
             } else {
                 console.log("Table 'response-table' not found.");
             }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

inspectResponseTable();
