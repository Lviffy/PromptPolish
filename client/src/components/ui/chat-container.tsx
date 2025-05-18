import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ChatContainer({
  children,
  className,
  ...props
}: ChatContainerProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [children]);

  return (
    <ScrollArea 
      className={cn("h-[500px] pr-4", className)} 
      {...props} 
      ref={containerRef}
    >
      <div className="flex flex-col divide-y divide-border/30">
        {children}
        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  );
}
