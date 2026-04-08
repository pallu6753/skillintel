import { LucideIcon } from "lucide-react";

interface DashboardBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export function DashboardBanner({ icon: Icon, title, description }: DashboardBannerProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-4 mb-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
