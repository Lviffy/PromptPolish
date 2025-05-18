import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleLogin}
    >
      <FcGoogle className="h-5 w-5" />
      Continue with Google
    </Button>
  );
} 