import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import StatsCard from "@/components/StatsCard";
import PromptForm from "@/components/PromptForm";
import OutputDisplay from "@/components/OutputDisplay";
import HistoryList from "@/components/HistoryList";
import { usePromptHistory } from "@/hooks/use-prompt-history";
import { PencilLine, Wand2, Star } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { 
    prompts, 
    favorites, 
    isLoading, 
    toggleFavorite 
  } = usePromptHistory();

  const [enhancementResult, setEnhancementResult] = useState<{
    originalPrompt: string;
    enhancedPrompt: string;
    improvements: Array<{ category: string; detail: string }>;
  } | null>(null);

  // Handle selecting a prompt from history
  const handleSelectPrompt = (prompt: any) => {
    setEnhancementResult({
      originalPrompt: prompt.originalPrompt,
      enhancedPrompt: prompt.enhancedPrompt,
      improvements: typeof prompt.improvements === 'string' 
        ? JSON.parse(prompt.improvements) 
        : prompt.improvements
    });
  };

  const recentPrompts = prompts.slice(0, 3);

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-gray-900">Prompt Enhancer</h1>
          <p className="text-gray-600 mt-2">Transform your rough ideas into polished, effective prompts</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard 
            title="Total Prompts" 
            value={prompts.length} 
            icon={PencilLine}
            bgColor="bg-blue-100"
            iconColor="text-primary"
          />
          <StatsCard 
            title="This Week" 
            value={prompts.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} 
            icon={Wand2}
            bgColor="bg-green-100"
            iconColor="text-secondary"
          />
          <StatsCard 
            title="Favorites" 
            value={favorites.length} 
            icon={Star}
            bgColor="bg-purple-100"
            iconColor="text-accent"
          />
        </div>

        {/* Prompt Creation Area */}
        <PromptForm />

        {/* Output Display */}
        {enhancementResult && (
          <OutputDisplay 
            originalPrompt={enhancementResult.originalPrompt}
            enhancedPrompt={enhancementResult.enhancedPrompt}
            improvements={enhancementResult.improvements}
          />
        )}

        {/* Recent Enhancements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Enhancements</h2>
          {isLoading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <>
              <HistoryList 
                prompts={recentPrompts} 
                onSelectPrompt={handleSelectPrompt}
                onToggleFavorite={toggleFavorite}
              />
              
              <div className="mt-4 text-center">
                <Link href="/history" className="text-primary hover:text-primary/80 text-sm font-medium">
                  View all history →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
