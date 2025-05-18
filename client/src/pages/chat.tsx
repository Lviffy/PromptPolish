import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Send,
  Sparkles, 
  PlusCircle,
  Bot,
  User,
  Loader2,
  ArrowRight,
  Lightbulb,
  BookText,
  History,
  Star,
  Trash,
  RotateCcw
} from "lucide-react";
import { useConversation } from "@/hooks/use-conversation";
import { useChatHistory } from "@/hooks/use-chat-history";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@/components/ui/chat";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const conversationId = params.id;
  
  // Create a new conversation if no ID provided
  const { createConversation } = useChatHistory();
  useEffect(() => {
    const initConversation = async () => {
      if (!conversationId) {
        const newConversation = await createConversation("New conversation");
        navigate(`/chat/${newConversation.id}`);
      }
    };
    
    initConversation();
  }, [conversationId, createConversation, navigate]);
  
  // Handle conversation messages
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages 
  } = useConversation(conversationId);
  
  const [inputValue, setInputValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [inputValue]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;
    
    setInputValue('');
    await sendMessage(textToSend);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const startNewChat = async () => {
    const newConversation = await createConversation("New conversation");
    navigate(`/chat/${newConversation.id}`);
  };
  
  const clearAllMessages = () => {
    clearMessages();
    setIsDialogOpen(false);
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">            <div className="col-span-1 space-y-4">
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
              
              <Card className="bg-card shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="font-medium">Prompt Tips</h3>
                  </div>
                  <ul className="text-xs space-y-2 text-muted-foreground">
                    <li className="flex gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <span>Be specific about your desired output format</span>
                    </li>
                    <li className="flex gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <span>Include context and constraints</span>
                    </li>
                    <li className="flex gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <span>Define audience and tone requirements</span>
                    </li>
                    <li className="flex gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <span>Break complex requests into steps</span>
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex justify-between">
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      <BookText className="h-3.5 w-3.5 mr-1" />
                      Prompt Guide
                    </Button>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      <History className="h-3.5 w-3.5 mr-1" />
                      History
                    </Button>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Favorites
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-3">              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
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
            </div>
          </div>
        </div>
        
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear the chat? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={clearAllMessages}
                className="text-destructive"
              >
                Clear Chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
