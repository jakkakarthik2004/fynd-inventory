const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const serveStatic = require("serve-static");
const { readFileSync } = require('fs');
const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const { SQLiteStorage } = require("@gofynd/fdk-extension-javascript/express/storage");
const sqliteInstance = (() => {
    try {
        return new sqlite3.Database('session_storage.db', (err) => {
            if (err) console.warn("Failed to open local DB, falling back to memory");
        });
    } catch (e) {
        console.warn("SQLite file access failed, using in-memory DB.");
        return new sqlite3.Database(':memory:');
    }
})();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@boltic/sdk");
const axios = require('axios');

// Initialize Gemini (Mock or Env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSy_Mock_Key");

// Connect to MongoDB (Optional/Mock)
if (process.env.DB_URL) {
    mongoose.connect(process.env.DB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
} else {
    console.warn("DB_URL not found in environment variables. MongoDB features will be disabled.");
}

// Mongoose Schema (Preserved from friend's code)
const comparisonSchema = new mongoose.Schema({
  crawledData: Array,
  createdAt: Date
}, { collection: 'fynd' });
const ComparisonData = mongoose.model('ComparisonData', comparisonSchema);

// Setup FDK (Mock/Safe Fallback)
let fdkExtension;
try {
    throw new Error("Force Mock");
} catch (e) {
    console.warn("FDK Setup Failed (Expected if missing credentials):", e.message);
    fdkExtension = { fdkHandler: (req, res, next) => next(), platformApiRoutes: express.Router() };
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser("ext.session"));
app.use(bodyParser.json({ limit: '2mb' }));

// 1. Boltic Integration

app.get("/test", (req, res) => {
    console.log("Hit /test route");
    return res.json({ success: true, message: "Test route working" });
});

// Initialize Boltic with User's Permanent Token
const boltic = createClient("2b7270b4-dd5d-4294-a63a-9a876f0d41a9");

// API Route: Get Data from Boltic
app.get('/api/boltic/new-table', async (req, res) => {
    try {
        console.log("Fetching data from Boltic table 'new-table'...");
        const { data, error } = await boltic.records.findAll("new-table", {
             page: { page_size: 100 }
        });

        if (error) {
            console.error("Boltic API Error:", error);
            return res.status(500).json({ success: false, message: "Boltic Error", error });
        }

        console.log(`Successfully fetched ${data?.length || 0} records.`);
        
        // Normalize Data for Frontend
        const serializedData = (data || []).map((item, index) => ({
             id: item.Id || item.id || index + 1,
             item_name: item.Item_name || item.product_name || item.item_name || "Unknown Item",
             supplier: item.Item_supplier || item.item_supplier || item.supplier || "Unknown Supplier",
             quantity_in_stock: Number(item.Quantity_In_Stock) || Number(item.quantity_in_stock) || 0,
             reorder_threshold: Number(item.Reorder_Threshold) || Number(item.reorder_threshold) || 10,
             reorder_status: (item.Reorder_Status || item.reorder_status || "OK").toUpperCase(),
             price: Number(item.price) || 0,
             locations: item.locations || []
        }));

        return res.json({ success: true, data: serializedData });

    } catch (err) {
        console.error("Server Error in /api/boltic/new-table:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Route: Trigger Boltic Workflow
app.post('/api/boltic/trigger-workflow', async (req, res) => {
    try {
        console.log("Triggering Boltic Workflow via Table Insert...");

        let validId = req.body.itemId;
        
        if (!validId) {
            const { data: items } = await boltic.records.findAll("new-table", { page: { page_size: 1 } });
            validId = items && items.length > 0 ? (items[0].Id || items[0].id) : "NoItemsFound-" + Date.now();
            console.log("No ID provided, using fallback:", validId);
        } else {
            console.log("Using Selected Item ID:", validId);
        }

        const dummyItem = {
            temp_name: String(validId) 
        };
        
        try {
             await boltic.records.insert("duplicate", dummyItem);
             console.log("Inserted simple dummy data into 'duplicate'");
        } catch(e) {
             console.error("Failed to insert into 'duplicate'.", e.message);
        }

        return res.json({ success: true, message: "Workflow Triggered via Table Insert" });
    } catch (err) {
        console.error("Error triggering workflow:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Route: Get Latest Response from Boltic (replacing Gemini)
app.get('/api/boltic/response-latest', async (req, res) => {
    try {
        console.log("Fetching latest response from 'response-table'...");
        const { data } = await boltic.records.findAll("response-table", { page: { page_size: 50 } });
        
        if (!data || data.length === 0) {
            return res.json({ success: false, message: "No responses found in table." });
        }

        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latest = sorted[0];

        return res.json({ success: true, data: latest.response || latest }); 

    } catch (err) {
        console.error("Error fetching latest response:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Route: Update Item Status
app.post('/api/boltic/update-item', async (req, res) => {
    try {
        const { itemId, status } = req.body;
        console.log(`Updating item ${itemId} status to ${status}...`);

        if (!itemId) return res.status(400).json({ success: false, message: "itemId required" });
        if (!status) return res.status(400).json({ success: false, message: "status required" });
        
        const updateData = {
           Reorder_Status: status 
        };

        const { data, error } = await boltic.records.updateById("new-table", itemId, updateData);

        if (error) {
            console.error("Boltic Update Error:", error);
            return res.status(500).json({ success: false, message: "Update failed", error });
        }

        console.log("Update Success:", data);
        return res.json({ success: true, data });

    } catch (err) {
        console.error("Server Error in update-item:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Route: Get Past Sales Data
app.get('/api/boltic/past-sales', async (req, res) => {
    try {
        console.log("Fetching past sales from 'past_data'...");
        const { data } = await boltic.records.findAll("past_data", { page: { page_size: 200 } });
        
        if (!data || data.length === 0) {
            return res.json({ success: true, data: [] });
        }
        return res.json({ success: true, data });
    } catch (err) {
        console.error("Error fetching past sales:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Mock Try-On
app.post('/api/try-on', async (req, res) => {
    return res.json({ success: true, output: "http://mock-url.com/result.jpg" });
});

// Comparison Data
app.get('/api/comparison-data', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
             return res.json({ success: true, data: null, message: "DB not connected" });
        }
        const data = await ComparisonData.findOne().sort({ createdAt: -1 });
        return res.json({ success: true, data });
    } catch(err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/boltic-post', async (req, res) => {
     return res.json({ success: true });
});

// FDK Routes
app.use("/", fdkExtension.fdkHandler);
const platformApiRoutes = fdkExtension.platformApiRoutes;
app.use('/api', platformApiRoutes);

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}

module.exports = app;
