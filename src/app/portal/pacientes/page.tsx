import { Suspense } from "react";
import type { Metadata } from "next";
import { PatientDirectoryView } from "@/components/portal/pacientes/PatientDirectoryView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const metadata: Metadata = {
  title: "Pacientes",
  description: "Directorio de pacientes y creación de historias clínicas.",
};

export default function PacientesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PatientDirectoryView />
    </Suspense>
  );
}
