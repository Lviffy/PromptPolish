import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Prompt } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface HistoryListProps {
  prompts: Prompt[];
  onSelectPrompt?: (prompt: Prompt) => void;
  onToggleFavorite?: (prompt: Prompt) => void;
}

export default function HistoryList({ prompts, onSelectPrompt, onToggleFavorite }: HistoryListProps) {
  if (!prompts || prompts.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No prompts in history yet. Start enhancing prompts to see them here.
      </Card>
    );
  }

  // Get badge colors based on prompt type and enhancement focus
  const getPromptTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Creative": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      "Technical": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
      "Instructional": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
      "Casual": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
    };
    return colors[type] || "bg-secondary text-secondary-foreground";
  };

  const getEnhancementFocusBadgeColor = (focus: string) => {
    const colors: Record<string, string> = {
      "Professional": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
      "Creative": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
      "Conversational": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      "Technical": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
      "LLM-Optimized": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
    };
    return colors[focus] || "bg-secondary text-secondary-foreground";
  };

  // Helper to format the date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Generate a title from the prompt
  const generateTitle = (prompt: string) => {
    const words = prompt.split(' ').slice(0, 5).join(' ');
    return words.length < prompt.length ? `${words}...` : words;
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden dark:shadow-lg dark:shadow-primary/10">
      {prompts.map((prompt) => (
        <div 
          key={prompt.id}
          className="border-b border-border p-4 hover:bg-muted transition-colors cursor-pointer dark:hover:bg-surface/80"
          onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
        >
          <div className="flex justify-between">
            <h3 className="font-medium text-foreground flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
              {generateTitle(prompt.originalPrompt)}
            </h3>
            <div className="flex items-center">
              {onToggleFavorite && (
                <button 
                  className="text-muted-foreground hover:text-yellow-500 dark:hover:text-yellow-400 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(prompt);
                  }}
                >
                  <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300' : ''}`} />
                </button>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDate(prompt.createdAt)}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{prompt.enhancedPrompt}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className={getPromptTypeBadgeColor(prompt.promptType)}>
              {prompt.promptType}
            </Badge>
            <Badge variant="outline" className={getEnhancementFocusBadgeColor(prompt.enhancementFocus)}>
              {prompt.enhancementFocus}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
