import { Suspense } from "react";
import type { Metadata } from "next";
import { DiagnosticImagesView } from "@/components/portal/imagenes/DiagnosticImagesView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const metadata: Metadata = {
  title: "Imágenes Diagnósticas",
  description:
    "Estudios radiológicos, ecografías, tomografías e informes con visor clínico.",
};

export default function PatientImagesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DiagnosticImagesView />
    </Suspense>
  );
}
