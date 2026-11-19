import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
      <div className="bg-secondary text-primary flex h-11 w-11 items-center justify-center rounded-xl">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-foreground mt-3 text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-md text-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
