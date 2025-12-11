const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function debugInsert() {
    console.log("=== Debugging Duplicate Insertion ===");
    const dummyItem = {
        Name: "Debug Item " + Date.now()
    };
    
    console.log("Attempting to insert:", dummyItem);

    try {
        const r = await boltic.records.insert("duplicate", dummyItem);
        
        if (r.error) {
            console.error("INSERT FAILED. Error Response:");
            console.error(JSON.stringify(r.error, null, 2));
        } else {
            console.log("INSERT SUCCESS. Response:");
            console.log(JSON.stringify(r.data, null, 2));
        }
    } catch (e) {
        console.error("EXCEPTION THROWN:", e);
    }
}

debugInsert();
