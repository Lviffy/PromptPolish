import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import { useAuth } from "@/lib/auth";
import { getChatResponse } from "@/lib/gemini";
import { ChatConversation } from "./use-chat-history";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  conversationId?: string;
}

export function useConversation(conversationId?: string) {
  const { user, isAuthenticated } = useAuth();
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
      if (!isAuthenticated || !userId || !conversationId) return null;
      
      try {
        const response = await apiRequest("GET", `/api/conversations/${conversationId}`);
        
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText} - ${errorBody.message}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Error fetching conversation:", error);
        // Return null as fallback when API is not available
        return null;
      }
    },
    enabled: isAuthenticated && !!userId && !!conversationId,
  });
  
  // Add a message to the conversation
  const addMessageMutation = useMutation({
    mutationFn: async (message: Omit<ChatMessage, "id" | "timestamp">) => {
      if (!isAuthenticated || !userId) throw new Error("User not authenticated");
      
      const messageWithTimestamp = {
        ...message,
        id: Date.now().toString(),
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
          // If no conversationId, return the message directly (for local handling)
          return messageWithTimestamp;
        }
      } catch (error) {
        console.error("Error adding message:", error);
        // Return message for local handling when API is not available
        return messageWithTimestamp;
      }
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      }
    },
  });
  
  // Initialize messages from local storage if available
  useEffect(() => {
    if (!isAuthenticated || !userId || !conversationId || isInitialized) return;
    
    const localStorageKey = `chat_messages_${userId}_${conversationId}`;
    const storedMessages = localStorage.getItem(localStorageKey);
    
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else if (!isLoading && !conversationData) {
      // If no stored messages and no conversation data, initialize with welcome message
      setMessages([{
        id: "1",
        content: "I am your AI assistant designed to help you craft better prompts for any purpose. How can I help you today?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversationId,
      }]);
    }
    
    setIsInitialized(true);
  }, [userId, conversationId, isInitialized, isLoading, conversationData, isAuthenticated]);
  
  // Save messages to local storage
  useEffect(() => {
    if (!isAuthenticated || !userId || !conversationId || messages.length === 0) return;
    
    const localStorageKey = `chat_messages_${userId}_${conversationId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(messages));
  }, [messages, userId, conversationId, isAuthenticated]);
  
  // Set messages from API data if available
  useEffect(() => {
    if (!conversationData?.messages || conversationData.messages.length === 0) return;
    
    setMessages(conversationData.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })));
  }, [conversationData]);
  
  // Add a user message and get AI response
  const sendMessage = async (content: string) => {
    if (!isAuthenticated || !userId) {
      throw new Error("Please log in to send messages");
    }
    
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
      // Convert messages to the format expected by getChatResponse
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Get AI response using Gemini
      const response = await getChatResponse(content, conversationHistory);
      
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
  };
  
  // Clear all messages and start a new conversation
  const clearMessages = () => {
    setMessages([{
      id: "1",
      content: "I am your AI assistant designed to help you craft better prompts for any purpose. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversationId,
    }]);
    
    if (userId && conversationId) {
      const localStorageKey = `chat_messages_${userId}_${conversationId}`;
      localStorage.removeItem(localStorageKey);
    }
  };
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isAuthenticated,
  };
}
