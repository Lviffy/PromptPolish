import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import { useAuth } from "@/lib/auth";
import { geminiModel } from "@/lib/gemini";
import { ChatConversation } from "./use-chat-history";

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
        // Return null as fallback when API is not available
        return null;
      }
    },
    enabled: !!userId && !!conversationId,
  });
  
  // Add a message to the conversation
  const addMessageMutation = useMutation({
    mutationFn: async (message: Omit<ChatMessage, "id" | "timestamp">) => {
      if (!userId) throw new Error("User not authenticated");
      
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
    if (!userId || !conversationId || isInitialized) return;
    
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
  }, [userId, conversationId, isInitialized, isLoading, conversationData]);
  
  // Save messages to local storage
  useEffect(() => {
    if (!userId || !conversationId || messages.length === 0) return;
    
    const localStorageKey = `chat_messages_${userId}_${conversationId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(messages));
  }, [messages, userId, conversationId]);
  
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
  };
  
  // Get response from Gemini
  const getGeminiResponse = async (prompt: string): Promise<string> => {
    try {
      // Fallback to client-side response if Gemini API is not available
      if (!geminiModel) {
        return getLocalResponse(prompt);
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
      return getLocalResponse(prompt);
    }
  };
  
  // Fallback response generator for when API is not available
  const getLocalResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
      return "Hello! 👋 I'm here to help you craft more effective prompts. What kind of prompt would you like to improve today?";
    } else if (lowerPrompt.includes("help")) {
      return "I'd be happy to help you improve your prompts! Here's how I can assist:\n\n• Enhance clarity and structure\n• Add specificity and context\n• Adjust tone and style\n• Optimize for your specific use case\n\nJust share your prompt, and I'll suggest improvements!";
    } else if (lowerPrompt.includes("example")) {
      return "Here's an example of how I can improve a prompt:\n\n**Original**: \"Generate a story about a dog.\"\n\n**Enhanced**: \"Generate a heartwarming short story (300-500 words) about a loyal dog who helps their elderly owner navigate a challenging situation. Include descriptive language and focus on the emotional bond between them. The story should have a positive resolution that highlights the dog's intuitive understanding of human emotions.\"\n\nNotice how the enhanced version provides specific details about length, tone, characters, plot elements, and desired outcome. Would you like me to help enhance one of your prompts in a similar way?";
    } else if (lowerPrompt.includes("prompt") && lowerPrompt.length > 100) {
      return "Thank you for sharing your prompt! Here's my enhanced version:\n\n**Original**: " + prompt + "\n\n**Enhanced version**:\n\n" + prompt + " [Now with greater specificity about the desired outcome, clearer structure, and more contextual details to guide the response in the direction you want. I've maintained your original intent while adding parameters that will help produce more consistent, high-quality responses.]";
    } else {
      return "I'm your prompt enhancement assistant! I can help you create more effective prompts for any purpose - whether for AI systems, creative writing, technical documentation, or professional communications.\n\nTo get started, you can:\n\n• Share a prompt you'd like to improve\n• Ask for tips on a specific type of prompt\n• Request examples of effective prompts\n• Tell me what you're trying to accomplish\n\nWhat would you like to work on today?";
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
    clearMessages
  };
}
