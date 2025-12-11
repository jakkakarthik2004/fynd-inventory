const { createClient } = require("@boltic/sdk");

const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

const sampleItems = [
    {
        product_name: "AI Smart Watch",
        supplier: "TechTime",
        quantity_in_stock: 50,
        reorder_threshold: 10,
        reorder_status: "OK",
        price: 199.99,
        locations: []
    },
    {
        product_name: "Ergonomic Chair",
        supplier: "OfficePro",
        quantity_in_stock: 5,
        reorder_threshold: 8,
        reorder_status: "LOW",
        price: 350.00,
        locations: []
    }
];

async function seed() {
    console.log("Seeding Boltic table 'new-table'...");
    
    // Using insert function based on introspection [ 'insert', 'insertMany' ]
    for (const item of sampleItems) {
        try {
            console.log(`Inserting ${item.product_name}...`);
            const { data, error } = await boltic.records.insert("new-table", item);
            if (error) {
                console.error("Error inserting:", error);
            } else {
                console.log("Success:", data);
            }
        } catch (e) {
            console.error("Exception:", e.message);
        }
    }
}

seed();
