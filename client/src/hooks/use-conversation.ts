import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import { useAuth } from "@/lib/auth";
import { geminiModel } from "@/lib/gemini";
import { ChatConversation } from "./use-chat-history";
import { nanoid } from 'nanoid';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  conversationId?: string;
}

export function useConversation(conversationId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiRequest();
  const userId = user?.id;
  
  // State for messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get messages for the conversation
  const {
    data: conversationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/conversations", conversationId],
    queryFn: async () => {
      if (!userId || !conversationId) return null;
      
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText} - ${errorBody.message}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Error fetching conversation:", error);
        return null;
      }
    },
    enabled: !!userId && !!conversationId,
    staleTime: 30000, // Cache for 30 seconds
  });
  
  // Add a message to the conversation
  const addMessageMutation = useMutation({
    mutationFn: async (message: Omit<ChatMessage, "id" | "timestamp">) => {
      if (!userId) throw new Error("User not authenticated");
      
      const messageWithTimestamp = {
        ...message,
        id: nanoid(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      try {
        if (conversationId) {
          const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, messageWithTimestamp);
          
          if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Failed to add message: ${response.status} ${response.statusText}`);
          }
          
          return await response.json();
        } else {
          return messageWithTimestamp;
        }
      } catch (error) {
        console.error("Error adding message:", error);
        return messageWithTimestamp;
      }
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      }
    },
  });

  // Initialize messages from conversation data
  useEffect(() => {
    if (!conversationData?.messages || isInitialized) return;
    
    const formattedMessages = conversationData.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    
    setMessages(formattedMessages);
    setIsInitialized(true);
  }, [conversationData, isInitialized]);

  // Get response from Gemini
  const getGeminiResponse = useCallback(async (prompt: string): Promise<string> => {
    try {
      if (!geminiModel) {
        return "I'm sorry, but I'm currently unable to process your request. Please try again later.";
      }
      
      // Build conversation context from recent messages (up to 5)
      const recentMessages = messages.slice(-5);
      const conversationContext = recentMessages
        .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n\n');
      
      // Build system prompt
      const systemPrompt = `
        You are an expert prompt enhancer called PromptPolish AI. Your job is to help users create better prompts for any purpose.
        
        Recent conversation context:
        ${conversationContext}
        
        User's message: "${prompt}"
        
        Respond in a helpful, friendly manner. If the user is asking about how to improve a prompt, provide specific guidance on improving clarity, specificity, structure, and effectiveness. If they share a prompt for enhancement, analyze it and suggest improvements.
      `;
      
      // Call Gemini API
      const result = await geminiModel.generateContent(systemPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error getting Gemini response:", error);
      return "I'm sorry, but I encountered an error while processing your request. Please try again.";
    }
  }, [messages]);
  
  // Add a user message and get AI response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: Omit<ChatMessage, "id" | "timestamp"> = {
      content,
      isUser: true,
      conversationId,
    };
    
    const addedUserMessage = await addMessageMutation.mutateAsync(userMessage);
    setMessages(prev => [...prev, addedUserMessage]);
    
    try {
      // Get AI response using Gemini
      const response = await getGeminiResponse(content);
      
      // Add AI message
      const aiMessage: Omit<ChatMessage, "id" | "timestamp"> = {
        content: response,
        isUser: false,
        conversationId,
      };
      
      const addedAiMessage = await addMessageMutation.mutateAsync(aiMessage);
      setMessages(prev => [...prev, addedAiMessage]);
      
      return addedAiMessage;
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message if AI response fails
      const errorMessage: Omit<ChatMessage, "id" | "timestamp"> = {
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        conversationId,
      };
      
      const addedErrorMessage = await addMessageMutation.mutateAsync(errorMessage);
      setMessages(prev => [...prev, addedErrorMessage]);
      
      return addedErrorMessage;
    }
  }, [conversationId, addMessageMutation, getGeminiResponse]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsInitialized(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}
