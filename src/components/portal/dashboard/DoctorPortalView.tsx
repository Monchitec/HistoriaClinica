"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { ClinicalActivityChart } from "@/components/portal/dashboard/ClinicalActivityChart";
import { DiagnosisPrevalenceCard } from "@/components/portal/dashboard/DiagnosisPrevalenceCard";
import { LabPanelsChart } from "@/components/portal/dashboard/LabPanelsChart";
import { PatientDonutChart } from "@/components/portal/dashboard/PatientDonutChart";
import { NewPatientModal } from "@/components/portal/pacientes/NewPatientModal";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Avatar } from "@/components/shared/ui/Avatar";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import { Input } from "@/components/shared/ui/Input";
import { calculateAge } from "@/lib/clinical/calculators";
import {
  buildClinicalAlerts,
  buildClinicalKpiSummary,
  buildDiagnosisPrevalence,
  buildDonutBreakdown,
  buildLabPanelBreakdown,
  buildMonthlyClinicalActivity,
  getLatestLabsPerPatientTest,
  getLatestVitalPerPatient,
  type DonutBreakdown,
  type DonutMetricMode,
} from "@/lib/clinical/dashboard-metrics";
import { formatClinicalDate } from "@/lib/format/es-pe";

type AlertSeverityFilter = "all" | "critical" | "warning";

export function DoctorPortalView() {
  const { db, session } = useHce();
  const { labResults, patients, soapNotes, vitals } = db;
  const [searchQuery, setSearchQuery] = useState("");
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState<AlertSeverityFilter>("all");
  const [alertsExpanded, setAlertsExpanded] = useState(true);

  const latestLabs = useMemo(
    () => getLatestLabsPerPatientTest(labResults),
    [labResults],
  );

  const latestVitals = useMemo(
    () => getLatestVitalPerPatient(vitals),
    [vitals],
  );

  const latestClinicalAlerts = useMemo(
    () => buildClinicalAlerts(patients, latestLabs),
    [patients, latestLabs],
  );

  const kpis = useMemo(
    () =>
      buildClinicalKpiSummary(
        db,
        latestLabs,
        latestVitals,
        latestClinicalAlerts,
      ),
    [db, latestLabs, latestVitals, latestClinicalAlerts],
  );

  const donutBreakdowns = useMemo<Record<DonutMetricMode, DonutBreakdown>>(
    () => ({
      estado: buildDonutBreakdown("estado", db, latestLabs, latestVitals),
      laboratorio: buildDonutBreakdown(
        "laboratorio",
        db,
        latestLabs,
        latestVitals,
      ),
      presion: buildDonutBreakdown("presion", db, latestLabs, latestVitals),
      cobertura: buildDonutBreakdown("cobertura", db, latestLabs, latestVitals),
    }),
    [db, latestLabs, latestVitals],
  );

  const labPanels = useMemo(
    () => buildLabPanelBreakdown(latestLabs),
    [latestLabs],
  );

  const monthlyActivity = useMemo(
    () => buildMonthlyClinicalActivity(labResults, soapNotes),
    [labResults, soapNotes],
  );

  const diagnosisPrevalence = useMemo(
    () => buildDiagnosisPrevalence(patients),
    [patients],
  );

  const quickSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        p.hcNumber.toLowerCase().includes(q) ||
        p.diagnoses.some((d) =>
          `${d.code} ${d.description}`.toLowerCase().includes(q),
        ),
    );
  }, [patients, searchQuery]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === "all") return latestClinicalAlerts;
    return latestClinicalAlerts.filter(
      (item) => item.evaluation.status === alertFilter,
    );
  }, [latestClinicalAlerts, alertFilter]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Cabecera ejecutiva + Buscador inmediato */}
      <section className="border-border bg-card rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={session?.photoUrl}
              name={session?.name ?? "Doctor"}
              size="xl"
              rounded="full"
            />
            <div>
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                {session?.hospital ?? "Servicio de Medicina Interna"}
              </p>
              <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Bienvenido, {session?.name ?? "Doctor"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Dashboard ejecutivo de Medicina Interna: estratificación de
                cohorte, efectividad analítica y actividad asistencial.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/portal/pacientes">
              <Button variant="outline" size="lg">
                <Users className="h-4 w-4" strokeWidth={1.75} />
                Directorio
              </Button>
            </Link>
            <Button size="lg" onClick={() => setNewPatientOpen(true)}>
              <UserPlus className="h-4 w-4" strokeWidth={1.75} />
              Nuevo paciente
            </Button>
          </div>
        </div>

        <div className="relative mt-5">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar paciente por Nombre, DNI, N° Historia Clínica o diagnóstico..."
            aria-label="Buscar paciente en portal médico"
            className="h-12 pr-10 pl-11 text-sm"
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {hasSearch && (
          <div className="border-border bg-background/70 mt-3 rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-semibold tabular-nums">
                Coincidencias rápidas ({quickSearchResults.length})
              </p>
              <Link
                href="/portal/pacientes"
                className="text-primary text-xs font-semibold hover:underline"
              >
                Abrir directorio completo
              </Link>
            </div>

            {quickSearchResults.length === 0 ? (
              <p className="text-muted-foreground py-2 text-xs">
                Sin coincidencias para &ldquo;{searchQuery.trim()}&rdquo;.
                Prueba con otro nombre, DNI o código CIE-10.
              </p>
            ) : (
              <div className="divide-border divide-y">
                {quickSearchResults.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-1 last:pb-1"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        src={patient.photoUrl}
                        name={patient.fullName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/portal/pacientes/${patient.id}`}
                          className="text-foreground hover:text-primary text-sm font-semibold"
                        >
                          {patient.fullName}
                        </Link>
                        <p className="text-muted-foreground text-xs tabular-nums">
                          {calculateAge(patient.birthDate)} años · DNI{" "}
                          {patient.dni} ·{" "}
                          <span className="font-mono">{patient.hcNumber}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{patient.insurance}</Badge>
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
                          Ver resumen
                          <ArrowRight
                            className="h-3.5 w-3.5"
                            strokeWidth={1.75}
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Fila 1: 4 Tarjetas KPI Ejecutivas con micro-indicadores */}
      <section
        aria-label="Indicadores clave del servicio"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium">
                  Pacientes en seguimiento
                </p>
                <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">
                  {kpis.totalPatients}
                </p>
              </div>
              <div className="bg-secondary text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Users className="h-5 w-5" strokeWidth={1.75} />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground tabular-nums">
                {kpis.stablePatientsCount} estables ·{" "}
                {kpis.warningPatientsCount} límite ·{" "}
                {kpis.criticalPatientsCount} prioridad
              </span>
              <Link
                href="/portal/pacientes"
                className="text-primary font-semibold hover:underline"
              >
                Directorio
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium">
                  Efectividad analítica (en rango)
                </p>
                <p className="text-clinical-normal mt-1 text-2xl font-bold tabular-nums">
                  {kpis.labControlRatePct}%
                </p>
              </div>
              <div className="bg-clinical-normal-soft text-clinical-normal flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <HeartPulse className="h-5 w-5" strokeWidth={1.75} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-clinical-normal h-full rounded-full"
                  style={{ width: `${kpis.labControlRatePct}%` }}
                />
              </div>
              <p className="text-muted-foreground text-[11px] tabular-nums">
                {kpis.latestLabsNormalCount} de {kpis.latestLabsTotal} pruebas
                vigentes normales
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium">
                  Hallazgos vigentes en vigilancia
                </p>
                <p
                  className={`mt-1 text-2xl font-bold tabular-nums ${
                    kpis.criticalAlertsCount > 0
                      ? "text-clinical-critical"
                      : "text-clinical-warning"
                  }`}
                >
                  {kpis.activeAlertsCount}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  kpis.criticalAlertsCount > 0
                    ? "bg-clinical-critical-soft text-clinical-critical"
                    : "bg-clinical-warning-soft text-clinical-warning"
                }`}
              >
                <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] tabular-nums">
              <span className="text-clinical-critical font-semibold">
                {kpis.criticalAlertsCount} críticos
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-clinical-warning font-semibold">
                {kpis.warningAlertsCount} en límite
              </span>
              <a
                href="#monitor-hallazgos"
                className="text-primary font-semibold hover:underline"
              >
                Ver tabla
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium">
                  Registros clínicos y estudios
                </p>
                <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">
                  {kpis.totalClinicalRecords}
                </p>
              </div>
              <div className="bg-secondary text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <ClipboardCheck className="h-5 w-5" strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-muted-foreground text-[11px] tabular-nums">
              {kpis.totalSoapNotesCount} SOAP · {kpis.totalLabsCount} labs ·{" "}
              {kpis.totalDiagnosticStudiesCount} imágenes ·{" "}
              {kpis.activeMedicationsCount} fármacos
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Fila 2: Matriz Ejecutiva Principal 2x2 (Gráficas simétricas sin ruido visual) */}
      <section
        aria-label="Analítica clínica ejecutiva"
        className="grid gap-6 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <PatientDonutChart breakdowns={donutBreakdowns} />
        </div>
        <div className="lg:col-span-6">
          <ClinicalActivityChart months={monthlyActivity} kpis={kpis} />
        </div>
        <div className="lg:col-span-6">
          <LabPanelsChart panels={labPanels} />
        </div>
        <div className="lg:col-span-6">
          <DiagnosisPrevalenceCard
            diagnoses={diagnosisPrevalence}
            kpis={kpis}
          />
        </div>
      </section>

      {/* Fila 3: Tabla ejecutiva compacta y colapsable de hallazgos fuera de rango */}
      <section
        id="monitor-hallazgos"
        aria-label="Monitor de vigilancia clínica"
      >
        <Card>
          <CardHeader className="gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-clinical-warning-soft text-clinical-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <CardTitle>
                  Monitor de vigilancia analítica ({latestClinicalAlerts.length}
                  )
                </CardTitle>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Vista tabular compacta de resultados vigentes fuera de rango
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {alertsExpanded && latestClinicalAlerts.length > 0 && (
                <div
                  role="group"
                  aria-label="Filtrar hallazgos por severidad"
                  className="bg-muted inline-flex gap-1 rounded-xl p-1"
                >
                  {(
                    [
                      {
                        id: "all",
                        label: `Todos (${latestClinicalAlerts.length})`,
                      },
                      {
                        id: "critical",
                        label: `Prioritarios (${kpis.criticalAlertsCount})`,
                      },
                      {
                        id: "warning",
                        label: `En límite (${kpis.warningAlertsCount})`,
                      },
                    ] as const
                  ).map((item) => {
                    const isActive = alertFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setAlertFilter(item.id)}
                        className={`focus-visible:ring-ring cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                          isActive
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertsExpanded((prev) => !prev)}
              >
                {alertsExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Ocultar tabla
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Mostrar tabla
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {alertsExpanded && (
            <CardContent className="p-0">
              {filteredAlerts.length === 0 ? (
                <p className="text-muted-foreground p-6 text-center text-xs">
                  No hay hallazgos vigentes fuera del rango seleccionado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-border bg-muted/50 text-muted-foreground border-b">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Paciente</th>
                        <th className="px-4 py-3 font-semibold">
                          Prueba de laboratorio
                        </th>
                        <th className="px-4 py-3 font-semibold">Resultado</th>
                        <th className="px-4 py-3 font-semibold">Referencia</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold">Fecha</th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {filteredAlerts.map(({ lab, patient, evaluation }) => (
                        <tr
                          key={lab.id}
                          className="hover:bg-muted/35 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={patient.photoUrl}
                                name={patient.fullName}
                                size="sm"
                              />
                              <div>
                                <Link
                                  href={`/portal/pacientes/${patient.id}`}
                                  className="text-foreground hover:text-primary font-semibold"
                                >
                                  {patient.fullName}
                                </Link>
                                <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
                                  {patient.hcNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-foreground px-4 py-3 font-medium">
                            {lab.testName}
                          </td>
                          <td className="text-foreground px-4 py-3 font-bold tabular-nums">
                            {lab.value} {lab.unit}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 tabular-nums">
                            {lab.refMin}–{lab.refMax} {lab.unit}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={evaluation.status}>
                              {evaluation.label}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground px-4 py-3 tabular-nums">
                            {formatClinicalDate(lab.collectedAt)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="inline-flex items-center gap-3">
                              <Link
                                href={`/portal/pacientes/${lab.patientId}/pruebas/${lab.id}`}
                                className="text-primary font-semibold hover:underline"
                              >
                                Detalle
                              </Link>
                              <Link
                                href={`/portal/pacientes/${lab.patientId}/pruebas/${lab.id}/tendencias`}
                                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-medium"
                              >
                                <TrendingUp
                                  className="h-3.5 w-3.5"
                                  strokeWidth={1.75}
                                />
                                Tendencia
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </section>

      <NewPatientModal
        open={newPatientOpen}
        onClose={() => setNewPatientOpen(false)}
      />
    </div>
  );
}
