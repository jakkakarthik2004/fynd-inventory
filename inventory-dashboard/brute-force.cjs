const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function bruteForce() {
    console.log("Start Brute Force");
    
    // 1. Inspect Keys first to fix listing
    try {
        const r = await boltic.tableResource.tablesApiClient.listTables();
        const dup = r.data.find(t => t.name === "duplicate");
        if (dup) {
             const cols = await boltic.columnResource.columnsApiClient.listColumns(dup.id);
             if (cols.data && cols.data.length > 0) {
                 console.log("Column Object Keys:", Object.keys(cols.data[0]));
                 // Print first few cols roughly
                 cols.data.forEach((c, i) => {
                     if (i < 3) console.log(`Col ${i}:`, JSON.stringify(c));
                 });
             }
        }
    } catch(e) {}

    // 2. Try Insertion
    const candidates = ["text_1", "column_1", "name_1", "title", "description", "field_1"];
    
    for (const key of candidates) {
        try {
            console.log(`Trying param: ${key}`);
            const payload = {};
            payload[key] = "Brute Force Item";
            const res = await boltic.records.insert("duplicate", payload);
            if (res.error) {
                // Short log
            } else {
                console.log(`SUCCESS with key: ${key}`);
                process.exit(0);
            }
        } catch(e) {}
    }
    console.log("Brute force finished.");
}

bruteForce();
