"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Avatar } from "@/components/shared/ui/Avatar";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { Card, CardContent } from "@/components/shared/ui/Card";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Input } from "@/components/shared/ui/Input";
import { calculateAge } from "@/lib/clinical/calculators";
import { evaluateLabResult } from "@/lib/clinical/lab-evaluation";
import { formatClinicalDate } from "@/lib/format/es-pe";
import type { InsuranceType } from "@/types/clinical";
import { NewPatientModal } from "./NewPatientModal";

const INSURANCE_FILTERS: Array<"Todos" | InsuranceType> = [
  "Todos",
  "EsSalud",
  "SIS",
  "Privado",
  "Particular",
];

export function PatientDirectoryView() {
  const { db } = useHce();
  const [query, setQuery] = useState("");
  const [insuranceFilter, setInsuranceFilter] = useState<
    "Todos" | InsuranceType
  >("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.patients.filter((patient) => {
      const matchesInsurance =
        insuranceFilter === "Todos" || patient.insurance === insuranceFilter;
      if (!matchesInsurance) return false;
      if (!q) return true;
      return (
        patient.fullName.toLowerCase().includes(q) ||
        patient.dni.toLowerCase().includes(q) ||
        patient.hcNumber.toLowerCase().includes(q) ||
        patient.diagnoses.some((d) =>
          `${d.code} ${d.description}`.toLowerCase().includes(q),
        )
      );
    });
  }, [db.patients, query, insuranceFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Directorio de Pacientes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Busca por nombre, DNI, número de historia clínica o diagnóstico
            CIE-10.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="h-4 w-4" strokeWidth={1.75} />
          Nuevo paciente
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              strokeWidth={1.75}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paciente por nombre, DNI, N° HC o diagnóstico..."
              aria-label="Buscar paciente"
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {INSURANCE_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setInsuranceFilter(item)}
                className={`focus-visible:ring-ring cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  insuranceFilter === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron pacientes"
          description="Prueba con otro DNI, nombre o limpia los filtros de cobertura."
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => {
            const patientLabs = db.labResults.filter(
              (lab) => lab.patientId === patient.id,
            );
            const alteredCount = patientLabs.filter(
              (lab) => evaluateLabResult(lab).status !== "normal",
            ).length;

            return (
              <Card
                key={patient.id}
                className="hover:border-primary/40 transition-colors"
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <Avatar
                      src={patient.photoUrl}
                      name={patient.fullName}
                      size="lg"
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/portal/pacientes/${patient.id}`}
                          className="text-foreground hover:text-primary text-base font-bold"
                        >
                          {patient.fullName}
                        </Link>
                        <Badge variant="primary">{patient.insurance}</Badge>
                        {patient.allergies.length > 0 && (
                          <Badge variant="critical">
                            Alergia: {patient.allergies[0].substance}
                          </Badge>
                        )}
                        {alteredCount > 0 && (
                          <Badge variant="warning" className="tabular-nums">
                            {alteredCount} pruebas alteradas
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums">
                        <span>
                          {calculateAge(patient.birthDate)} años ·{" "}
                          {patient.sex === "F" ? "Femenino" : "Masculino"}
                        </span>
                        <span>DNI {patient.dni}</span>
                        <span className="font-mono">{patient.hcNumber}</span>
                        <span>
                          Actualizado: {formatClinicalDate(patient.updatedAt)}
                        </span>
                      </div>

                      {patient.diagnoses.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {patient.diagnoses.slice(0, 3).map((dx) => (
                            <span
                              key={dx.id}
                              className="border-border bg-muted/60 text-foreground rounded-lg border px-2 py-0.5 text-[11px] font-medium"
                            >
                              <span className="text-primary font-mono font-semibold">
                                {dx.code}
                              </span>{" "}
                              {dx.description}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link href={`/portal/pacientes/${patient.id}/pruebas`}>
                      <Button variant="outline" size="sm">
                        <FlaskConical
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                        Pruebas
                      </Button>
                    </Link>
                    <Link href={`/portal/pacientes/${patient.id}`}>
                      <Button size="sm">
                        Abrir historia
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewPatientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
