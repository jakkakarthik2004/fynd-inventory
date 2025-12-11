import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = "AIzaSyAle2eP7JXWeGmSHWknv-o1BlZ4Wyn-9i4"; // Updated as per user request
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateOrderPlan(itemDetails, marketSignal = 'neutral') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an AI assistant helping with inventory planning.

Given this item data:
${JSON.stringify(itemDetails, null, 2)}

Current Market Context/External Signal: "${marketSignal.toUpperCase()}" (e.g., Holiday, Weather).
ADJUST your recommendations based on this signal (e.g., increase stock for Holidays).

Your task:
1. Determine how much quantity should be reordered.
2. Recommend a date by which the reorder should be placed.
3. Optionally estimate stock-out date.
4. Generative a 30-day simulated stock depletion forecast (as an array of objects).
5. Provide reasoning.

Respond ONLY in this JSON structure:

{
  "recommended_quantity": <number>,
  "reorder_by_date": "<YYYY-MM-DD>",
  "stockout_prediction": "<YYYY-MM-DD>",
  "executive_summary": "<MAX 15 words. High-level action.>",
  "actionable_insights": [
      "<Short bullet point 1 (max 10 words)>",
      "<Short bullet point 2 (max 10 words)>",
      "<Short bullet point 3 (max 10 words)>"
  ],
  "forecast_data": [
      { "day": 1, "stock": 50 },
      { "day": 5, "stock": 45 },
      ... (simulate 30 days)
  ],
  "location_distribution": [
      { "name": "New York", "quantity": 10, "reason": "High footfall" },
      { "name": "London", "quantity": 5, "reason": "Buffer" },
      { "name": "Tokyo", "quantity": 5, "reason": "Low velocity" }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response to ensure it's valid JSON
    // Sometimes LLMs add markdown code blocks locally
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating order plan:", error);
    throw error;
  }
}

export async function generateSalesForecast(pastData) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        // Prepare summary of past data to avoid token limits if large
        const summaryData = pastData.map(d => ({
            date: d.date,
            item: d.item_name,
            qty: d.quantity_sold,
            season: d.season
        })).slice(0, 100); // Take last 100 records or sample

        const prompt = `
      Act as a Demand Planner.
      Analyze this past sales history:
      ${JSON.stringify(summaryData)}

      Predict the upcoming sales season and items to order.
      
      Respond ONLY in this JSON structure:
      {
        "season_name": "<e.g. Summer Sale, Holiday Prep>",
        "overall_growth_prediction": "<e.g. +15%>",
        "recommended_items": [
           {
               "item_name": "<name>",
               "current_stock_context": "Low/High (Infer if possible or leave generic)",
               "suggested_order_qty": <number>,
               "reason": "<short reason>"
           }
        ]
      }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(text);

    } catch (e) {
        console.error("Forecast error", e);
        // Mock fallback
        return {
            season_name: "Upcoming Peak",
            overall_growth_prediction: "+10% (Fallback)",
            recommended_items: [
                { item_name: "Mock Item A", suggested_order_qty: 50, reason: "Fallback Data" }
            ]
        };
    }
    }

export async function generateBundleStrategy(deadStockItem, fastMovingItems) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `
        Act as a Merchandizing Expert.
        Dead Stock Item (Hard to sell): ${JSON.stringify(deadStockItem)}
        Potential Fast Movers to pair with: ${JSON.stringify(fastMovingItems.map(i => i.item_name))}

        Create a "Smart Bundle" to clear the dead stock by pairing it with a fast mover.
        
        Respond ONLY in this JSON structure:
        {
            "bundle_name": "<Catchy Name>",
            "paired_item": "<Name of one fast mover selected>",
            "bundle_price": <number (discounted total)>,
            "marketing_angle": "<Why this combo makes sense>",
            "discount_percentage": "<e.g. 20%>"
        }
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Bundle error", e);
        return {
            bundle_name: `Clearance: ${deadStockItem.item_name}`,
            paired_item: fastMovingItems[0]?.item_name || "Mystery Item",
            bundle_price: deadStockItem.price * 0.8,
            marketing_angle: "Clearance Sale",
            discount_percentage: "20%"
        };
    }
}

export async function calculateSafetyStock(item, volatility = "Medium") {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `
        Act as a Supply Chain Analyst.
        Item: ${item.item_name}
        Current Safety Stock: ${item.reorder_threshold}
        Supplier Lead Time: 5-10 days (Simulated)
        Demand Volatility: ${volatility}

        Calculate the OPTIMAL Safety Stock level.
        
        Respond ONLY in this JSON structure:
        {
            "recommended_safety_stock": <number>,
            "reason": "<Specific reason based on volatility>",
            "risk_assessment": "Low/Medium/High risk of stockout"
        }
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(text);
    } catch (e) {
        return { description: "AI Unavailable", recommended_safety_stock: item.reorder_threshold, risk_assessment: "Unknown" };
    }
}

export async function chatWithInventoryAI(query, inventoryContext) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        // Summarize inventory to save tokens if needed, but for now we pass full context
        // We strip unnecessary fields to keep it clean
        const minimalContext = inventoryContext.map(i => ({
            name: i.item_name,
            qty: i.quantity_in_stock,
            price: i.price,
            status: i.reorder_status,
            supplier: i.supplier
        }));

        const prompt = `
        System: You are an Inventory Assistant for "Boltic". 
        Context: Here is the current live inventory data: ${JSON.stringify(minimalContext)}

        Rules:
        1. Answer ONLY questions related to this inventory, stock levels, suppliers, or finding items.
        2. If asked about unrelated topics (weather, capital of countries, general knowledge), politely refuse and say you can only help with inventory.
        3. Be concise and professional.
        4. If asked "what is low on stock?", check items with 'REORDER' status or low quantity.

        User: ${query}
        `;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        console.error("Chatbot error", e);
        return "I'm having trouble connecting to the inventory brain right now. Please try again.";
    }
}

export async function generateAdvancedForecast(item, signals, serviceLevel) {
  const prompt = `
    Act as a Supply Chain Data Scientist. Analyze this inventory item and external signals.
    Item: ${item.item_name}
    Current Stock: ${item.quantity_in_stock}
    Avg Daily Sales: 12 (derived)
    Supplier Lead Time: 5 days
    
    External Signals (Impact Factors):
    ${JSON.stringify(signals)}

    Service Level Target: ${serviceLevel * 100}%

    Tasks:
    1. Forecast Demand for next 14 days considering signals (e.g. Holiday +30%).
    2. Detect Anomalies (Is the mock sales data showing spikes?).
    3. Recommend Action.

    Return JSON ONLY:
    {
      "forecast": [
        {"day": "Mon", "demand": 10, "reason": "Base"},
        {"day": "Tue", "demand": 15, "reason": "Holiday Spike"}
        ... (14 days)
      ],
      "analysis": {
        "seasonality_score": "High/Med/Low",
        "trend_direction": "Up/Down",
        "primary_driver": "Weather/Promotion/Organic"
      },
      "anomaly": {
        "detected": boolean,
        "type": "Spike/Drop/None",
        "severity": "High/Low"
      }
    }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim()); // Reuse existing cleanJSON helper if available or standard parse
  } catch (error) {
    console.error("Gemini Forecast Error:", error);
    // Fallback Mock
    return {
        forecast: Array.from({length: 14}, (_, i) => ({ day: `Day ${i+1}`, demand: 10 + Math.floor(Math.random() * 5), reason: "Predicted" })),
        analysis: { seasonality_score: "Medium", trend_direction: "Up", primary_driver: "Organic" },
        anomaly: { detected: false, type: "None", severity: "Low" }
    };
  }
}


export async function generatePricingStrategy(itemDetails) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using Flash for speed/availability
    const prompt = `
Act as an expert eCommerce Pricing Analyst.
Item: ${itemDetails.item_name}
Current Price: $${itemDetails.price}
Supplier: ${itemDetails.supplier}

Analyze simulated competitor market data and demand elasticity.
Recommend an optimal selling price to maximize profit margin without killing conversion.

Respond ONLY in this JSON structure:
{
  "optimal_price": <number>,
  "confidence_score": <number 0-100>,
  "competitor_avg": <number>,
  "margin_impact": "<string, e.g. +12%>",
  "strategy_summary": "<MAX 1 sentence>",
  "market_drivers": [
      "<Short Driver 1>",
      "<Short Driver 2>"
  ]
}
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Price logic error", error);
    // Fallback if AI fails
    return {
       optimal_price: itemDetails.price * 1.1,
       confidence_score: 85,
       competitor_avg: itemDetails.price * 1.05,
       margin_impact: "+10%",
       reasoning: "AI Service unavailable, fallback growth strategy applied."
    };
  }
}

export async function generateMarketingCampaign(itemDetails) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
Act as a Senior Copywriter.
Create a "Flash Sale" marketing campaign for: ${itemDetails.item_name}.
Context: We have ${itemDetails.quantity_in_stock} units. Status: ${itemDetails.reorder_status}.
Target Audience: General consumers.

Respond ONLY in this JSON structure:
{
  "email_subject": "<catchy subject line>",
  "email_body": "<short punchy body>",
  "instagram_caption": "<engaging caption with emojis>",
  "discount_code": "<generated code like FLASH20>"
}
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Marketing logic error", error);
    throw error;
  }
}
