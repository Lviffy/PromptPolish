import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { z } from "zod";
import GoogleLoginButton from "./GoogleLoginButton";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface LoginFormProps {
  onClose?: () => void;
  onNavigationStart?: () => void;
}

export default function LoginForm({ onClose, onNavigationStart }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormSwitch = () => {
    if (isSubmitting) return;
    setIsLogin(!isLogin);
    setErrors({});
    // Clear form fields when switching
    setLoginEmail("");
    setLoginPassword("");
    setRegisterUsername("");
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    onNavigationStart?.();
    
    try {
      // Validate
      const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach(error => {
          formattedErrors[error.path[0]] = error.message;
        });
        setErrors(formattedErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Use our regular authentication system
      await login(loginEmail, loginPassword);
      // Add a delay before closing
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    onNavigationStart?.();
    
    try {
      // Validate
      const result = registerSchema.safeParse({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        confirmPassword
      });
      
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach(error => {
          formattedErrors[error.path[0]] = error.message;
        });
        setErrors(formattedErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Use our regular registration system
      await register(registerUsername, registerEmail, registerPassword);
      
      // Handle successful signup and redirect
      toast({
        title: "Sign Up Successful",
        description: "Your account has been created.",
      });
      
      // Add a delay before closing
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };  return (
    <Card className="max-w-md w-full mx-auto shadow-md border border-muted/40">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {isLogin ? (
          <>
            <form onSubmit={onLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base mb-1">Email</Label>                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="py-6 text-base"
                  required
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base mb-1">Password</Label>                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="py-6 text-base"
                  required
                />
                {errors.password && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.password}</p>
                )}
              </div>
                <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GoogleLoginButton />
          </>
        ) : (
          <>
            <form onSubmit={onRegisterSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base mb-1">Username</Label>                <Input
                  id="username"
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="py-6 text-base"
                  required
                />
                {errors.username && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-base mb-1">Email</Label>                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="py-6 text-base"
                  required
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-base mb-1">Password</Label>                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="py-6 text-base"
                  required
                />
                {errors.password && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-base mb-1">Confirm Password</Label>                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="py-6 text-base"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
                <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GoogleLoginButton />
          </>
        )}
          <div className="mt-8 text-center">
          <p className="text-base text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={handleFormSwitch}
              className="text-primary font-medium hover:underline"
              disabled={isSubmitting}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
