"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  ChevronDown,
  ClipboardPlus,
  FlaskConical,
  FolderClock,
  Image as ImageIcon,
  Pill,
  Plus,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { NewDiagnosticStudyModal } from "@/components/portal/imagenes/NewDiagnosticStudyModal";
import { NewLabModal } from "@/components/portal/pruebas/NewLabModal";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import { FieldLabel, Input, Select } from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import {
  calculateBmi,
  classifyBloodPressure,
} from "@/lib/clinical/calculators";
import { evaluateLabResult } from "@/lib/clinical/lab-evaluation";
import { formatClinicalDate } from "@/lib/format/es-pe";

export function HealthSummaryView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { db, addDiagnosis } = useHce();

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [dxModalOpen, setDxModalOpen] = useState(false);
  const [dxCode, setDxCode] = useState("");
  const [dxDesc, setDxDesc] = useState("");
  const [dxStatus, setDxStatus] = useState<"activo" | "controlado">("activo");

  useEffect(() => {
    if (!actionMenuOpen) return;
    function handleClose() {
      setActionMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActionMenuOpen(false);
    }
    window.addEventListener("click", handleClose);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionMenuOpen]);

  const patient = db.patients.find((p) => p.id === params.id);

  const latestLabs = useMemo(() => {
    const sorted = [...db.labResults]
      .filter((r) => r.patientId === params.id)
      .sort(
        (a, b) =>
          new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
      );

    const uniqueMap = new Map<string, (typeof sorted)[number]>();
    for (const item of sorted) {
      if (!uniqueMap.has(item.testCode)) {
        uniqueMap.set(item.testCode, item);
      }
    }
    return Array.from(uniqueMap.values()).slice(0, 5);
  }, [db.labResults, params.id]);

  const latestSoap = useMemo(() => {
    return [...db.soapNotes]
      .filter((n) => n.patientId === params.id)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];
  }, [db.soapNotes, params.id]);

  const latestVital = useMemo(() => {
    return [...db.vitals]
      .filter((v) => v.patientId === params.id)
      .sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      )[0];
  }, [db.vitals, params.id]);

  const activeMeds = useMemo(() => {
    return db.medications.filter(
      (m) => m.patientId === params.id && m.status === "activo",
    );
  }, [db.medications, params.id]);

  if (!patient) return null;

  const quickTiles = [
    {
      href: `/portal/pacientes/${patient.id}/pruebas`,
      label: "Resultados de pruebas",
      icon: FlaskConical,
      count: db.labResults.filter((r) => r.patientId === patient.id).length,
    },
    {
      href: `/portal/pacientes/${patient.id}/imagenes`,
      label: "Imágenes diagnósticas",
      icon: ImageIcon,
      count: db.diagnosticStudies.filter((s) => s.patientId === patient.id)
        .length,
    },
    {
      href: `/portal/pacientes/${patient.id}/evolucion`,
      label: "Evolución SOAP",
      icon: Stethoscope,
      count: db.soapNotes.filter((n) => n.patientId === patient.id).length,
    },
    {
      href: `/portal/pacientes/${patient.id}/medicamentos`,
      label: "Medicamentos",
      icon: Pill,
      count: activeMeds.length,
    },
    {
      href: `/portal/pacientes/${patient.id}/antecedentes`,
      label: "Antecedentes",
      icon: FolderClock,
      count:
        patient.history.pathological.length +
        patient.history.surgical.length +
        patient.history.vaccines.length,
    },
    {
      href: `/portal/pacientes/${patient.id}/evolucion#vitales`,
      label: "Signos vitales",
      icon: Activity,
      count: db.vitals.filter((v) => v.patientId === patient.id).length,
    },
  ];

  const bpEval = latestVital
    ? classifyBloodPressure(latestVital.systolicBp, latestVital.diastolicBp)
    : null;
  const bmiEval = latestVital
    ? calculateBmi(latestVital.weightKg, latestVital.heightCm)
    : null;

  function handleAddDiagnosis(event: FormEvent) {
    event.preventDefault();
    if (!patient || !dxDesc.trim()) return;
    addDiagnosis(patient.id, {
      code: dxCode.trim().toUpperCase() || "Z00.0",
      description: dxDesc.trim(),
      diagnosedAt: new Date().toISOString().slice(0, 10),
      status: dxStatus,
    });
    setDxCode("");
    setDxDesc("");
    setDxModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Resumen de salud
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Vista integral de Medicina Interna: alertas vigentes, problemas
            activos, medicación y última evaluación.
          </p>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            aria-haspopup="menu"
            aria-expanded={actionMenuOpen}
            onClick={() => setActionMenuOpen((prev) => !prev)}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Nuevo registro
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>

          {actionMenuOpen && (
            <div
              role="menu"
              className="border-border bg-card absolute top-full right-0 z-20 mt-1.5 w-60 overflow-hidden rounded-xl border py-1.5 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionMenuOpen(false);
                  router.push(`/portal/pacientes/${patient.id}/evolucion`);
                }}
                className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
              >
                <ClipboardPlus
                  className="text-primary h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Nueva evolución SOAP
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionMenuOpen(false);
                  setLabModalOpen(true);
                }}
                className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
              >
                <FlaskConical
                  className="text-primary h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Nuevo resultado de laboratorio
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionMenuOpen(false);
                  setImageModalOpen(true);
                }}
                className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
              >
                <ImageIcon
                  className="text-primary h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Nueva imagen diagnóstica
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionMenuOpen(false);
                  setDxModalOpen(true);
                }}
                className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
              >
                <Stethoscope
                  className="text-primary h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Nuevo diagnóstico (CIE-10)
              </button>

              <div className="border-border my-1 border-t" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionMenuOpen(false);
                  router.push(
                    `/portal/pacientes/${patient.id}/evolucion#vitales`,
                  );
                }}
                className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
              >
                <Activity
                  className="text-muted-foreground h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Registrar signos vitales
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionMenuOpen(false);
                  router.push(`/portal/pacientes/${patient.id}/medicamentos`);
                }}
                className="text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors"
              >
                <Pill
                  className="text-muted-foreground h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Prescribir medicamento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fila de tarjetas rápidas (estilo Kaiser Permanente) */}
      <nav
        aria-label="Accesos rápidos del paciente"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {quickTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.label}
              href={tile.href}
              className="group border-border bg-card hover:border-primary/50 focus-visible:ring-ring flex flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-xs transition-all hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-foreground mt-2.5 text-xs font-semibold">
                {tile.label}
              </span>
              <span className="text-muted-foreground mt-0.5 text-[11px] tabular-nums">
                {tile.count} registro{tile.count === 1 ? "" : "s"}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Snapshot en 2 columnas */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna izquierda: Laboratorios recientes y última evolución SOAP */}
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Últimos resultados de laboratorio</CardTitle>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Accede directo al rango visual o a su curva de tendencia
                </p>
              </div>
              <Link
                href={`/portal/pacientes/${patient.id}/pruebas`}
                className="text-primary text-xs font-semibold hover:underline"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestLabs.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  No hay resultados registrados aún.
                </p>
              ) : (
                latestLabs.map((lab) => {
                  const evaluation = evaluateLabResult(lab);
                  return (
                    <div
                      key={lab.id}
                      className="border-border bg-background/50 flex flex-col gap-2.5 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/portal/pacientes/${patient.id}/pruebas/${lab.id}`}
                            className="text-foreground hover:text-primary text-sm font-bold"
                          >
                            {lab.testName}
                          </Link>
                          <Badge variant={evaluation.status}>
                            {evaluation.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                          Valor:{" "}
                          <strong className="text-foreground">
                            {lab.value} {lab.unit}
                          </strong>{" "}
                          · Ref: {lab.refMin}–{lab.refMax} {lab.unit} ·{" "}
                          {formatClinicalDate(lab.collectedAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/portal/pacientes/${patient.id}/pruebas/${lab.id}/tendencias`}
                        >
                          <Button variant="outline" size="sm">
                            <TrendingUp
                              className="text-primary h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                            Tendencia
                          </Button>
                        </Link>
                        <Link
                          href={`/portal/pacientes/${patient.id}/pruebas/${lab.id}`}
                        >
                          <Button variant="secondary" size="sm">
                            Resultado
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Última nota de evolución (SOAP)</CardTitle>
                {latestSoap && (
                  <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                    {formatClinicalDate(latestSoap.date)} · {latestSoap.author}
                  </p>
                )}
              </div>
              <Link
                href={`/portal/pacientes/${patient.id}/evolucion`}
                className="text-primary text-xs font-semibold hover:underline"
              >
                Ver historial SOAP
              </Link>
            </CardHeader>
            <CardContent>
              {!latestSoap ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  No hay evoluciones clínicas registradas todavía.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="text-primary font-semibold">
                    {latestSoap.reason}
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-foreground font-bold">Análisis (A)</p>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {latestSoap.analysis}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-foreground font-bold">Plan (P)</p>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {latestSoap.plan}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Diagnósticos CIE-10, Medicación activa y Vitales */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Diagnósticos activos (CIE-10)</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDxModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                Agregar
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {patient.diagnoses.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Sin diagnósticos registrados.
                </p>
              ) : (
                patient.diagnoses.map((dx) => (
                  <div
                    key={dx.id}
                    className="border-border bg-background/50 rounded-xl border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground text-xs font-semibold">
                        <span className="text-primary mr-1.5 font-mono">
                          {dx.code}
                        </span>
                        {dx.description}
                      </p>
                      <Badge
                        variant={
                          dx.status === "controlado" ? "normal" : "primary"
                        }
                      >
                        {dx.status}
                      </Badge>
                    </div>
                    {dx.notes && (
                      <p className="text-muted-foreground mt-1 text-[11px]">
                        {dx.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medicación crónica activa</CardTitle>
              <Link
                href={`/portal/pacientes/${patient.id}/medicamentos`}
                className="text-primary text-xs font-semibold hover:underline"
              >
                Gestionar
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {activeMeds.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Sin medicación crónica registrada.
                </p>
              ) : (
                activeMeds.map((med) => (
                  <div
                    key={med.id}
                    className="border-border bg-background/50 flex items-start justify-between gap-2 rounded-xl border p-3 text-xs"
                  >
                    <div>
                      <p className="text-foreground font-bold">
                        {med.name}{" "}
                        <span className="text-primary tabular-nums">
                          {med.dose}
                        </span>
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {med.frequency} · {med.indication}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos signos vitales</CardTitle>
              <Link
                href={`/portal/pacientes/${patient.id}/evolucion#vitales`}
                className="text-primary text-xs font-semibold hover:underline"
              >
                Registrar
              </Link>
            </CardHeader>
            <CardContent>
              {!latestVital ? (
                <p className="text-muted-foreground text-xs">
                  Sin signos vitales registrados.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground">Presión Arterial</p>
                      <p className="text-foreground mt-1 text-base font-bold tabular-nums">
                        {latestVital.systolicBp}/{latestVital.diastolicBp}{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          mmHg
                        </span>
                      </p>
                      {bpEval && (
                        <Badge variant={bpEval.status} className="mt-1.5">
                          {bpEval.label}
                        </Badge>
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground">Peso e IMC</p>
                      <p className="text-foreground mt-1 text-base font-bold tabular-nums">
                        {latestVital.weightKg} kg
                      </p>
                      {bmiEval && (
                        <p className="text-muted-foreground mt-1 text-[11px] font-semibold tabular-nums">
                          IMC {bmiEval.bmi} · {bmiEval.category}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground">Frec. Cardíaca</p>
                      <p className="text-foreground mt-1 text-sm font-bold tabular-nums">
                        {latestVital.heartRate} lpm
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground">Saturación SpO₂</p>
                      <p className="text-foreground mt-1 text-sm font-bold tabular-nums">
                        {latestVital.spo2}%
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[11px] tabular-nums">
                    Registrado el {formatClinicalDate(latestVital.recordedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewLabModal
        open={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        patient={patient}
      />

      <NewDiagnosticStudyModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        patient={patient}
      />

      <Modal
        open={dxModalOpen}
        onClose={() => setDxModalOpen(false)}
        title="Agregar diagnóstico (CIE-10)"
      >
        <form onSubmit={handleAddDiagnosis} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel htmlFor="dx-code">Código CIE-10</FieldLabel>
              <Input
                id="dx-code"
                className="font-mono uppercase"
                value={dxCode}
                onChange={(e) => setDxCode(e.target.value)}
                placeholder="Ej. E11.9"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="dx-status">Estado</FieldLabel>
              <Select
                id="dx-status"
                value={dxStatus}
                onChange={(e) =>
                  setDxStatus(e.target.value as "activo" | "controlado")
                }
              >
                <option value="activo">Activo</option>
                <option value="controlado">Controlado</option>
              </Select>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="dx-desc" required>
              Descripción clínica
            </FieldLabel>
            <Input
              id="dx-desc"
              value={dxDesc}
              onChange={(e) => setDxDesc(e.target.value)}
              placeholder="Ej. Neuropatía diabética periférica"
            />
          </div>
          <div className="border-border flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setDxModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar diagnóstico</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
