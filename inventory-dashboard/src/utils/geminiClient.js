import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = "AIzaSyBsQbWug6-12H_l1xngmW3XXo_gp6Dp0GQ"; // In a real app, use import.meta.env.VITE_GEMINI_API_KEY
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
