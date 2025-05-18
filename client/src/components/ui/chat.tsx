import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChatContainer } from "@/components/ui/chat-container";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessage } from "@/components/ui/chat-message";
import { Separator } from "@/components/ui/separator";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string;
  avatar?: string;
  userName?: string;
}

export interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  title?: string;
  description?: string;
  emptyState?: React.ReactNode;
}

export function Chat({
  messages,
  onSendMessage,
  isLoading = false,
  className,
  placeholder,
  title,
  description,
  emptyState,
}: ChatProps) {
  return (
    <Card className={cn("flex flex-col shadow-md overflow-hidden", className)}>
      {title && (
        <div className="px-4 py-3 bg-card border-b">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className="flex-1">
        <ChatContainer className="h-[550px]">
          {messages.length === 0 && emptyState ? (
            <div className="flex h-full items-center justify-center p-8">
              {emptyState}
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
                avatar={message.avatar}
                userName={message.userName}
              />
            ))
          )}
        </ChatContainer>
      </div>
      
      <div className="px-4 py-4 border-t bg-card">
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading}
          placeholder={placeholder}
          className="glass-effect"
        />
      </div>
    </Card>
  );
}
