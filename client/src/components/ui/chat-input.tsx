import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperPlaneIcon, Loader2, Sparkles, Mic, Paperclip } from "lucide-react";

export interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isLoading = false,
  className,
  placeholder = "Type your message here...",
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "inherit";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isLoading) return;
    
    onSend(message.trim());
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn("relative flex items-end")}
      >
        <div className="flex-1 rounded-lg border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
          <div className="flex gap-2 items-center px-2 pt-1.5">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full"
              disabled={disabled || isLoading}
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Attach file</span>
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className="min-h-10 max-h-40 flex-1 resize-none border-0 shadow-none focus-visible:ring-0 p-2"
              rows={1}
            />
            
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full"
              disabled={disabled || isLoading}
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">AI suggestions</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-1 px-2">
            <div className="text-xs text-muted-foreground">
              Shift + Enter for new line
            </div>
            
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className={cn(
                "h-8 rounded-md px-3",
                !message.trim() && "opacity-50"
              )}
              disabled={!message.trim() || disabled || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <PaperPlaneIcon className="mr-1 h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
