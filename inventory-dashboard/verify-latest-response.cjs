const axios = require('axios');

async function verifyLatest() {
    console.log("Fetching /api/boltic/response-latest...");
    try {
        const r = await axios.get("http://13.222.15.163:5000/api/boltic/response-latest");
        console.log("Status:", r.status);
        if (r.data.success) {
            console.log("SUCCESS. Data keys:", Object.keys(r.data.data));
            // simplified log
            console.log("Recommended Qty:", r.data.data.recommended_quantity);
        } else {
            console.log("FAILED:", r.data);
        }
    } catch(e) {
        console.error("Error:", e.message);
    }
}
verifyLatest();
