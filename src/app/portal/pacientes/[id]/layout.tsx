import { Suspense, type ReactNode } from "react";
import { PatientShell } from "@/components/portal/layout/PatientShell";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState label="Abriendo historia clínica..." />}>
      <PatientShell>{children}</PatientShell>
    </Suspense>
  );
}
