"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Button } from "@/components/shared/ui/Button";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { LoadingState } from "@/components/shared/ui/LoadingState";
import { PatientBanner } from "./PatientBanner";

export function PatientShell({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { isReady, db } = useHce();

  if (!isReady) {
    return <LoadingState label="Abriendo ficha clínica del paciente..." />;
  }

  const patient = db.patients.find((p) => p.id === params.id);

  if (!patient) {
    return (
      <div className="py-10">
        <EmptyState
          icon={UserX}
          title="Historia clínica no encontrada"
          description="El identificador de paciente no existe en este navegador o los datos demo fueron reiniciados."
          action={
            <Link href="/portal">
              <Button>Volver al Portal Médico</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PatientBanner patient={patient} />
      {children}
    </div>
  );
}
