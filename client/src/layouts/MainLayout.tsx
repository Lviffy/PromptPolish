import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated && location !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, location, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated && location !== "/login") {
    return null; // Don't render anything during redirect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background/95 to-accent/5 text-foreground">
      {/* Sidebar with backdrop blur */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300 md:hidden
          ${isSidebarOpen ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:flex md:flex-shrink-0`}
      >
        <Sidebar onCloseSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile header */}
        <MobileHeader onToggleSidebar={toggleSidebar} />

        {/* Content area with glass effect */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 md:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
