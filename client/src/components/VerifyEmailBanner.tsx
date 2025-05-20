import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Loader2, Mail, AlertTriangle } from "lucide-react";

export default function VerifyEmailBanner() {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user, sendVerificationEmail } = useAuth();
  
  // Don't show if no user or if email is already verified
  if (!user || user.emailVerified) {
    return null;
  }
  
  const handleResendVerification = async () => {
    if (isResending) return;
    
    try {
      setIsResending(true);
      await sendVerificationEmail();
      setEmailSent(true);
      
      // Reset the "sent" state after 30 seconds to allow requesting another email
      setTimeout(() => {
        setEmailSent(false);
      }, 30000);
    } catch (error) {
      console.error("Failed to resend verification:", error);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <Alert className="border-amber-500 bg-amber-50 text-amber-800 my-4">
      <AlertTriangle className="h-5 w-5 text-amber-800" />
      <AlertTitle className="text-amber-800 flex items-center gap-2">
        <Mail className="h-4 w-4" /> Please verify your email address
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          A verification email has been sent to <strong>{user.email}</strong>. 
          Please check your inbox and follow the verification link.
        </p>
        {!emailSent ? (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-amber-500 hover:bg-amber-100 text-amber-800"
            onClick={handleResendVerification} 
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        ) : (
          <p className="text-sm">
            Verification email sent! Please check your inbox and spam folder.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
} 