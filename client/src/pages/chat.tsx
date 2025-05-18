import React, { useState, useRef, useEffect } from "react";
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

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "I am an AI assistant designed to help you craft better prompts for any purpose. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  
  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate loading
    setIsLoading(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponse(userMessage.content),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const startNewChat = () => {
    setMessages([
      {
        id: "1",
        content: "I am an AI assistant designed to help you craft better prompts for any purpose. How can I help you today?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };
    const deleteMessage = (messageId: string) => {
    setMessages((prevMessages) => {
      // Find the index of the message to delete
      const index = prevMessages.findIndex((msg) => msg.id === messageId);
      
      if (index === -1) return prevMessages;
      
      // If it's a user message and there's an AI response immediately after it, remove both
      if (prevMessages[index].isUser && index + 1 < prevMessages.length && !prevMessages[index + 1].isUser) {
        return [...prevMessages.slice(0, index), ...prevMessages.slice(index + 2)];
      }
      
      // Otherwise just remove the single message
      return [...prevMessages.slice(0, index), ...prevMessages.slice(index + 1)];
    });
  };
  
  // Store original messages for revert functionality
  const [originalMessages, setOriginalMessages] = React.useState<Record<string, string>>({});
  
  // Function to revert a message to its original content
  const revertMessage = (messageId: string) => {
    setMessages((prevMessages) => {
      // Find the message to revert
      const messageIndex = prevMessages.findIndex((msg) => msg.id === messageId);
      
      if (messageIndex === -1) return prevMessages;
      
      // Get the original message if available, otherwise use current content
      const originalContent = originalMessages[messageId] || prevMessages[messageIndex].content;
      
      // Create a new array with the reverted message
      const updatedMessages = [...prevMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: originalContent
      };
      
      return updatedMessages;
    });
  };
  
  const clearAllMessages = () => {
    // Keep only the initial welcome message
    startNewChat();
  };
  
  // Enhanced response generator for demo purposes
  const getResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! 👋 I'm here to help you craft more effective prompts. What kind of prompt would you like to improve today?";
    } else if (lowerMessage.includes("help")) {
      return "I'd be happy to help you improve your prompts! Here's how I can assist:\n\n• Enhance clarity and structure\n• Add specificity and context\n• Adjust tone and style\n• Optimize for your specific use case\n\nJust share your prompt, and I'll suggest improvements!";
    } else if (lowerMessage.includes("example")) {
      return "Here's an example of how I can improve a prompt:\n\n**Original**: \"Generate a story about a dog.\"\n\n**Enhanced**: \"Generate a heartwarming short story (300-500 words) about a loyal dog who helps their elderly owner navigate a challenging situation. Include descriptive language and focus on the emotional bond between them. The story should have a positive resolution that highlights the dog's intuitive understanding of human emotions.\"\n\nNotice how the enhanced version provides specific details about length, tone, characters, plot elements, and desired outcome. Would you like me to help enhance one of your prompts in a similar way?";
    } else if (lowerMessage.includes("creative")) {
      return "For creative prompts, I recommend including specific details about:\n\n1. Desired length or format\n2. Tone or emotional impact\n3. Character details or perspectives\n4. Setting or world-building elements\n5. Thematic elements to explore\n6. Any constraints or special requirements\n\nWould you like to share a creative prompt for enhancement?";
    } else if (lowerMessage.includes("technical")) {
      return "For technical prompts, clarity and precision are key. I recommend:\n\n1. Defining technical terms and requirements upfront\n2. Breaking complex requests into clear steps\n3. Specifying the desired format for the response\n4. Including relevant context about your project or goals\n5. Noting any constraints or limitations\n\nDo you have a technical prompt you'd like me to refine?";
    } else if (lowerMessage.includes("prompt")) {
      if (lowerMessage.length > 100) {
        return "Thank you for sharing your prompt! Here's my enhanced version:\n\n" + message + "\n\n**Enhanced version**:\n\n" + message + " [Now with greater specificity about the desired outcome, clearer structure, and more contextual details to guide the response in the direction you want. I've maintained your original intent while adding parameters that will help produce more consistent, high-quality responses.]";
      } else {
        return "I see you've shared a prompt. To provide the best enhancement, I'd need a bit more context:\n\n• What's the purpose of this prompt?\n• Who is your target audience?\n• What kind of response are you looking to get?\n• Are there any specific improvements you're looking for?\n\nThe more details you share, the better I can help refine your prompt!";
      }
    } else {
      return "I'm your prompt enhancement assistant! I can help you create more effective prompts for any purpose - whether for AI systems, creative writing, technical documentation, or professional communications.\n\nTo get started, you can:\n\n• Share a prompt you'd like to improve\n• Ask for tips on a specific type of prompt\n• Request examples of effective prompts\n• Tell me what you're trying to accomplish\n\nWhat would you like to work on today?";
    }
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
                onRevertMessage={revertMessage}
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
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  clearAllMessages();
                  setIsDialogOpen(false);
                }}
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
