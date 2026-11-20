"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
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
import { Modal } from "@/components/shared/ui/Modal";
import { calculateAge } from "@/lib/clinical/calculators";
import { evaluateLabResult } from "@/lib/clinical/lab-evaluation";
import { formatClinicalDate } from "@/lib/format/es-pe";
import type { InsuranceType, Patient } from "@/types/clinical";
import { EditPatientModal } from "./EditPatientModal";
import { NewPatientModal } from "./NewPatientModal";

const INSURANCE_FILTERS: Array<"Todos" | InsuranceType> = [
  "Todos",
  "EsSalud",
  "SIS",
  "Privado",
  "Particular",
];

export function PatientDirectoryView() {
  const { db, deletePatient } = useHce();
  const [query, setQuery] = useState("");
  const [insuranceFilter, setInsuranceFilter] = useState<
    "Todos" | InsuranceType
  >("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [openMenuPatientId, setOpenMenuPatientId] = useState<string | null>(
    null,
  );
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!openMenuPatientId) return;
    function handleClose() {
      setOpenMenuPatientId(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenuPatientId(null);
    }
    window.addEventListener("click", handleClose);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuPatientId]);

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

  function handleConfirmDelete() {
    if (!deletingPatient) return;
    deletePatient(deletingPatient.id);
    setDeletingPatient(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Gestión de Pacientes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Busca, edita, registra o elimina historias clínicas por nombre, DNI,
            N° HC o diagnóstico CIE-10.
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
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {patient.diagnoses.slice(0, 2).map((dx) => (
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
                          {patient.diagnoses.length > 2 && (
                            <span
                              title={patient.diagnoses
                                .slice(2)
                                .map((dx) => `${dx.code} ${dx.description}`)
                                .join(" · ")}
                              className="border-border bg-secondary text-secondary-foreground rounded-lg border px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                            >
                              +{patient.diagnoses.length - 2} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/portal/pacientes/${patient.id}`}>
                      <Button size="sm">
                        Abrir historia
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      </Button>
                    </Link>

                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label={`Más acciones para ${patient.fullName}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenuPatientId === patient.id}
                        onClick={() =>
                          setOpenMenuPatientId((prev) =>
                            prev === patient.id ? null : patient.id,
                          )
                        }
                        className="border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                      </button>

                      {openMenuPatientId === patient.id && (
                        <div
                          role="menu"
                          className="border-border bg-card absolute top-full right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border py-1 shadow-lg"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuPatientId(null);
                              setEditingPatient(patient);
                            }}
                            className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
                          >
                            <Pencil
                              className="text-muted-foreground h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                            Editar datos
                          </button>

                          <div className="border-border my-1 border-t" />

                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuPatientId(null);
                              setDeletingPatient(patient);
                            }}
                            className="text-clinical-critical hover:bg-clinical-critical-soft flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold transition-colors"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                            Eliminar historia
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewPatientModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <EditPatientModal
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
      />

      <Modal
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        title="Eliminar historia clínica"
        description="Esta acción eliminará permanentemente al paciente y todos sus registros asociados."
        maxWidthClass="max-w-md"
      >
        {deletingPatient && (
          <div className="space-y-4">
            <div className="border-clinical-critical/30 bg-clinical-critical-soft text-clinical-critical-foreground flex items-start gap-3 rounded-xl border p-3.5 text-xs">
              <AlertTriangle
                className="text-clinical-critical mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.9}
              />
              <div className="space-y-1">
                <p className="font-bold">{deletingPatient.fullName}</p>
                <p className="tabular-nums">
                  DNI {deletingPatient.dni} ·{" "}
                  <span className="font-mono">{deletingPatient.hcNumber}</span>
                </p>
                <p>
                  Se borrarán sus resultados de laboratorio, evoluciones SOAP,
                  signos vitales, medicamentos e imágenes diagnósticas.
                </p>
              </div>
            </div>

            <div className="border-border flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setDeletingPatient(null)}
              >
                Cancelar
              </Button>
              <Button variant="critical" onClick={handleConfirmDelete}>
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Eliminar paciente
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
