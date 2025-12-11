const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function debugBoltic() {
    console.log("=== Debugging Boltic Connection ===");
    
    try {
        // 1. Try findAll with minimal options
        console.log("\n1. Testing records.findAll('new-table')...");
        const r1 = await boltic.records.findAll("new-table");
        if (r1.error) console.error("Error:", r1.error);
        else console.log("Success. Full Data Object:", JSON.stringify(r1, null, 2));

        // 2. Try simple list if it exists (some versions have list vs findAll)
        // From previous debug, verify keys: ['insert', 'insertMany', 'findAll', 'findOne', 'update', 'updateById', 'delete', 'deleteById']
        // So .list does NOT exist.

        // 3. Try to insert one item matching the EXACT schema from screenshot to see if it works
        // Columns: Item_name, Item_supplier, Quantity_In_Stock, Reorder_Threshold, Reorder_Status
        console.log("\n2. Testing records.insert('new-table') with exact schema...");
        const testItem = {
            Item_name: "Test Item from Script",
            Item_supplier: "Debug Script",
            Quantity_In_Stock: 100,
            Reorder_Threshold: 10,
            Reorder_Status: "OK"
        };
        const r2 = await boltic.records.insert("new-table", testItem);
        if (r2.error) console.error("Insert Error:", JSON.stringify(r2.error, null, 2));
        else console.log("Insert Success:", r2.data);

        // 4. Try findAll again after insert
        console.log("\n3. Testing records.findAll('new-table') after insert...");
        const r3 = await boltic.records.findAll("new-table");
        if (r3.error) console.error("Error:", r3.error);
        else console.log("Final Count:", r3.data?.items?.length, "Sample:", JSON.stringify(r3.data?.items?.[0]));

    } catch (e) {
        console.error("EXCEPTION:", e);
    }
}

debugBoltic();
