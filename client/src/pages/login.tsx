import { useEffect } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { Wand2 } from "lucide-react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
        <LoginForm />
      </div>
    </div>
  );
}
