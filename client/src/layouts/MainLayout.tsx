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
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - hidden on mobile, visible on md and up */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:flex md:flex-shrink-0`}>
        <Sidebar user={user} onCloseSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile header */}
        <MobileHeader onToggleSidebar={toggleSidebar} />

        {/* Content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
