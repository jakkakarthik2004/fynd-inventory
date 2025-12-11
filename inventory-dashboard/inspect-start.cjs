const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function inspectClient() {
    console.log("Inspecting columnsApiClient...");
    if (boltic.columnResource && boltic.columnResource.columnsApiClient) {
        console.log("Keys:", Object.keys(boltic.columnResource.columnsApiClient));
        // Also check prototype if possible, but keys usually show methods in instances
        console.log("Prototype Keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(boltic.columnResource.columnsApiClient)));
    } else {
        console.log("columnsApiClient not found");
    }
}

inspectClient();
