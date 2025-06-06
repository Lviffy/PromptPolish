import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/components/ui/use-toast";

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Google login failed:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };  return (
    <Button
      variant="outline"
      type="button"
      className="w-full flex items-center justify-center gap-3 py-6 text-lg border-input/50 hover:border-input/70"
      onClick={handleGoogleLogin}
    >
      <FcGoogle className="h-6 w-6" />
      Continue with Google
    </Button>
  );
}