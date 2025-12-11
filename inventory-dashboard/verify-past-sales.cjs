const axios = require('axios');
async function verifyPastSales() {
    console.log("Fetching /api/boltic/past-sales...");
    try {
        const r = await axios.get("http://localhost:5000/api/boltic/past-sales");
        console.log("Status:", r.status);
        if (r.data.success) {
            console.log("Success. Record count from past_data:", r.data.data.length);
        } else {
            console.log("Failed:", r.data);
        }
    } catch(e) { console.error("Error:", e.message); }
}
verifyPastSales();
