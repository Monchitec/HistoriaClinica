import { Suspense } from "react";
import type { Metadata } from "next";
import { LabTrendsView } from "@/components/portal/pruebas/LabTrendsView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export const metadata: Metadata = {
  title: "Tendencias de resultados",
  description: "Gráfica longitudinal de laboratorio con banda de rango normal.",
};

export default function LabTrendsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LabTrendsView />
    </Suspense>
  );
}
