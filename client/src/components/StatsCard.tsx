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
    <Card className={cn("border border-border/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={cn("rounded-full p-3", bgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
