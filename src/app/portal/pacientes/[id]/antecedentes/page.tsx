import { Suspense } from "react";
import type { Metadata } from "next";
import { MedicalHistoryView } from "@/components/portal/antecedentes/MedicalHistoryView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export const metadata: Metadata = {
  title: "Antecedentes y alergias",
  description:
    "Antecedentes patológicos, quirúrgicos, familiares, vacunas y alergias.",
};

export default function MedicalHistoryPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MedicalHistoryView />
    </Suspense>
  );
}
