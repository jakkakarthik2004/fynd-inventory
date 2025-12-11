const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function checkTable() {
    console.log("Inspecting boltic.tableResource...");
    console.log("Keys:", Object.keys(boltic.tableResource));
    // Try to get table info
    try {
        // Guessing method name based on 'get' or 'list' pattern
        if (boltic.tableResource.get) {
             const { data, error } = await boltic.tableResource.get("new-table");
             console.log("Table Info:", JSON.stringify(data, null, 2));
             if (error) console.error("Table Info Error:", error);
        } else {
             console.log("No .get method on tableResource");
        }
    } catch (e) {
        console.error("Error getting table info:", e.message);
    }
}

checkTable();
