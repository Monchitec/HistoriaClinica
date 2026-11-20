"use client";

import Link from "next/link";
import { Camera, Droplets, FileBadge2, Phone, ShieldAlert } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Avatar } from "@/components/shared/ui/Avatar";
import { Badge } from "@/components/shared/ui/Badge";
import { calculateAge } from "@/lib/clinical/calculators";
import { formatClinicalDate } from "@/lib/format/es-pe";
import { compressImageFile } from "@/lib/format/image-compression";
import type { Patient } from "@/types/clinical";

export function PatientBanner({ patient }: { patient: Patient }) {
  const { updatePatientPhoto } = useHce();
  const age = calculateAge(patient.birthDate);
  const sexLabel = patient.sex === "F" ? "Femenino" : "Masculino";
  const hasAllergies = patient.allergies.length > 0;
  const summaryHref = `/portal/pacientes/${patient.id}`;

  async function handlePhotoUpload(file?: File) {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxDimension: 320 });
      updatePatientPhoto(patient.id, compressed);
    } catch {
      // Ignorar archivos inválidos
    }
  }

  return (
    <section
      aria-label="Identificación y alertas del paciente"
      className="border-border bg-card mb-6 overflow-hidden rounded-2xl border shadow-xs"
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3.5">
          <label
            title="Actualizar foto del paciente"
            className="group relative shrink-0 cursor-pointer"
          >
            <Avatar src={patient.photoUrl} name={patient.fullName} size="lg" />
            <span className="bg-foreground/65 text-background absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <input
              type="file"
              accept="image/*"
              aria-label="Actualizar foto del paciente"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                void handlePhotoUpload(file);
                e.target.value = "";
              }}
            />
          </label>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={summaryHref}
                className="text-foreground hover:text-primary text-base font-bold tracking-tight transition-colors sm:text-lg"
              >
                {patient.fullName}
              </Link>
              <Badge variant="primary">{patient.insurance}</Badge>
            </div>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="tabular-nums">
                {age} años · {sexLabel}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <FileBadge2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                DNI {patient.dni}
              </span>
              <span className="font-mono text-[11px] tabular-nums">
                {patient.hcNumber}
              </span>
              <span className="inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5" strokeWidth={1.75} />
                Grupo {patient.bloodGroup}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                {patient.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-muted-foreground text-[11px] font-medium">
            Última actualización
          </p>
          <p className="text-foreground text-xs font-semibold tabular-nums">
            {formatClinicalDate(patient.updatedAt)}
          </p>
        </div>
      </div>

      {/* Franja fija de Alergias */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-xs sm:px-5 ${
          hasAllergies
            ? "border-clinical-critical/30 bg-clinical-critical-soft text-clinical-critical-foreground"
            : "border-border bg-muted/60 text-muted-foreground"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <ShieldAlert
            className={`h-4 w-4 shrink-0 ${
              hasAllergies ? "text-clinical-critical" : "text-muted-foreground"
            }`}
            strokeWidth={1.9}
          />
          {hasAllergies ? (
            <>
              <span className="font-bold tracking-wide uppercase">
                Alergias:
              </span>
              <span className="font-semibold">
                {patient.allergies
                  .map((a) => `${a.substance} (${a.severity})`)
                  .join(" · ")}
              </span>
            </>
          ) : (
            <span className="font-medium">
              Sin alergias medicamentosas conocidas (NKDA)
            </span>
          )}
        </div>
        <Link
          href={`/portal/pacientes/${patient.id}/antecedentes`}
          className="font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Gestionar alergias
        </Link>
      </div>
    </section>
  );
}
