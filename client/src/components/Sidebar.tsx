import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  History, 
  Star, 
  Settings, 
  Wand2
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  onCloseSidebar?: () => void;
}

export default function Sidebar({ user, onCloseSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

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
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Wand2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">Prompt Enhancer</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1 bg-white">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onCloseSidebar}
                className={`${
                  isActive 
                    ? 'bg-primary bg-opacity-10 text-primary' 
                    : 'hover:bg-gray-100 text-gray-700'
                } rounded-lg px-3 py-2 flex items-center space-x-3 font-medium`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Menu */}
        {user && (
          <div className="p-4 mt-auto border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-gray-100 rounded-full h-10 w-10 mr-3">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <button 
                  onClick={handleLogout} 
                  className="text-xs text-red-500 hover:underline"
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
