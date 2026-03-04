import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-bold mt-1">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <p className={cn("text-sm font-medium mt-2", trend.positive ? "text-success" : "text-destructive")}>
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
