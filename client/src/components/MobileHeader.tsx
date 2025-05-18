import { Wand2, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

export default function MobileHeader({ onToggleSidebar }: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Get user's first initial for the avatar fallback
  const getInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center justify-between shadow-sm h-16 bg-card text-card-foreground">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar} 
          className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-3 flex items-center space-x-2">
          <div className="p-1.5 bg-primary rounded-md">
            <Wand2 className="h-4 w-4 text-primary-foreground text-sm" />
          </div>
          <span className="text-lg font-semibold">Prompt Enhancer</span>
        </div>
      </div>
      <div className="pr-3 flex items-center space-x-3">
        <ThemeToggle />
        {isAuthenticated && (
          <Link to="/settings">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} alt="Profile" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </div>
  );
}
