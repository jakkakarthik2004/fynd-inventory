import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDjv7-rq_SxzlHHGw-JvqdbcPpTJsXzAGk"; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    // For listing models, we don't need a specific model instance.
    // But the SDK exposes it via the `getGenerativeModel` mostly.
    // Actually, checking docs or attempting a different way...
    // The Error message said "Call ListModels".
    
    // There isn't a direct `genAI.listModels()` in the simplified import usually, 
    // Wait, typical usage:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // The error comes from that.
    
    // Let's try `gemini-1.5-flash-latest` or `gemini-1.5-flash-001` directly in the fix first?
    // Listing models might need a specific request structure or referencing the ModelService.
    
    // Let's try to verify if `gemini-pro` works first?
    // Or just try `gemini-1.5-flash-001` which is the specific version.
    
    console.log("Trying gemini-1.5-flash-001...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
    const result = await model.generateContent("Test");
    console.log("Success with gemini-1.5-flash-001");
  } catch (error) {
    console.error("Error with 001:", error.message);
  }
}

listModels();
