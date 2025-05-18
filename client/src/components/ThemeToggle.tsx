import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Reset animation state after transition
  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`relative overflow-hidden ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`}>
        {theme === "dark" ? (
          <Moon className="h-5 w-5 text-accent" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
      </div>
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center animate-spin">
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5 text-accent" />
          )}
        </div>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
