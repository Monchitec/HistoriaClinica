import type { ReactNode } from "react";
import type { ClinicalStatus } from "@/types/clinical";

type BadgeVariant = "neutral" | "primary" | ClinicalStatus;

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const badgeClasses: Record<BadgeVariant, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-secondary text-secondary-foreground border-border",
  normal:
    "bg-clinical-normal-soft text-clinical-normal-foreground border-clinical-normal/25",
  warning:
    "bg-clinical-warning-soft text-clinical-warning-foreground border-clinical-warning/30",
  critical:
    "bg-clinical-critical-soft text-clinical-critical-foreground border-clinical-critical/30",
};

export function Badge({
  variant = "neutral",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
