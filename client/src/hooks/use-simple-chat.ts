import { useState } from "react";
import { sendChatMessage } from "@/lib/unauthed-api";

export interface SimpleChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function useSimpleChat() {
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create and add user message
    const userMessage: SimpleChatMessage = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert messages to the format expected by API
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
      
      console.log("Getting AI response...");
      // Get AI response from the server API
      const response = await sendChatMessage(content, conversationHistory);
      console.log("AI response received");
      
      // Create and add AI message
      const aiMessage: SimpleChatMessage = {
        id: `ai-${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      return aiMessage;
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsLoading(false);
      
      // Set error and add error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: SimpleChatMessage = {
        id: `error-${Date.now()}`,
        content: `Sorry, I encountered an error processing your request. Please try again. Error: ${errorMessage}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
      
      return errorChatMessage;
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
} 