import { users, prompts, type User, type InsertUser, type Prompt, type InsertPrompt } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPromptsByUserId(userId: number): Promise<Prompt[]>;
  getFavoritePromptsByUserId(userId: number): Promise<Prompt[]>;
  updatePromptFavorite(promptId: number, isFavorite: boolean): Promise<Prompt>;
}

// PostgreSQL implementation using Drizzle ORM
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    // Database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Prompt methods
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const result = await this.db.insert(prompts).values(insertPrompt).returning();
    return result[0];
  }
  
  async getPromptsByUserId(userId: number): Promise<Prompt[]> {
    return this.db.select()
      .from(prompts)
      .where(eq(prompts.userId, userId))
      .orderBy(prompts.createdAt);
  }
  
  async getFavoritePromptsByUserId(userId: number): Promise<Prompt[]> {
    return this.db.select()
      .from(prompts)
      .where(and(
        eq(prompts.userId, userId),
        eq(prompts.isFavorite, true)
      ))
      .orderBy(prompts.createdAt);
  }
  
  async updatePromptFavorite(promptId: number, isFavorite: boolean): Promise<Prompt> {
    const result = await this.db.update(prompts)
      .set({ isFavorite })
      .where(eq(prompts.id, promptId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Prompt with id ${promptId} not found`);
    }
    
    return result[0];
  }
}

// Memory storage as a fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private promptsStore: Map<number, Prompt>;
  private userIdCounter: number;
  private promptIdCounter: number;

  constructor() {
    this.users = new Map();
    this.promptsStore = new Map();
    this.userIdCounter = 1;
    this.promptIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Prompt methods
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptIdCounter++;
    const now = new Date();
    
    // Ensure that we're creating a proper Prompt with all required fields
    const prompt: Prompt = {
      id,
      userId: insertPrompt.userId,
      originalPrompt: insertPrompt.originalPrompt,
      enhancedPrompt: insertPrompt.enhancedPrompt,
      promptType: insertPrompt.promptType,
      enhancementFocus: insertPrompt.enhancementFocus,
      improvements: insertPrompt.improvements,
      isFavorite: insertPrompt.isFavorite === true,
      createdAt: now
    };
    
    this.promptsStore.set(id, prompt);
    return prompt;
  }
  
  async getPromptsByUserId(userId: number): Promise<Prompt[]> {
    return Array.from(this.promptsStore.values())
      .filter(prompt => prompt.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getFavoritePromptsByUserId(userId: number): Promise<Prompt[]> {
    return Array.from(this.promptsStore.values())
      .filter(prompt => prompt.userId === userId && prompt.isFavorite)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async updatePromptFavorite(promptId: number, isFavorite: boolean): Promise<Prompt> {
    const prompt = this.promptsStore.get(promptId);
    
    if (!prompt) {
      throw new Error(`Prompt with id ${promptId} not found`);
    }
    
    const updatedPrompt = {
      ...prompt,
      isFavorite
    };
    
    this.promptsStore.set(promptId, updatedPrompt);
    return updatedPrompt;
  }
}

// Create and export the appropriate storage implementation
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage() 
  : new MemStorage();
