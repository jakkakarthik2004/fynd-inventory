const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function listCols() {
    console.log("Listing columns for 'duplicate'...");
    try {
        // Assuming listColumns(tableName) or (tableId)
        // Also sometimes it returns a promise that resolves to { data: ... }
        const r = await boltic.columnResource.columnsApiClient.listColumns("duplicate");
        console.log("Columns Response Keys:", Object.keys(r));
        if (r.data) {
             console.log("Columns:", JSON.stringify(r.data, null, 2));
        } else {
             console.log("Response:", JSON.stringify(r, null, 2));
        }
    } catch (e) {
        console.error("List Columns Failed:", e.message);
        // Try passing an object if string fails?
    }
}

listCols();
