import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnhancePromptPayload, promptTypes, enhancementFocuses } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PencilLine, Code, ListOrdered, MessageSquare, Briefcase, LightbulbIcon, MessageCircle, Laptop, Bot } from "lucide-react";
import { usePromptHistory } from "@/hooks/use-prompt-history";

type EnhancementResponse = {
  enhancedPrompt: string;
  improvements: Array<{
    category: string;
    detail: string;
  }>;
};

export default function PromptForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPromptToHistory } = usePromptHistory();
  
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState<typeof promptTypes[number]>("Creative");
  const [enhancementFocus, setEnhancementFocus] = useState<typeof enhancementFocuses[number]>("LLM-Optimized");
  
  const enhanceMutation = useMutation({
    mutationFn: async (data: EnhancePromptPayload) => {
      const response = await apiRequest("POST", "/api/enhance", data);
      return response.json() as Promise<EnhancementResponse>;
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your prompt has been enhanced.",
        variant: "success",
      });
      
      // Save to history if user is logged in
      if (user) {
        addPromptToHistory({
          userId: user.id,
          originalPrompt: prompt,
          enhancedPrompt: data.enhancedPrompt,
          promptType,
          enhancementFocus,
          improvements: JSON.stringify(data.improvements),
          isFavorite: false
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to enhance.",
        variant: "destructive",
      });
      return;
    }
    
    enhanceMutation.mutate({ prompt, promptType, enhancementFocus });
  };

  // Map prompt types to icons
  const promptTypeIcons = {
    "Creative": <PencilLine className="w-4 h-4 mr-1" />,
    "Technical": <Code className="w-4 h-4 mr-1" />,
    "Instructional": <ListOrdered className="w-4 h-4 mr-1" />,
    "Casual": <MessageSquare className="w-4 h-4 mr-1" />
  };

  // Map enhancement focuses to icons
  const enhancementFocusIcons = {
    "Professional": <Briefcase className="w-4 h-4 mr-1" />,
    "Creative": <LightbulbIcon className="w-4 h-4 mr-1" />,
    "Conversational": <MessageCircle className="w-4 h-4 mr-1" />,
    "Technical": <Laptop className="w-4 h-4 mr-1" />,
    "LLM-Optimized": <Bot className="w-4 h-4 mr-1" />
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Prompt</h2>
        <form onSubmit={handleSubmit}>
          {/* Prompt Input */}
          <div className="mb-4">
            <label htmlFor="original-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Your Prompt
            </label>
            <Textarea 
              id="original-prompt" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="min-h-[120px] focus:min-h-[180px] transition-all duration-300"
            />
          </div>
          
          {/* Prompt Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Type</label>
            <div className="flex flex-wrap gap-2">
              {promptTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={promptType === type ? "default" : "outline"}
                  onClick={() => setPromptType(type)}
                  className={promptType === type ? "bg-primary text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
                >
                  {promptTypeIcons[type]} {type}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Style/Tone Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enhancement Focus</label>
            <div className="flex flex-wrap gap-2">
              {enhancementFocuses.map((focus) => (
                <Button
                  key={focus}
                  type="button"
                  variant={enhancementFocus === focus ? "default" : "outline"}
                  onClick={() => setEnhancementFocus(focus)}
                  className={enhancementFocus === focus 
                    ? (focus === "LLM-Optimized" ? "bg-accent text-white" : "bg-primary text-white") 
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
                >
                  {enhancementFocusIcons[focus]} {focus}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Enhance Button */}
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="px-6 py-2.5 bg-primary text-white"
              disabled={enhanceMutation.isPending}
            >
              {enhanceMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> Enhancing...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span> Enhance Prompt
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
