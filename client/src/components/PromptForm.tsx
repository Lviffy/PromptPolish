import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { EnhancePromptPayload, promptTypes, enhancementFocuses } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PencilLine, Code, ListOrdered, MessageSquare, Briefcase, LightbulbIcon, MessageCircle, Laptop, Bot } from "lucide-react";
import { usePromptHistory } from "@/hooks/use-prompt-history";
import { useApiRequest } from "@/hooks/useApiRequest";
import { enhancePrompt } from "@/lib/gemini";

type EnhancementResponse = {
  enhancedPrompt: string;
  improvements: Array<{
    category: string;
    detail: string;
  }>;
};

export default function PromptForm() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addPrompt: addPromptToHistory } = usePromptHistory();
  const { apiRequest } = useApiRequest();
  
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState<typeof promptTypes[number]>("Creative");
  const [enhancementFocus, setEnhancementFocus] = useState<typeof enhancementFocuses[number]>("LLM-Optimized");
  
  const enhanceMutation = useMutation({
    mutationFn: async (data: EnhancePromptPayload) => {
      // Use the enhanced Gemini integration
      return enhancePrompt(data.prompt, data.promptType, data.enhancementFocus, apiRequest);
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your prompt has been enhanced.",
        variant: "success",
      });
      
      // Save to history if user is logged in
      if (isAuthenticated && user) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          Enter your prompt
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt here..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select prompt type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {promptTypes.map((type) => (
            <Button
              key={type}
              type="button"
              variant={promptType === type ? "default" : "outline"}
              onClick={() => setPromptType(type)}
              className="justify-start"
            >
              {promptTypeIcons[type]}
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Enhancement focus</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {enhancementFocuses.map((focus) => (
            <Button
              key={focus}
              type="button"
              variant={enhancementFocus === focus ? "default" : "outline"}
              onClick={() => setEnhancementFocus(focus)}
              className="justify-start"
            >
              {focus === "LLM-Optimized" && <Bot className="w-4 h-4 mr-1" />}
              {focus === "Business" && <Briefcase className="w-4 h-4 mr-1" />}
              {focus === "Creative" && <LightbulbIcon className="w-4 h-4 mr-1" />}
              {focus === "Technical" && <Laptop className="w-4 h-4 mr-1" />}
              {focus === "Conversational" && <MessageCircle className="w-4 h-4 mr-1" />}
              {focus}
            </Button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={enhanceMutation.isPending}
      >
        {enhanceMutation.isPending ? "Enhancing..." : "Enhance Prompt"}
      </Button>
    </form>
  );
}
