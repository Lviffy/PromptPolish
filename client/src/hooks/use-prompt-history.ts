import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Prompt, InsertPrompt } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function usePromptHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
      if (!response.ok) throw new Error("Failed to fetch prompts");
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
      if (!response.ok) throw new Error("Failed to fetch favorites");
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

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ promptId, isFavorite }: { promptId: number; isFavorite: boolean }) => {
      const response = await apiRequest("PATCH", `/api/prompts/${promptId}/favorite`, {
        isFavorite,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/prompts/favorites", userId] });
    },
  });

  // Add a prompt to history
  const addPromptToHistory = (promptData: InsertPrompt) => {
    addPromptMutation.mutate(promptData);
  };

  // Toggle favorite status of a prompt
  const toggleFavorite = (prompt: Prompt) => {
    toggleFavoriteMutation.mutate({
      promptId: prompt.id,
      isFavorite: !prompt.isFavorite,
    });
  };

  return {
    prompts,
    favorites,
    isLoading,
    isFavoritesLoading,
    error,
    addPromptToHistory,
    toggleFavorite,
  };
}
