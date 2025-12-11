const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function testPagination() {
    console.log("=== Testing Pagination Options ===");
    
    // Test 1: limit
    console.log("\n1. Testing { limit: 20 }");
    try {
        const r1 = await boltic.records.findAll("new-table", { limit: 20 });
        console.log("Count:", r1.data?.length, "Pagination:", JSON.stringify(r1.pagination));
    } catch(e) { console.log("Failed:", e.message); }

    // Test 2: pageSize
    console.log("\n2. Testing { pageSize: 20 }");
    try {
        const r2 = await boltic.records.findAll("new-table", { pageSize: 20 });
        console.log("Count:", r2.data?.length, "Pagination:", JSON.stringify(r2.pagination));
    } catch(e) { console.log("Failed:", e.message); }

    // Test 3: per_page
    console.log("\n3. Testing { per_page: 20 }");
    try {
        const r3 = await boltic.records.findAll("new-table", { per_page: 20 });
        console.log("Count:", r3.data?.length, "Pagination:", JSON.stringify(r3.pagination));
    } catch(e) { console.log("Failed:", e.message); }
    
    // Test 5: nested page object
    console.log("\n5. Testing { page: { size: 50 } }");
    try {
        const r5 = await boltic.records.findAll("new-table", { page: { size: 50 } });
        console.log("Count:", r5.data?.length, "Pagination:", JSON.stringify(r5.pagination));
    } catch(e) { console.log("Failed:", e.message); }

    // Test 6: nested page_size
    console.log("\n6. Testing { page: { page_size: 50 } }");
    try {
        const r6 = await boltic.records.findAll("new-table", { page: { page_size: 50 } });
        console.log("Count:", r6.data?.length, "Pagination:", JSON.stringify(r6.pagination));
    } catch(e) { console.log("Failed:", e.message); }
    
    // Test 7: top level page_size
    console.log("\n7. Testing { page_size: 50 }");
    try {
        const r7 = await boltic.records.findAll("new-table", { page_size: 50 });
        console.log("Count:", r7.data?.length, "Pagination:", JSON.stringify(r7.pagination));
    } catch(e) { console.log("Failed:", e.message); }
}

testPagination();
