import { users, prompts, type User, type InsertUser, type Prompt, type InsertPrompt } from "@shared/schema";
import { conversations, messages, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/conversation-schema";
import { eq, and, desc } from "drizzle-orm";
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
  getPromptsByUserId(userId: string): Promise<Prompt[]>;
  getFavoritePromptsByUserId(userId: string): Promise<Prompt[]>;
  updatePromptFavorite(promptId: number, isFavorite: boolean): Promise<Prompt>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationById(id: string): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  updateConversationTitle(id: string, title: string): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  getConversationWithMessages(conversationId: string): Promise<any>;
}

// PostgreSQL implementation using Drizzle ORM
class PostgresStorage implements IStorage {
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
  
  async getPromptsByUserId(userId: string): Promise<Prompt[]> {
    // Get user by Firebase UID stored in email field (as a temporary solution)
    // In a production app, you'd have a proper mapping table
    const user = await this.getUserByEmail(userId);
    if (!user) {
      return [];
    }
    return this.db.select()
      .from(prompts)
      .where(eq(prompts.userId, user.id))
      .orderBy(prompts.createdAt);
  }
  
  async getFavoritePromptsByUserId(userId: string): Promise<Prompt[]> {
    // Get user by Firebase UID stored in email field (as a temporary solution)
    const user = await this.getUserByEmail(userId);
    if (!user) {
      return [];
    }
    return this.db.select()
      .from(prompts)
      .where(and(
        eq(prompts.userId, user.id),
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
  
  // Conversation methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(insertConversation).returning();
    return result[0];
  }
  
  async getConversationById(id: string): Promise<Conversation | undefined> {
    const result = await this.db.select().from(conversations).where(eq(conversations.id, id));
    return result[0];
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return this.db.select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }
  
  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const result = await this.db.update(conversations)
      .set({ title })
      .where(eq(conversations.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Conversation with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteConversation(id: string): Promise<void> {
    const result = await this.db.delete(conversations).where(eq(conversations.id, id)).returning();
    
    if (result.length === 0) {
      throw new Error(`Conversation with id ${id} not found`);
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await this.db.insert(messages).values(insertMessage).returning();
    return result[0];
  }
  
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return this.db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
  
  async getConversationWithMessages(conversationId: string): Promise<any> {
    const conversation = await this.getConversationById(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }
    
    const convMessages = await this.getMessagesByConversationId(conversationId);
    
    return {
      ...conversation,
      messages: convMessages
    };
  }
}

// Memory storage as a fallback
class MemStorage implements IStorage {
  private users: Map<number, User>;
  private promptsStore: Map<number, Prompt>;
  private conversationsMap: Map<string, Conversation>;
  private messagesMap: Map<string, Message>;
  private userIdCounter: number;
  private promptIdCounter: number;

  constructor() {
    this.users = new Map();
    this.promptsStore = new Map();
    this.conversationsMap = new Map();
    this.messagesMap = new Map();
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
  
  async getPromptsByUserId(userId: string): Promise<Prompt[]> {
    const user = await this.getUserByEmail(userId);
    if (!user) {
      return [];
    }
    return Array.from(this.promptsStore.values())
      .filter(prompt => prompt.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getFavoritePromptsByUserId(userId: string): Promise<Prompt[]> {
    const user = await this.getUserByEmail(userId);
    if (!user) {
      return [];
    }
    return Array.from(this.promptsStore.values())
      .filter(prompt => prompt.userId === user.id && prompt.isFavorite)
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
  
  // Conversation methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = `conv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    const conversation: Conversation = {
      id,
      userId: insertConversation.userId,
      title: insertConversation.title,
      createdAt: now,
      updatedAt: now
    };
    
    this.conversationsMap.set(id, conversation);
    return conversation;
  }
  
  async getConversationById(id: string): Promise<Conversation | undefined> {
    return this.conversationsMap.get(id);
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversationsMap.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const conversation = this.conversationsMap.get(id);
    
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`);
    }
    
    const updatedConversation = {
      ...conversation,
      title,
      updatedAt: new Date()
    };
    
    this.conversationsMap.set(id, updatedConversation);
    return updatedConversation;
  }
  
  async deleteConversation(id: string): Promise<void> {
    if (!this.conversationsMap.has(id)) {
      throw new Error(`Conversation with id ${id} not found`);
    }
    
    // Delete conversation
    this.conversationsMap.delete(id);
    
    // Delete associated messages
    const messagesToDelete = Array.from(this.messagesMap.entries())
      .filter(([_, msg]) => msg.conversationId === id)
      .map(([msgId, _]) => msgId);
    
    for (const msgId of messagesToDelete) {
      this.messagesMap.delete(msgId);
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    const message: Message = {
      id,
      conversationId: insertMessage.conversationId,
      content: insertMessage.content,
      isUser: insertMessage.isUser,
      createdAt: now
    };
    
    this.messagesMap.set(id, message);
    return message;
  }
  
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async getConversationWithMessages(conversationId: string): Promise<any> {
    const conversation = this.conversationsMap.get(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }
    
    const messages = await this.getMessagesByConversationId(conversationId);
    
    return {
      ...conversation,
      messages
    };
  }
}

// Export storage classes for type checking
export { PostgresStorage, MemStorage };

// Create and export the appropriate storage implementation
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage() 
  : new MemStorage();
