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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-2 bg-primary rounded-lg">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Prompt Enhancer
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Transform your rough ideas into polished, effective prompts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm onNavigationStart={handleNavigation} />
      </div>
    </div>
  );
}
