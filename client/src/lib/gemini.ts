// Google Generative AI client for Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

// In Vite, use import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini Pro model
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.0-pro",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
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

// Function to get chat response
export async function getChatResponse(
  message: string,
  conversationHistory: { role: 'user' | 'assistant', content: string }[]
) {
  try {
    // Construct the chat context
    const chatContext = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    // Construct the system prompt
    const systemPrompt = `
      You are PromptPolish AI, an expert prompt enhancer and AI assistant. Your job is to help users create better prompts for any purpose.
      
      Recent conversation context:
      ${chatContext}
      
      User's message: "${message}"
      
      Respond in a helpful, friendly manner. If the user is asking about how to improve a prompt, provide specific guidance on improving clarity, specificity, structure, and effectiveness. If they share a prompt for enhancement, analyze it and suggest improvements.
      
      Keep your responses concise but informative. Focus on practical advice and specific examples when relevant.
    `;

    // Call Gemini API
    const result = await geminiModel.generateContent(systemPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    throw new Error("Failed to get chat response");
  }
}
