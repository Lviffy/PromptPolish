import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import HistoryList from "@/components/HistoryList";
import OutputDisplay from "@/components/OutputDisplay";
import { usePromptHistory } from "@/hooks/use-prompt-history";
import { Star } from "lucide-react";

export default function Favorites() {
  const { favorites, isFavoritesLoading, toggleFavorite } = usePromptHistory();
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

  // Handle selecting a prompt
  const handleSelectPrompt = (prompt: any) => {
    setSelectedPrompt(prompt);
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center">
            <Star className="text-yellow-400 h-6 w-6 mr-2" fill="currentColor" />
            <h1 className="text-3xl font-bold text-gray-900">Favorite Prompts</h1>
          </div>
          <p className="text-gray-600 mt-2">Your collection of saved prompts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorites List */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Saved Prompts</h2>
              <p className="text-sm text-gray-500">
                {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
              </p>
            </div>
            
            {isFavoritesLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : favorites.length > 0 ? (
              <HistoryList 
                prompts={favorites} 
                onSelectPrompt={handleSelectPrompt}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Favorites Yet</h3>
                <p className="text-gray-500">
                  You haven't saved any prompts to your favorites yet.<br />
                  Add favorites by clicking the star icon on any prompt.
                </p>
              </div>
            )}
          </div>

          {/* Selected Prompt Details */}
          <div>
            {selectedPrompt ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Prompt Details</h2>
                <OutputDisplay 
                  originalPrompt={selectedPrompt.originalPrompt}
                  enhancedPrompt={selectedPrompt.enhancedPrompt}
                  improvements={
                    typeof selectedPrompt.improvements === 'string'
                      ? JSON.parse(selectedPrompt.improvements)
                      : selectedPrompt.improvements
                  }
                />
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Prompt Selected</h3>
                <p className="text-gray-500">Select a prompt from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
