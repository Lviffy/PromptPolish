import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, PostgresStorage } from "./storage";
import { enhancePromptSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import bcrypt from 'bcryptjs'; // Import bcryptjs
import helmet from 'helmet';
import { 
  firebaseAuthenticate, 
  generateToken, 
  loginLimiter, 
  validatePassword,
  initializePassport,
  handleAuthError
} from './auth';

// Add Gemini API client
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

// In-memory chat storage
const chats: Record<string, { id: string; userId: string; messages: { id: string; content: string; isUser: boolean; timestamp: string; }[] }> = {};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize security middleware with custom CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.replit.com", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com", "https://*.replit.com", "wss://*.firebaseio.com"],
        frameSrc: ["'self'", "https://*.replit.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        blockAllMixedContent: [],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(initializePassport());

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  console.log('Gemini API Key loaded:', !!process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    }
  });

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Validate password
      if (!validatePassword(password)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters" 
        });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with hashed password
      console.log("Attempting to create user:", { username, email });
      const user = await storage.createUser({ username, email, password: hashedPassword });
      console.log("User created successfully:", { id: user.id, username: user.username, email: user.email });
      
      // Generate JWT token
      const token = generateToken(user);
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        token 
      });
    } catch (error) {
      console.error("Error creating user:", error);
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

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
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
      
      // Generate JWT token
      const token = generateToken(user);
      
      res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        token 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });

  // Protected routes
  app.use('/api/prompts', firebaseAuthenticate);

  // Prompt enhancement endpoint
  app.post("/api/enhance", firebaseAuthenticate, async (req, res) => {
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
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
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
      const userId = req.user.id;
      const prompts = await storage.getPromptsByUserId(userId);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prompts" });
    }
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const { originalPrompt, enhancedPrompt, promptType, enhancementFocus, improvements, isFavorite } = req.body;
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      const favorites = await storage.getFavoritePromptsByUserId(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorite prompts" });
    }
  });

  // Create a new chat
  app.post('/api/chat', firebaseAuthenticate, (req, res) => {
    try {
      const chatId = nanoid();
      chats[chatId] = { id: chatId, userId: req.user.id, messages: [] };
      res.status(201).json({ chatId });
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ message: 'Error creating chat' });
    }
  });

  // Send a message and get Gemini response
  app.post('/api/chat/:chatId/message', firebaseAuthenticate, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: 'Message content is required' });
      const chat = chats[chatId];
      if (!chat) return res.status(404).json({ message: 'Chat not found' });
      if (chat.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
      // Add user message
      const userMsg = { id: nanoid(), content, isUser: true, timestamp: new Date().toISOString() };
      chat.messages.push(userMsg);
      // Build context for Gemini
      const context = chat.messages.slice(-10).map(m => `${m.isUser ? 'User' : 'AI'}: ${m.content}`).join('\n');
      const systemPrompt = `You are PromptPolish AI. Help users improve prompts.\n\n${context}\n\nUser: ${content}`;
      // Get Gemini response
      let aiText = '';
      try {
        const result = await model.generateContent(systemPrompt);
        aiText = result.response.text();
        // Sanitize: remove leading asterisks and extra whitespace from each line, and collapse multiple blank lines
        aiText = aiText.replace(/^[*]+[ \t]*/gm, '').replace(/\n{2,}/g, '\n\n').trim();
      } catch (err) {
        console.error('Gemini error:', err);
        aiText = "I'm sorry, but I encountered an error while processing your request.";
      }
      const aiMsg = { id: nanoid(), content: aiText, isUser: false, timestamp: new Date().toISOString() };
      chat.messages.push(aiMsg);
      res.status(201).json({ user: userMsg, ai: aiMsg });
    } catch (error) {
      console.error('Error in chat message:', error);
      res.status(500).json({ message: 'Error processing chat message' });
    }
  });

  // Get chat history
  app.get('/api/chat/:chatId', firebaseAuthenticate, (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = chats[chatId];
      if (!chat) return res.status(404).json({ message: 'Chat not found' });
      if (chat.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
      res.json({ messages: chat.messages });
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({ message: 'Error getting chat history' });
    }
  });

  // Error handling middleware
  app.use(handleAuthError);

  const httpServer = createServer(app);
  return httpServer;
}
