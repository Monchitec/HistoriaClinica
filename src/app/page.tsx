import { Suspense } from "react";
import type { Metadata } from "next";
import { EntryGate } from "@/components/auth/EntryGate";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const metadata: Metadata = {
  title: "Acceso clínico",
};

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EntryGate />
    </Suspense>
  );
}
