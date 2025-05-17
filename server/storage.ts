import { users, prompts, type User, type InsertUser, type Prompt, type InsertPrompt } from "@shared/schema";

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
    
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: now,
      isFavorite: insertPrompt.isFavorite || false
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

export const storage = new MemStorage();
