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
      <Card className="p-6 text-center text-gray-500">
        No prompts in history yet. Start enhancing prompts to see them here.
      </Card>
    );
  }

  // Get badge colors based on prompt type and enhancement focus
  const getPromptTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Creative": "bg-blue-100 text-blue-700",
      "Technical": "bg-orange-100 text-orange-700",
      "Instructional": "bg-indigo-100 text-indigo-700",
      "Casual": "bg-green-100 text-green-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getEnhancementFocusBadgeColor = (focus: string) => {
    const colors: Record<string, string> = {
      "Professional": "bg-gray-100 text-gray-700",
      "Creative": "bg-pink-100 text-pink-700",
      "Conversational": "bg-green-100 text-green-700",
      "Technical": "bg-orange-100 text-orange-700",
      "LLM-Optimized": "bg-purple-100 text-purple-700"
    };
    return colors[focus] || "bg-gray-100 text-gray-700";
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {prompts.map((prompt) => (
        <div 
          key={prompt.id}
          className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
        >
          <div className="flex justify-between">
            <h3 className="font-medium">
              {generateTitle(prompt.originalPrompt)}
            </h3>
            <div className="flex items-center">
              {onToggleFavorite && (
                <button 
                  className="text-gray-400 hover:text-yellow-500 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(prompt);
                  }}
                >
                  <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(prompt.createdAt)}
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{prompt.enhancedPrompt}</p>
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
