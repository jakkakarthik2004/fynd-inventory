const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function debugUpdate() {
    console.log("Debugging Update...");
    try {
        // Fetch an item first
        const { data } = await boltic.records.findAll("new-table", { page: { size: 1 } });
        if (!data || data.length === 0) {
            console.log("No items.");
            return;
        }
        const item = data[0];
        const id = item.Id || item.id;
        console.log("Updating Item ID:", id);

        // Attempt 1: Standard update
        console.log("Attempt 1: update(table, id, { Reorder_Status: 'OK' })");
        try {
            if (r1.error) console.log("Attempt 1 Error:", JSON.stringify(r1.error));
            else console.log("Attempt 1 Success:", r1);
        } catch(e) { console.log("Attempt 1 Exception:", e.message); }
        // Attempt 2: updateById
        console.log("Attempt 2: updateById(table, id, { Reorder_Status: 'OK' })");
        try {
            const r2 = await boltic.records.updateById("new-table", id, { Reorder_Status: "OK" });
            if (r2.error) console.log("Attempt 2 Error:", JSON.stringify(r2.error));
            else console.log("Attempt 2 Success:", r2);
        } catch(e) { console.log("Attempt 2 Exception:", e.message); }

        // Attempt 3: Payload structure check
        console.log("Attempt 3: update(table, id, { fields: { Reorder_Status: 'OK' } })");
        try {
            const r3 = await boltic.records.update("new-table", id, { fields: { Reorder_Status: "OK" } });
            if (r3.error) console.log("Attempt 3 Error:", JSON.stringify(r3.error));
        } catch(e) { console.log("Attempt 3 Exception:", e.message); }

    } catch(e) { console.error(e); }
}

debugUpdate();
