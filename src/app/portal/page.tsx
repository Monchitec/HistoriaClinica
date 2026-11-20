import { Suspense } from "react";
import type { Metadata } from "next";
import { DoctorPortalView } from "@/components/portal/dashboard/DoctorPortalView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const instant = false;

export const metadata: Metadata = {
  title: "Portal Médico",
  description:
    "Panel principal del médico con búsqueda de historias clínicas y alertas de laboratorio.",
};

export default function PortalPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DoctorPortalView />
    </Suspense>
  );
}
