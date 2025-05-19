import { pgTable, text, timestamp, boolean, json } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(), // Changed to text for UUID
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(), // Changed to text for UUID
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ... rest of the schema ... 