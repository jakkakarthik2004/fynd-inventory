const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function listTabs() {
    console.log("Listing tables...");
    try {
        if (boltic.tableResource && boltic.tableResource.tablesApiClient) {
             const r = await boltic.tableResource.tablesApiClient.listTables();
             if (r.data) {
                 const dup = r.data.find(t => t.name === "duplicate" || t.display_name === "duplicate");
                 console.log("Found 'duplicate' table:", JSON.stringify(dup, null, 2));
                 if (dup) {
                     const cols = await boltic.columnResource.columnsApiClient.listColumns(dup.id);
                     if (cols.data) {
                         console.log("Found Columns:");
                         cols.data.forEach(c => {
                             console.log(`- Display: "${c.display_name}", AllowName: "${c.allow_name}", Slug: "${c.slug}", ID: "${c.id}"`);
                         });
                     }
                 }
             } else {
                 console.log("No data in listTables response");
             }
        } else {
             console.log("tablesApiClient not accessible");
        }
    } catch (e) {
        console.error("List Tables Failed:", e.message);
    }
}

listTabs();
