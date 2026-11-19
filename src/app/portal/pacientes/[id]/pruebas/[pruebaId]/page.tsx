import { Suspense } from "react";
import type { Metadata } from "next";
import { LabResultDetailView } from "@/components/portal/pruebas/LabResultDetailView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const metadata: Metadata = {
  title: "Detalle de resultado",
  description: "Detalle del resultado con barra proporcional de rango normal.",
};

export default function LabResultDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LabResultDetailView />
    </Suspense>
  );
}
