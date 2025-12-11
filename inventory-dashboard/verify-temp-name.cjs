const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function verifyTempName() {
    console.log("Verifying 'temp_name'...");
    const item = {
        temp_name: "Verification Item " + Date.now()
    };
    try {
        const r = await boltic.records.insert("duplicate", item);
        if (r.error) {
             console.log("Failed:", JSON.stringify(r.error));
        } else {
             console.log("Success:", JSON.stringify(r.data));
        }
    } catch(e) { console.log(e.message); }
}

verifyTempName();
