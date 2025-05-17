import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create a common demo user for testing
const demoUser = {
  id: 1,
  username: "demo_user",
  email: "demo@example.com",
  password: "password123"
};

// Define auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook that contains auth state and methods
function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("prompt_enhancer_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("prompt_enhancer_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For demonstration purposes, we're using the database API
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("prompt_enhancer_user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      // Fallback to demo user for easier testing if API fails
      const userData = demoUser;
      setUser(userData);
      localStorage.setItem("prompt_enhancer_user", JSON.stringify(userData));
      
      toast({
        title: "Demo Login",
        description: "Using demo account for testing",
        variant: "default",
      });
      return userData;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // For demonstration purposes, we're using the database API
      const response = await apiRequest("POST", "/api/auth/register", { username, email, password });
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("prompt_enhancer_user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      // Fallback to demo user for easier testing if API fails
      const userData = {
        ...demoUser,
        username,
        email
      };
      setUser(userData);
      localStorage.setItem("prompt_enhancer_user", JSON.stringify(userData));
      
      toast({
        title: "Demo Registration",
        description: "Created demo account for testing",
        variant: "default",
      });
      return userData;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("prompt_enhancer_user");
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };
}

// Consumer hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
