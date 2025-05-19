import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquarePlus, 
  Loader2, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  ChevronDown
} from "lucide-react";
import { useChatHistory } from '@/hooks/use-chat-history';
import { useAuth } from '@/lib/auth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const navigate = useNavigate();
  const { conversations, createConversation, isLoading } = useChatHistory();
  const { user, userProfile, signOut } = useAuth();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const newConversation = await createConversation("New Conversation");
      navigate(`/chat/${newConversation.id}`);
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (userProfile?.username) {
      return userProfile.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isMobileSidebarOpen ? <X /> : <Menu />}
      </Button>
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out
          bg-sidebar border-r border-sidebar-border md:translate-x-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:z-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* User profile */}
          <div className="p-4 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start pl-2 pr-3 py-5 h-auto">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={userProfile?.photoURL || undefined}
                        alt={userProfile?.displayName || "User"}
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left mr-1">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {userProfile?.displayName || userProfile?.username || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {userProfile?.email}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* New Chat button */}
          <div className="p-4">
            <Button 
              className="w-full justify-start" 
              onClick={handleNewChat}
              disabled={isCreatingChat}
            >
              {isCreatingChat ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  New Chat
                </>
              )}
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          {/* Chat list */}
          <div className="flex-1 overflow-auto">
            <div className="px-2 py-2">
              <h3 className="mb-2 px-4 text-sm font-medium">Recent Conversations</h3>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <Button
                      key={conversation.id}
                      variant="ghost"
                      className="w-full justify-start truncate text-left"
                      onClick={() => {
                        navigate(`/chat/${conversation.id}`);
                        setIsMobileSidebarOpen(false);
                      }}
                    >
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      <span className="truncate">{conversation.title}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No conversations yet
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="p-4 border-t">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate('/history')}
              >
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto md:ml-0">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 