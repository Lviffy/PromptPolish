import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import { useChatHistory } from "@/hooks/use-chat-history";
import { Loader2 } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { createConversation } = useChatHistory();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const newConversation = await createConversation("New Conversation");
      navigate(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl text-center space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to PromptPolish Chat</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start a new conversation to get help with your prompts or ask questions about prompt engineering.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-lg border bg-card hover:shadow-md transition-all card-hover">
              <Sparkles className="h-12 w-12 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Optimize Your Prompts</h2>
              <p className="text-muted-foreground text-center">
                Get suggestions to make your prompts more effective and get better responses from AI models.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg border bg-card hover:shadow-md transition-all card-hover">
              <MessageSquarePlus className="h-12 w-12 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Chat with AI Experts</h2>
              <p className="text-muted-foreground text-center">
                Learn best practices and techniques for prompt engineering from our AI assistant.
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={handleNewChat}
            disabled={isCreatingChat}
            className="mt-8 text-lg px-8 py-6 h-auto"
          >
            {isCreatingChat ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Chat...
              </>
            ) : (
              <>
                <MessageSquarePlus className="mr-2 h-5 w-5" />
                Start New Chat
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 