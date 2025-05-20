// Google Generative AI client for Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

// In Vite, use import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini model
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// Gemini API client
import { useApiRequest } from "../hooks/useApiRequest";

// Function to enhance a prompt
export async function enhancePrompt(
  prompt: string, 
  promptType: string, 
  enhancementFocus: string,
  apiRequest: any
) {
  try {
    // Call the server API instead of Gemini API directly
    const response = await apiRequest("POST", "/api/enhance", {
      prompt,
      promptType,
      enhancementFocus
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt");
  }
}

// Function to get chat response
export async function getChatResponse(
  message: string,
  conversationHistory: { role: 'user' | 'assistant', content: string }[],
  apiRequest: any
) {
  try {
    console.log("Sending chat request to server API");
    console.log("Message:", message);
    console.log("History length:", conversationHistory.length);

    // Call the server API instead of Gemini API directly
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chat API error:", response.status, response.statusText, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error("Failed to get chat response: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}
