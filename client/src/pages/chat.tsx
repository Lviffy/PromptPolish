import React, { useEffect } from "react";
import { Chat } from "@/components/ui/chat";
import { useConversation } from "@/hooks/use-conversation";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ChatLayout } from "@/components/layout/chat-layout";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    messages,
    isLoading,
    sendMessage,
    conversation,
  } = useConversation(id);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated && !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <ChatLayout>
      {id ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-8 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Select a conversation or start a new chat</h2>
          <p className="text-muted-foreground text-lg">
            Click on a conversation from the sidebar or create a new chat to get started.
          </p>
        </div>
      )}
    </ChatLayout>
  );
}
