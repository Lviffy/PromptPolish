import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Prompt, InsertPrompt } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useApiRequest } from "./useApiRequest";

export function usePromptHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiRequest();
  const userId = user?.id;

  // Get all prompts for the current user
  const {
    data: prompts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/prompts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/prompts?userId=${userId}`, {
        credentials: "include",
      });
      if (!response.ok) {
         const errorBody = await response.json();
         throw new Error(`Failed to fetch prompts: ${response.status} ${response.statusText} - ${errorBody.message}`);
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Get favorite prompts
  const {
    data: favorites = [],
    isLoading: isFavoritesLoading,
  } = useQuery({
    queryKey: ["/api/prompts/favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/prompts/favorites?userId=${userId}`, {
        credentials: "include",
      });
       if (!response.ok) {
         const errorBody = await response.json();
         throw new Error(`Failed to fetch favorites: ${response.status} ${response.statusText} - ${errorBody.message}`);
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Add a prompt to history
  const addPromptMutation = useMutation({
    mutationFn: async (promptData: InsertPrompt) => {
      const response = await apiRequest("POST", "/api/prompts", promptData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", userId] });
    },
  });

  // Remove a prompt from history
  const removePromptMutation = useMutation({
    mutationFn: async (promptId: number) => {
      const response = await apiRequest("DELETE", `/api/prompts/${promptId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", userId] });
    },
  });

  // Toggle favorite status of a prompt
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (promptId: number) => {
      const response = await apiRequest("PUT", `/api/prompts/${promptId}/favorite`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/prompts/favorites", userId] });
    },
  });

  return {
    prompts,
    favorites,
    isLoading,
    isFavoritesLoading,
    error,
    addPrompt: addPromptMutation.mutate,
    removePrompt: removePromptMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
  };
}
