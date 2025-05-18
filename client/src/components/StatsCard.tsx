import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  iconColor,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("border border-border/50 overflow-hidden soft-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground tracking-wide">{title}</h2>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <div className={cn("rounded-xl p-3.5 transition-all duration-300", bgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-60" />
    </Card>
  );
}
