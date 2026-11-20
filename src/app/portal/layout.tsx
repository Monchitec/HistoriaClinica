import { Suspense, type ReactNode } from "react";
import { PortalShell } from "@/components/portal/layout/PortalShell";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState label="Cargando portal clínico..." />}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
