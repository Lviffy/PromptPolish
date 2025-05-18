import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enhancePromptSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import bcrypt from 'bcryptjs'; // Import bcryptjs

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
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

      // Create user with hashed password
      console.log("Attempting to create user:", { username, email }); // Log attempt
      const user = await storage.createUser({ username, email, password: hashedPassword });
      console.log("User created successfully:", { id: user.id, username: user.username, email: user.email }); // Log success
      res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error creating user:", error); // Log the actual error
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      res.status(500).json({ message: "Error creating user", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would create a session and return a token
      // For now, just return user info (excluding password)
      res.status(200).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error logging in:", error); // Log the actual error
      res.status(500).json({ message: "Error logging in" });
    }
  });

  // Prompt enhancement endpoint
  app.post("/api/enhance", async (req, res) => {
    try {
      const validatedData = enhancePromptSchema.parse(req.body);
      const { prompt, promptType, enhancementFocus } = validatedData;

      console.log("Received enhancement request:", { prompt, promptType, enhancementFocus });

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

      console.log("Sending prompt to Gemini:", systemPrompt);

      // Call Gemini API
      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      const text = response.text();
      
      console.log("Received response from Gemini:", text);

      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(text);
        console.log("Parsed Gemini response:", parsedResponse);
        return res.json(parsedResponse);
      } catch (parseError: any) {
        console.error("Error parsing Gemini JSON response:", parseError);
        // If JSON parsing fails, extract the enhanced prompt manually
        const enhancedPrompt = text.replace(/```json|```/g, '').trim();
        console.log("Manually extracted enhanced prompt:", enhancedPrompt);
        return res.json({ 
          enhancedPrompt,
          improvements: [
            { category: "PROCESSED", detail: "Prompt was enhanced but structured improvements couldn't be parsed" }
          ]
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error enhancing prompt:", error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
          // Include other relevant properties if available, e.g., error.status
        });
      } else if (typeof error === 'object' && error !== null) {
         console.error("Error object:", error);
      }
      res.status(500).json({ message: "Error enhancing prompt" });
    }
  });

  // Prompt history endpoints
  app.get("/api/prompts", async (req, res) => {
    try {
      const userId = req.query.userId as string;
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
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const favorites = await storage.getFavoritePromptsByUserId(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorite prompts" });
    }
  });

  // Add this before the httpServer creation
  app.get("/api/test-db", async (req, res) => {
    try {
      const testUser = await storage.getUserByEmail(req.query.email as string);
      res.json({ 
        success: true, 
        user: testUser,
        storageType: storage instanceof PostgresStorage ? "PostgreSQL" : "Memory"
      });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        storageType: storage instanceof PostgresStorage ? "PostgreSQL" : "Memory"
      });
    }
  });

  // Temporary endpoint to test Gemini API
  app.get("/api/test-gemini", async (req, res) => {
    try {
      const prompt = "Write a very short test response.";
      console.log("Testing Gemini API with prompt:", prompt);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log("Gemini API test successful. Response:", text);
      res.json({ success: true, message: "Gemini API test successful", response: text });
    } catch (error: any) {
      console.error("Gemini API test failed:", error);
      res.status(500).json({ 
        success: false, 
        message: "Gemini API test failed", 
        error: error.message || "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
