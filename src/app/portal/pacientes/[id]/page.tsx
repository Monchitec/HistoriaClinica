import { Suspense } from "react";
import type { Metadata } from "next";
import { HealthSummaryView } from "@/components/portal/resumen/HealthSummaryView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export const metadata: Metadata = {
  title: "Resumen de salud",
  description:
    "Resumen integral de problemas activos, laboratorio y medicación.",
};

export default function PatientSummaryPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HealthSummaryView />
    </Suspense>
  );
}
