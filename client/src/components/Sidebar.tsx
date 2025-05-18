import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import { 
  PlusCircle, 
  MessageSquare, 
  History, 
  Star, 
  Settings, 
  LogOut, 
  Sparkles
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export default function Sidebar({ onCloseSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Prompt optimization techniques', date: '2 hours ago' },
    { id: '2', title: 'Creative writing assistant', date: 'Yesterday' },
    { id: '3', title: 'Technical documentation help', date: '2 days ago' },
  ]);

  // Get user's first initial for the avatar fallback
  const getInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    if (onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const startNewChat = () => {
    // Logic to start a new chat
    setConversations(prev => [
      { id: Date.now().toString(), title: 'New conversation', date: 'Just now' },
      ...prev
    ]);
  };

  const navItems = [
    { href: "/", label: "New chat", icon: <PlusCircle className="w-4 h-4" /> },
    { href: "/history", label: "History", icon: <History className="w-4 h-4" /> },
    { href: "/favorites", label: "Favorites", icon: <Star className="w-4 h-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col w-64 border-r border-border bg-card h-full">
      <div className="flex flex-col h-full">
        {/* New Chat Button */}
        <div className="p-3">
          <Button 
            onClick={startNewChat}
            className="w-full justify-start gap-3 bg-primary hover:bg-primary/90 font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New chat</span>
          </Button>
        </div>
        
        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <h2 className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent conversations</h2>
          <div className="space-y-1">
            {conversations.map(chat => (
              <Link 
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={onCloseSidebar}
                className="group flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-muted/50 transition-colors w-full overflow-hidden text-ellipsis whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <p className="truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{chat.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="px-3 py-2 border-t border-border space-y-1">
          <Link 
            href="/history"
            onClick={onCloseSidebar}
            className="flex items-center gap-3 rounded-lg p-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Link>
          <Link 
            href="/favorites"
            onClick={onCloseSidebar}
            className="flex items-center gap-3 rounded-lg p-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Star className="h-4 w-4" />
            <span>Saved prompts</span>
          </Link>
        </div>
        
        {/* Theme Toggle & User Profile */}
        <div className="mt-auto border-t border-border p-3">
          <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <span className="text-sm">Dark mode</span>
            <ThemeToggle />
          </div>
          
          {/* User Menu */}
          {user && (
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center">
                <Avatar className="mr-3 h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} alt={user.username} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium truncate">{user?.username}</div>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-muted-foreground hover:text-destructive"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
