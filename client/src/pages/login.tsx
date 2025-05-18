import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import { Wand2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated && !isNavigating) {
      navigate("/");
    }
  }, [isAuthenticated, navigate, isNavigating]);

  const handleNavigation = () => {
    setIsNavigating(true);
    // Add a delay before navigation to ensure form submission completes
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary rounded-lg">
            <Wand2 className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text-foreground">
          Prompt Enhancer
        </h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          Transform your rough ideas into polished, effective prompts
        </p>
      </div>

      <div className="w-full max-w-md">
        <LoginForm onNavigationStart={handleNavigation} />
      </div>
    </div>
  );
}
