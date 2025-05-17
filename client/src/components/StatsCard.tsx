import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

export default function StatsCard({ title, value, icon: Icon, bgColor, iconColor }: StatsCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`rounded-full p-3 ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-600">{title}</h2>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
