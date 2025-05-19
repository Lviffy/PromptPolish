import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useApiRequest } from "./useApiRequest";

export interface ChatConversation {
  id: string;
  title: string;
  date: Date;
  lastMessage?: string;
  messages?: Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
  }>;
}

export function useChatHistory() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiRequest();
  const userId = user?.id;

  // Get all chat conversations for the current user
  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/conversations", userId],
    queryFn: async () => {
      if (!isAuthenticated || !userId) return [];
      try {
        const response = await apiRequest("GET", "/api/conversations");
        
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText} - ${errorBody.message}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // Return empty array as fallback when API is not available
        return [];
      }
    },
    enabled: isAuthenticated && !!userId,
  });

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!isAuthenticated || !userId) throw new Error("User not authenticated");
      
      try {
        const response = await apiRequest("POST", "/api/conversations", {
          title,
          createdAt: new Date().toISOString(),
        });
        
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Failed to create conversation: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error creating conversation:", error);
        // Create local fallback when API is not available
        return {
          id: Date.now().toString(),
          title,
          date: new Date(),
          userId
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", userId] });
    },
  });

  // Delete a conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthenticated || !userId) throw new Error("User not authenticated");
      
      try {
        const response = await apiRequest("DELETE", `/api/conversations/${id}`);
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Failed to delete conversation: ${response.status} ${response.statusText}`);
        }
        return id;
      } catch (error) {
        console.error("Error deleting conversation:", error);
        // Return the id anyway to allow optimistic updates
        return id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", userId] });
    },
  });

  // Local operations for when API isn't available yet
  const [localConversations, setLocalConversations] = useState<ChatConversation[]>([]);
  
  // Initialize with some conversations from local storage if available
  useEffect(() => {
    if (!userId) return;
    
    const storedConversations = localStorage.getItem(`chat_conversations_${userId}`);
    if (storedConversations) {
      setLocalConversations(JSON.parse(storedConversations));
    }
  }, [userId]);

  // Save local conversations to localStorage
  useEffect(() => {
    if (!userId || localConversations.length === 0) return;
    localStorage.setItem(`chat_conversations_${userId}`, JSON.stringify(localConversations));
  }, [localConversations, userId]);

  // Create a local conversation if API fails
  const createLocalConversation = (title: string) => {
    const newConversation: ChatConversation = {
      id: Date.now().toString(),
      title,
      date: new Date()
    };
    
    setLocalConversations(prev => [newConversation, ...prev]);
    return newConversation;
  };

  // Delete a local conversation
  const deleteLocalConversation = (id: string) => {
    setLocalConversations(prev => prev.filter(conv => conv.id !== id));
    return id;
  };

  // Use API data if available, otherwise use local data
  const allConversations = conversations.length > 0 
    ? conversations.map((conv: any) => ({
        ...conv,
        date: new Date(conv.date || conv.createdAt)
      })) 
    : localConversations;

  return {
    conversations: allConversations,
    isLoading,
    error,
    createConversation: async (title: string) => {
      try {
        return await createConversationMutation.mutateAsync(title);
      } catch (error) {
        return createLocalConversation(title);
      }
    },
    deleteConversation: async (id: string) => {
      try {
        return await deleteConversationMutation.mutateAsync(id);
      } catch (error) {
        return deleteLocalConversation(id);
      }
    }
  };
}
