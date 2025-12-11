const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function testInsert() {
    console.log("Attempting to insert full record into 'duplicate'...");
    
    // Using the same schema as 'new-table'
    const dummyItem = {
        Item_name: "Workflow Generated Item",
        Item_supplier: "AutoBot",
        Quantity_In_Stock: 999,
        Reorder_Threshold: 50,
        Reorder_Status: "OK"
    };

    try {
        const r = await boltic.records.insert("duplicate", dummyItem);
        if (r.error) {
            console.error("Insert Failed:", JSON.stringify(r.error, null, 2));
        } else {
            console.log("Insert Success:", JSON.stringify(r.data, null, 2));
        }
    } catch (e) {
        console.error("Exception:", e.message);
    }
}

testInsert();
