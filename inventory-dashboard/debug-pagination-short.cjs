const { createClient } = require("@boltic/sdk");
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

async function test() {
    console.log("Start");
    // Test A
    let r = await boltic.records.findAll("new-table", { per_page: 50 });
    console.log("per_page:50 ->", r.data?.length);

    // Test B
    r = await boltic.records.findAll("new-table", { page_size: 50 });
    console.log("page_size:50 ->", r.data?.length);

    // Test C
    r = await boltic.records.findAll("new-table", { limit: 50 });
    console.log("limit:50 ->", r.data?.length);
    
    // Test D
    r = await boltic.records.findAll("new-table", { page: { size: 50 } });
    console.log("page.size:50 ->", r.data?.length);
    
    // Test E
    r = await boltic.records.findAll("new-table", { page: { page_size: 50 } });
    console.log("page.page_size:50 ->", r.data?.length);
}
test();
