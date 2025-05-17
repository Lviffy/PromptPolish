import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enhancePromptSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

// Add Gemini API client
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Create user
      const user = await storage.createUser({ username, email, password });
      res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would create a session and return a token
      res.status(200).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  });

  // Prompt enhancement endpoint
  app.post("/api/enhance", async (req, res) => {
    try {
      const validatedData = enhancePromptSchema.parse(req.body);
      const { prompt, promptType, enhancementFocus } = validatedData;

      // Construct the Gemini prompt
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
      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      const text = response.text();
      
      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(text);
        return res.json(parsedResponse);
      } catch (parseError) {
        // If JSON parsing fails, extract the enhanced prompt manually
        const enhancedPrompt = text.replace(/```json|```/g, '').trim();
        return res.json({ 
          enhancedPrompt,
          improvements: [
            { category: "PROCESSED", detail: "Prompt was enhanced but structured improvements couldn't be parsed" }
          ]
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ message: "Error enhancing prompt" });
    }
  });

  // Prompt history endpoints
  app.get("/api/prompts", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const prompts = await storage.getPromptsByUserId(userId);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prompts" });
    }
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const { userId, originalPrompt, enhancedPrompt, promptType, enhancementFocus, improvements, isFavorite } = req.body;
      
      const prompt = await storage.createPrompt({
        userId,
        originalPrompt,
        enhancedPrompt,
        promptType,
        enhancementFocus,
        improvements: JSON.stringify(improvements),
        isFavorite: isFavorite || false
      });
      
      res.status(201).json(prompt);
    } catch (error) {
      res.status(500).json({ message: "Error saving prompt" });
    }
  });

  app.patch("/api/prompts/:id/favorite", async (req, res) => {
    try {
      const promptId = Number(req.params.id);
      const { isFavorite } = req.body;
      
      const updatedPrompt = await storage.updatePromptFavorite(promptId, isFavorite);
      res.json(updatedPrompt);
    } catch (error) {
      res.status(500).json({ message: "Error updating prompt" });
    }
  });

  app.get("/api/prompts/favorites", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const favorites = await storage.getFavoritePromptsByUserId(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorite prompts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
