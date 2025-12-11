const axios = require('axios');

async function testTrigger() {
    console.log("Mocking Frontend Request with specific Item ID...");
    const testId = "frontend-selected-id-" + Date.now();
    try {
        const r = await axios.post("http://localhost:5000/api/boltic/trigger-workflow", {
            triggerSource: "TestScript",
            itemId: testId
        });
        console.log("Status:", r.status);
        console.log("Data:", r.data);
    } catch(e) {
        console.error("Error:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}
testTrigger();
