const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function listDetails() {
    console.log("Listing column details...");
    try {
        const r = await boltic.tableResource.tablesApiClient.listTables();
        const dup = r.data.find(t => t.name === "duplicate");
        if (dup) {
             const cols = await boltic.columnResource.columnsApiClient.listColumns(dup.id);
             if (cols.data) {
                 cols.data.forEach(c => {
                     // Filter out system columns if possible to reduce noise, or just print all concise
                     console.log(`Column: name="${c.name}", id="${c.id}", type="${c.sql_field_type || c.type}"`);
                 });
             }
        }
    } catch(e) {
        console.log(e.message);
    }
}

listDetails();
