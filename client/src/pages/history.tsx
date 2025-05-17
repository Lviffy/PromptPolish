import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import HistoryList from "@/components/HistoryList";
import OutputDisplay from "@/components/OutputDisplay";
import { usePromptHistory } from "@/hooks/use-prompt-history";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function History() {
  const { prompts, isLoading, toggleFavorite } = usePromptHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

  // Filter prompts based on search term
  const filteredPrompts = prompts.filter(prompt => 
    prompt.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.enhancedPrompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selecting a prompt
  const handleSelectPrompt = (prompt: any) => {
    setSelectedPrompt(prompt);
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prompt History</h1>
          <p className="text-gray-600 mt-2">View and manage your enhanced prompts</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 px-3"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompt List */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Your Prompts</h2>
              <p className="text-sm text-gray-500">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found
              </p>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : (
              <HistoryList 
                prompts={filteredPrompts} 
                onSelectPrompt={handleSelectPrompt}
                onToggleFavorite={toggleFavorite}
              />
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
