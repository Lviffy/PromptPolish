import React, { useEffect, useState } from "react";
import { Chat } from "@/components/ui/chat";
import { useConversation } from "@/hooks/use-conversation";
import { useParams, useNavigate } from "react-router-dom";
import { useChatHistory } from "@/hooks/use-chat-history";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  const {
    messages,
    isLoading,
    sendMessage,
    conversation,
  } = useConversation(id);

  const { createConversation } = useChatHistory();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated && !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Handle creating a new conversation
  const handleNewChat = async () => {
    setIsCreatingNewChat(true);
    try {
      const newConversation = await createConversation("New Conversation");
      navigate(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  if (!id) {
    // No conversation selected, show empty state
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <h2 className="text-2xl font-bold">Welcome to PromptPolish Chat</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Start a new conversation to get help with your prompts or ask questions about prompt engineering.
        </p>
        <Button 
          onClick={handleNewChat} 
          disabled={isCreatingNewChat}
          className="mt-4"
        >
          {isCreatingNewChat ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Start New Chat
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Chat
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        title={conversation?.title || "Chat"}
        placeholder="Type a message..."
        emptyState={
          <div className="text-center space-y-4">
            <h3 className="font-medium text-lg">No messages yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Start the conversation by sending a message. Ask about prompt engineering or get help improving your prompts.
            </p>
          </div>
        }
      />
    </div>
  );
}
