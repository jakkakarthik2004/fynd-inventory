const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function testAddColumn() {
    console.log("Attempting to add 'Item_name' column to 'duplicate'...");
    
    // Check keys
    if (boltic.columnResource) {
        console.log("Keys:", Object.keys(boltic.columnResource));
    } else {
        console.log("No columnResource found");
    }
}

testAddColumn();
