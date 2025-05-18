import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import StatsCard from "@/components/StatsCard";
import PromptForm from "@/components/PromptForm";
import OutputDisplay from "@/components/OutputDisplay";
import HistoryList from "@/components/HistoryList";
import { usePromptHistory } from "@/hooks/use-prompt-history";
import { PencilLine, Wand2, Star } from "lucide-react";
import { Link } from "wouter";

interface Prompt {
  id: number;
  userId: number;
  originalPrompt: string;
  enhancedPrompt: string;
  promptType: string;
  enhancementFocus: string;
  improvements: string;
  isFavorite: boolean;
  createdAt: Date;
}

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

  const handleSelectPrompt = (prompt: Prompt) => {
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
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header with gradient text */}
        <div className="mb-8 hidden md:block animate-slide-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Prompt Enhancer
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Transform your rough ideas into polished, effective prompts
          </p>
        </div>

        {/* Quick Stats with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard 
            title="Total Prompts" 
            value={prompts.length} 
            icon={PencilLine}
            bgColor="bg-blue-100/50 dark:bg-blue-900/20"
            iconColor="text-primary"
            className="card-hover glass-effect"
          />
          <StatsCard 
            title="This Week" 
            value={prompts.filter((p: Prompt) => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} 
            icon={Wand2}
            bgColor="bg-green-100/50 dark:bg-green-900/20"
            iconColor="text-secondary dark:text-secondary-foreground"
            className="card-hover glass-effect"
          />
          <StatsCard 
            title="Favorites" 
            value={favorites.length} 
            icon={Star}
            bgColor="bg-purple-100/50 dark:bg-purple-900/20"
            iconColor="text-accent dark:text-accent-foreground"
            className="card-hover glass-effect"
          />
        </div>

        {/* Prompt Creation Area */}
        <div className="animate-fade-in">
          <PromptForm />
        </div>

        {/* Output Display with animation */}
        {enhancementResult && (
          <div className="animate-slide-in">
            <OutputDisplay 
              originalPrompt={enhancementResult.originalPrompt}
              enhancedPrompt={enhancementResult.enhancedPrompt}
              improvements={enhancementResult.improvements}
            />
          </div>
        )}

        {/* Recent Enhancements with glass effect */}
        <div className="glass-effect rounded-lg p-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-foreground/90">Recent Enhancements</h2>
          {isLoading ? (
            <div className="text-center p-4 text-muted-foreground">Loading...</div>
          ) : (
            <>
              <HistoryList 
                prompts={recentPrompts} 
                onSelectPrompt={handleSelectPrompt}
                onToggleFavorite={(prompt: Prompt) => toggleFavorite(prompt.id)}
              />
              
              <div className="mt-4 text-center">
                <Link 
                  href="/history" 
                  className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  View all history
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
