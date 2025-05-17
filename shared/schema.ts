import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const promptTypes = ["Creative", "Technical", "Instructional", "Casual"] as const;
export const enhancementFocuses = ["Professional", "Creative", "Conversational", "Technical", "LLM-Optimized"] as const;

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  originalPrompt: text("original_prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt").notNull(),
  promptType: text("prompt_type").notNull(),
  enhancementFocus: text("enhancement_focus").notNull(),
  improvements: text("improvements").notNull(), // JSON string of improvements
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export const enhancePromptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  promptType: z.enum(promptTypes),
  enhancementFocus: z.enum(enhancementFocuses),
});

export type EnhancePromptPayload = z.infer<typeof enhancePromptSchema>;
