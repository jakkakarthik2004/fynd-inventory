const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function inspect() {
    console.log("Inspecting 'duplicate' table...");
    try {
        // Try getting one record to see fields
        const r = await boltic.records.findAll("duplicate", { page: { page_size: 1 } });
        if (r.data && r.data.length > 0) {
            console.log("Sample Record:", JSON.stringify(r.data[0], null, 2));
        } else {
            console.log("No records found. Cannot infer schema from data.");
            // Try to insert a generic record to see if it complains about missing fields? 
            // Or just trust the screenshot if this fails.
            // Actually, we can try to list columns if there is a resource for it.
            // The earlier logs showed `columnResource` in the client keys.
            // Let's try `boltic.column.list("duplicate")` or similar if it exists?
            // `columnResource` was in the keys.
            // Let's guess the method. usually `list` or `findAll`.
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

inspect();
