import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ArrowRight, Trash } from "lucide-react";
import { Chat } from "@/components/ui/chat";
import { useChatSession } from "@/hooks/useChatSession";

export default function ChatPage() {
  const [inputValue, setInputValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    chatId,
    messages,
    loading,
    error,
    startChat,
    sendMessage,
    fetchHistory,
  } = useChatSession();

  // Start a new chat on mount
  useEffect(() => {
    startChat();
    // eslint-disable-next-line
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || loading) return;
    setInputValue("");
    await sendMessage(textToSend);
  };

  // Sample prompt examples for quick starts
  const promptExamples = [
    "How can I make my creative writing prompts more specific?",
    "Help me write better technical documentation prompts",
    "Can you show me an example of a well-structured prompt?",
    "I need help with prompts for professional emails"
  ];

  const handleExampleClick = (example: string) => {
    handleSendMessage(example);
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl py-6">
        <div className="flex flex-col space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Chat with PromptPolish</h1>
            <p className="text-muted-foreground">Interactive chat to enhance and perfect your prompts</p>
          </div>

          <Card className="bg-card shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Quick Start</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsDialogOpen(true)}
                  title="Clear chat"
                >
                  <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              <div className="space-y-2">
                {promptExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left text-xs h-auto py-2 px-3"
                    onClick={() => handleExampleClick(example)}
                  >
                    <span className="truncate">{example}</span>
                    <ArrowRight className="ml-auto h-3 w-3 shrink-0 opacity-70" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 md:col-span-3">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={loading}
              title="PromptPolish Chat"
              description="AI-powered prompt enhancement"
              placeholder="Type your prompt or question here..."
              className="shadow-lg border-muted"
              emptyState={
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                    Share your prompts and get AI-powered suggestions to make them more effective
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => handleSendMessage("Help me create better prompts")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Chat
                  </Button>
                </div>
              }
            />
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
