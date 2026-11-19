import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginView } from "@/components/auth/LoginView";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export const metadata: Metadata = {
  title: "Ingreso del médico",
  description: "Acceso al portal clínico Rubí HCE.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginView />
    </Suspense>
  );
}
