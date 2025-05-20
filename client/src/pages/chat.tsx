import React from "react";
import { Chat } from "@/components/ui/chat";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ChatLayout } from "@/components/layout/chat-layout";
import { useSimpleChat } from "@/hooks/use-simple-chat";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Use the simple chat hook that doesn't require authentication
  const {
    messages,
    isLoading,
    sendMessage,
    error,
  } = useSimpleChat();

  return (
    <ChatLayout>
      <Chat
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        title="Chat with Gemini AI"
        placeholder="Type a message..."
        emptyState={
          <div className="text-center space-y-4">
            <h3 className="font-medium text-lg">No messages yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Start the conversation by sending a message. Ask about prompt engineering or get help improving your prompts.
            </p>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>
        }
      />
    </ChatLayout>
  );
}
