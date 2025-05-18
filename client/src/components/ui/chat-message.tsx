import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  avatar?: string;
  userName?: string;
  className?: string;
}

export function ChatMessage({
  message,
  isUser,
  timestamp,
  avatar,
  userName,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-6 px-4 md:px-6",
        isUser ? "bg-muted/30" : "bg-background",
        className
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <Avatar>
          {avatar ? (
            <AvatarImage src={avatar} alt={isUser ? "User" : "Bot"} />
          ) : (
            <AvatarFallback className={isUser ? "bg-primary" : "bg-accent"}>
              {isUser ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-accent-foreground" />
              )}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {userName || (isUser ? "You" : "Assistant")}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>
        <div className="mt-1 text-sm leading-relaxed prose-p:my-2 prose-pre:my-2 prose-pre:bg-muted prose-pre:p-2 prose-pre:rounded">
          {message.split("\n").map((text, i) => (
            <React.Fragment key={i}>
              {text}
              {i < message.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
