import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Columns, Copy, Bookmark, AlignLeft } from "lucide-react";

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
    "STRUCTURE": "bg-green-50 border-green-200",
    "CLARITY": "bg-blue-50 border-blue-200",
    "INTERACTION": "bg-purple-50 border-purple-200",
    "SPECIFICITY": "bg-amber-50 border-amber-200",
    "PROCESSED": "bg-gray-50 border-gray-200"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enhanced Result</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareView(!isCompareView)}
              className="text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
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
              className="text-sm text-primary border border-primary hover:bg-primary/10"
            >
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className="text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                <Bookmark className="h-4 w-4 mr-1" /> Save
              </Button>
            )}
          </div>
        </div>
        
        {/* Single View */}
        {!isCompareView && (
          <div>
            <div className="bg-neutral-light p-4 rounded-lg border border-gray-200">
              <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                {enhancedPrompt}
              </div>
            </div>
            
            {/* Improvements Summary */}
            {improvements.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {improvements.slice(0, 3).map((improvement, index) => (
                  <div key={index} className={`border rounded-lg p-3 ${categoryColors[improvement.category] || "bg-gray-50 border-gray-200"}`}>
                    <div className="text-xs font-semibold text-gray-500 mb-1">{improvement.category}</div>
                    <div className="text-sm">{improvement.detail}</div>
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
                <div className="mb-2 text-sm font-medium text-gray-700">Original Prompt</div>
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                  <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                    {originalPrompt}
                  </div>
                </div>
              </div>
              
              {/* Enhanced */}
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">Enhanced Prompt</div>
                <div className="bg-neutral-light p-4 rounded-lg border border-gray-200">
                  <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                    {enhancedPrompt}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Improvements */}
            {improvements.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Improvements Applied</h3>
                <ul className="space-y-2">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">{improvement.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
