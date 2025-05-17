import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as React from 'react';
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Auth hook implementation
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user in localStorage
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
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("prompt_enhancer_user", JSON.stringify(userData));
      return userData;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", { username, email, password });
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("prompt_enhancer_user", JSON.stringify(userData));
      return userData;
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      });
      throw error;
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

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}
