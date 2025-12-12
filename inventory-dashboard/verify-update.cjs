const axios = require('axios');

async function verifyUpdate() {
    console.log("Verifying /api/boltic/update-item...");
    // We need a valid item ID. We'll fetch one first.
    try {
        const list = await axios.get("http://13.222.15.163:5000/api/boltic/new-table");
        if (list.data.success && list.data.data && list.data.data.length > 0) {
            const item = list.data.data[0];
            const itemId = item.Id || item.id;
            console.log("Testing with Item ID:", itemId);

            const r = await axios.post("http://13.222.15.163:5000/api/boltic/update-item", {
                itemId: itemId,
                status: "OK"
            });

            console.log("Update Response Status:", r.status);
            console.log("Response Data:", r.data);
            
            if (r.data.success) {
                console.log("SUCCESS: Item status updated.");
            } else {
                console.log("FAILED to update.");
            }

        } else {
            console.log("No items found to test update.");
        }
    } catch(e) {
        console.error("Error:", e.message);
        if (e.response) console.error(e.response.data);
    }
}
verifyUpdate();
