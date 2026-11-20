import { Suspense } from "react";
import type { Metadata } from "next";
import { MedicationsView } from "@/components/portal/medicamentos/MedicationsView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export const metadata: Metadata = {
  title: "Medicamentos",
  description: "Esquema terapéutico activo e historial farmacológico.",
};

export default function MedicationsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MedicationsView />
    </Suspense>
  );
}
