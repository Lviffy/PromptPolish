import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Columns, Copy, Bookmark, AlignLeft, Wand2 } from "lucide-react";

interface Improvement {
  category: string;
  detail: string;
}

interface OutputDisplayProps {
  originalPrompt: string;
  enhancedPrompt: string;
  improvements: Improvement[];
  onSave?: () => void;
}

export default function OutputDisplay({ 
  originalPrompt, 
  enhancedPrompt, 
  improvements = [],
  onSave
}: OutputDisplayProps) {
  const [isCompareView, setIsCompareView] = useState(false);
  const { toast } = useToast();

  if (!enhancedPrompt) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedPrompt).then(() => {
      toast({
        title: "Copied!",
        description: "Enhanced prompt copied to clipboard.",
        variant: "default",
      });
    });
  };

  // Map categories to colors
  const categoryColors: Record<string, string> = {
    "STRUCTURE": "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700",
    "CLARITY": "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700",
    "INTERACTION": "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700",
    "SPECIFICITY": "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700",
    "PROCESSED": "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
  };

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border mb-8 p-6 dark:shadow-lg dark:shadow-primary/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-accent" /> 
            Enhanced Result
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareView(!isCompareView)}
              className="text-sm text-muted-foreground border border-border hover:bg-secondary dark:hover:bg-muted transition-colors"
            >
              {isCompareView ? (
                <>
                  <AlignLeft className="h-4 w-4 mr-1" /> Single View
                </>
              ) : (
                <>
                  <Columns className="h-4 w-4 mr-1" /> Compare View
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-sm text-accent border border-accent/70 hover:bg-accent/10 transition-colors"
            >
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className="text-sm text-success border border-success/70 hover:bg-success/10 dark:border-success/70 dark:hover:bg-success/20 transition-colors"
              >
                <Bookmark className="h-4 w-4 mr-1" /> Save
              </Button>
            )}
          </div>
        </div>
        
        {/* Single View */}
        {!isCompareView && (
          <div>
            <div className="p-4 rounded-lg border border-border/60 bg-muted/50 dark:bg-surface dark:border-accent/20 shadow-sm">
              <div className="font-mono text-sm text-foreground whitespace-pre-wrap">
                {enhancedPrompt}
              </div>
            </div>
            
            {/* Improvements Summary */}
            {improvements.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {improvements.slice(0, 3).map((improvement, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-3 shadow-sm dark:shadow-md ${
                      categoryColors[improvement.category] || "bg-muted border-border dark:bg-surface dark:border-accent/20"
                    }`}
                  >
                    <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{improvement.category}</div>
                    <div className="text-sm text-foreground">{improvement.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Compare View */}
        {isCompareView && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div>
                <div className="mb-2 text-sm font-medium text-foreground flex items-center">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></span>
                  Original Prompt
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border dark:bg-surface/70 dark:border-primary/20">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {originalPrompt}
                  </div>
                </div>
              </div>
              
              {/* Enhanced */}
              <div>
                <div className="mb-2 text-sm font-medium text-foreground flex items-center">
                  <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                  Enhanced Prompt
                </div>
                <div className="bg-muted p-4 rounded-lg border border-accent/30 dark:bg-surface dark:border-accent/30 dark:shadow-sm">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {enhancedPrompt}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Improvements */}
            {improvements.length > 0 && (
              <div className="mt-6 bg-muted/50 dark:bg-surface/50 p-4 rounded-lg border border-border dark:border-primary/20">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                  Improvements Applied
                </h3>
                <ul className="space-y-3">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-success dark:text-success flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      <span className="text-sm text-foreground">{improvement.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
