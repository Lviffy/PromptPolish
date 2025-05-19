// Google Generative AI client for Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

// In Vite, use import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini Pro model
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  }
});

// Function to enhance a prompt
export async function enhancePrompt(
  prompt: string, 
  promptType: string, 
  enhancementFocus: string
) {
  try {
    // Construct the system prompt for Gemini
    const systemPrompt = `
      You are an expert prompt enhancer. Your task is to improve the following prompt to make it more effective.
      
      Original prompt: "${prompt}"
      
      Selected prompt type: ${promptType}
      Enhancement focus: ${enhancementFocus}
      
      Please enhance this prompt to:
      1. Improve clarity and structure
      2. Add specific details and context
      3. Match the desired tone and style
      4. Make it more effective for its purpose
      
      Return a JSON object with the following structure:
      {
        "enhancedPrompt": "the improved version of the prompt",
        "improvements": [
          { "category": "STRUCTURE", "detail": "what was improved about structure" },
          { "category": "CLARITY", "detail": "what was improved about clarity" },
          { "category": "SPECIFICITY", "detail": "what was improved about specificity" }
        ]
      }
    `;

    // Call Gemini API
    const result = await geminiModel.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();
    
    // Try to parse the JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, extract the enhanced prompt manually
      return { 
        enhancedPrompt: text.replace(/```json|```/g, '').trim(),
        improvements: [
          { category: "PROCESSED", detail: "Prompt was enhanced but structured improvements couldn't be parsed" }
        ]
      };
    }
  } catch (error) {
    console.error("Error enhancing prompt with Gemini:", error);
    throw new Error("Failed to enhance prompt");
  }
}
