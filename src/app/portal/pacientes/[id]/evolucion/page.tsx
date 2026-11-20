import { Suspense } from "react";
import type { Metadata } from "next";
import { EvolutionView } from "@/components/portal/evolucion/EvolutionView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export const metadata: Metadata = {
  title: "Evolución clínica",
  description: "Notas de evolución SOAP y signos vitales del paciente.",
};

export default function EvolutionPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EvolutionView />
    </Suspense>
  );
}
