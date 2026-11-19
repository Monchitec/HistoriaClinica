import { Suspense } from "react";
import type { Metadata } from "next";
import { LabResultsView } from "@/components/portal/pruebas/LabResultsView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const metadata: Metadata = {
  title: "Resultados de pruebas",
  description: "Lista buscable y filtrable de exámenes clínicos.",
};

export default function LabResultsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LabResultsView />
    </Suspense>
  );
}
