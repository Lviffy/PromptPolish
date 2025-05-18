import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import { 
  Home, 
  History, 
  Star, 
  Settings, 
  Wand2
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export default function Sidebar({ onCloseSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

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

  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
    { href: "/history", label: "History", icon: <History className="w-4 h-4" /> },
    { href: "/favorites", label: "Favorites", icon: <Star className="w-4 h-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col w-64 border-r border-border bg-card text-card-foreground">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Wand2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Prompt Enhancer</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1 bg-card">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onCloseSidebar}
                className={`rounded-lg px-3 py-2 flex items-center space-x-3 font-medium transition-colors ${isActive 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Theme Toggle */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">Toggle Theme</span>
            <ThemeToggle />
          </div>
        </div>
        
        {/* User Menu */}
        {user && (
          <div className="p-4 mt-auto border-t border-border bg-muted/30">
            <div className="flex items-center">
              <Avatar className="mr-3 h-10 w-10">
                <AvatarImage src={user?.photoURL || ''} alt={user.username} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{getInitials()}</p>
                <button 
                  onClick={handleLogout} 
                  className="text-xs text-destructive hover:underline"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
