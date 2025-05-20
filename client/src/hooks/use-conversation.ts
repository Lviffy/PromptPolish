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
  
  // Add message to conversation
  const addMessageMutation = useMutation({
    mutationFn: async (messageData: Omit<ChatMessage, "id" | "timestamp">) => {
      if (!isAuthenticated || !userId) {
        throw new Error("User not authenticated");
      }
      
      const conversationIdToUse = messageData.conversationId || conversationId;
      if (!conversationIdToUse) {
        throw new Error("Conversation ID is required");
      }
      
      try {
        const response = await apiRequest("POST", `/api/conversations/${conversationIdToUse}/messages`, {
          content: messageData.content,
          isUser: messageData.isUser
        });
          
          if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Failed to add message: ${response.status} ${response.statusText}`);
          }
          
          return await response.json();
      } catch (error) {
        console.error("Error adding message:", error);
        
        // Create local message when API is not available
        return {
          id: Date.now().toString(),
          content: messageData.content,
          isUser: messageData.isUser,
          timestamp: new Date().toISOString(),
        };
      }
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      }
    },
  });
  
  // Initialize messages when conversation data changes
  useEffect(() => {
    if (conversationData?.messages && !isInitialized) {
      setMessages(conversationData.messages);
    setIsInitialized(true);
    }
  }, [conversationData, isInitialized]);
  
  // Extract conversation data
  const conversation = conversationData ? {
    id: conversationData.id,
    title: conversationData.title,
    date: new Date(conversationData.date || conversationData.createdAt)
  } : null;
  
  // Add a user message and get AI response
  const sendMessage = async (content: string) => {
    // Remove authentication check to allow chat without login
    /*
    if (!isAuthenticated || !userId) {
      throw new Error("Please log in to send messages");
    }
    */
    
    if (!content.trim()) return;
    
    // Create a local conversation ID if none exists
    const localConversationId = conversationId || `local-${Date.now()}`;
    
    // Add user message
    const userMessage: Omit<ChatMessage, "id" | "timestamp"> = {
      content,
      isUser: true,
      conversationId: localConversationId,
    };
    
    try {
      // Use local message handling instead of API if not authenticated
      let addedUserMessage: ChatMessage;
      if (!isAuthenticated || !userId) {
        addedUserMessage = {
          id: `local-${Date.now()}`,
          content,
          isUser: true,
          timestamp: new Date().toISOString(),
          conversationId: localConversationId
        };
      } else {
        addedUserMessage = await addMessageMutation.mutateAsync(userMessage);
      }
      
      setMessages(prev => [...prev, addedUserMessage]);
      
      // Convert messages to the format expected by getChatResponse
      const currentMessages = [...messages, addedUserMessage];
      const conversationHistory = currentMessages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));
      
      console.log("Getting AI response...");
      // Get AI response using Gemini through our server API
      const response = await getChatResponse(content, conversationHistory, apiRequest);
      console.log("AI response received:", response.substring(0, 50) + "...");
      
      // Add AI message
      const aiMessage: Omit<ChatMessage, "id" | "timestamp"> = {
        content: response,
        isUser: false,
        conversationId: localConversationId,
      };
      
      // Use local message handling instead of API if not authenticated
      let addedAiMessage: ChatMessage;
      if (!isAuthenticated || !userId) {
        addedAiMessage = {
          id: `local-${Date.now() + 1}`,
          content: response,
          isUser: false,
          timestamp: new Date().toISOString(),
          conversationId: localConversationId
        };
      } else {
        addedAiMessage = await addMessageMutation.mutateAsync(aiMessage);
      }
      
      setMessages(prev => [...prev, addedAiMessage]);
      
      return addedAiMessage;
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message if AI response fails
      const errorMessage: Omit<ChatMessage, "id" | "timestamp"> = {
        content: "Sorry, I encountered an error while processing your request. Please try again. Error: " + 
                (error instanceof Error ? error.message : "Unknown error"),
        isUser: false,
        conversationId: localConversationId,
      };
      
      const addedErrorMessage = await addMessageMutation.mutateAsync(errorMessage);
      setMessages(prev => [...prev, addedErrorMessage]);
      
      return addedErrorMessage;
    }
  };
  
  return {
    messages,
    conversation,
    isLoading,
    error,
    sendMessage,
  };
}
