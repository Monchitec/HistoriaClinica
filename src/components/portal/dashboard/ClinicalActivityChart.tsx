"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import type {
  ClinicalKpiSummary,
  MonthlyActivityPoint,
} from "@/lib/clinical/dashboard-metrics";

interface ClinicalActivityChartProps {
  months: MonthlyActivityPoint[];
  kpis: ClinicalKpiSummary;
}

export function ClinicalActivityChart({
  months,
  kpis,
}: ClinicalActivityChartProps) {
  const defaultSelected = months[months.length - 1]?.monthKey ?? null;
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(
    defaultSelected,
  );

  const maxEvents = Math.max(
    1,
    ...months.map((m) => m.normalLabs + m.alteredLabs + m.soapNotes),
  );

  const activeMonth =
    months.find((m) => m.monthKey === selectedMonthKey) ??
    months[months.length - 1];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2.5">
          <div className="bg-secondary text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Activity className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <CardTitle>Actividad clínica y controles mensuales</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Exámenes en rango, alterados y evoluciones SOAP (últimos 6 meses)
            </p>
          </div>
        </div>

        {activeMonth && (
          <div className="border-border bg-muted/50 rounded-xl border px-3 py-1.5 text-right tabular-nums">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase">
              {activeMonth.label}
            </p>
            <p className="text-foreground text-xs font-bold">
              {activeMonth.totalEvents}{" "}
              {activeMonth.totalEvents === 1 ? "registro" : "registros"}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {months.every((m) => m.totalEvents === 0) ? (
          <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs">
            No hay registros de laboratorio o notas SOAP en los últimos 6 meses.
          </div>
        ) : (
          <>
            {/* Gráfica de barras apiladas mensuales */}
            <div
              role="img"
              aria-label="Gráfica de barras de actividad clínica en los últimos 6 meses"
              className="grid grid-cols-6 items-end gap-2 sm:gap-3"
            >
              {months.map((month) => {
                const total =
                  month.normalLabs + month.alteredLabs + month.soapNotes;
                const barHeightPct =
                  total > 0 ? Math.max((total / maxEvents) * 100, 12) : 4;
                const normalPct =
                  total > 0 ? (month.normalLabs / total) * 100 : 0;
                const alteredPct =
                  total > 0 ? (month.alteredLabs / total) * 100 : 0;
                const soapPct = total > 0 ? (month.soapNotes / total) * 100 : 0;
                const isSelected = activeMonth?.monthKey === month.monthKey;

                return (
                  <button
                    key={month.monthKey}
                    type="button"
                    aria-pressed={isSelected}
                    onMouseEnter={() => setSelectedMonthKey(month.monthKey)}
                    onClick={() => setSelectedMonthKey(month.monthKey)}
                    className={`focus-visible:ring-ring group flex cursor-pointer flex-col items-center rounded-xl p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                      isSelected ? "bg-secondary/50" : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-foreground mb-1.5 text-xs font-bold tabular-nums">
                      {total}
                    </span>

                    <div className="bg-muted/50 flex h-28 w-full max-w-10 items-end justify-center overflow-hidden rounded-lg p-0.5">
                      <div
                        className="flex w-full flex-col-reverse overflow-hidden rounded-md transition-all duration-300"
                        style={{ height: `${barHeightPct}%` }}
                      >
                        {total === 0 ? (
                          <div className="bg-border h-full w-full" />
                        ) : (
                          <>
                            {month.normalLabs > 0 && (
                              <div
                                className="bg-clinical-normal w-full"
                                style={{ height: `${normalPct}%` }}
                              />
                            )}
                            {month.alteredLabs > 0 && (
                              <div
                                className="bg-clinical-warning w-full"
                                style={{ height: `${alteredPct}%` }}
                              />
                            )}
                            {month.soapNotes > 0 && (
                              <div
                                className="bg-primary w-full"
                                style={{ height: `${soapPct}%` }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-muted-foreground mt-2 text-[11px] font-medium capitalize tabular-nums">
                      {month.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Leyenda y detalle del mes seleccionado */}
            <div className="border-border bg-muted/35 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs">
              <div className="text-muted-foreground flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-clinical-normal inline-block h-2.5 w-2.5 rounded-xs" />
                  <span>
                    En rango:{" "}
                    <strong className="text-foreground tabular-nums">
                      {activeMonth?.normalLabs ?? 0}
                    </strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-clinical-warning inline-block h-2.5 w-2.5 rounded-xs" />
                  <span>
                    Alterados:{" "}
                    <strong className="text-foreground tabular-nums">
                      {activeMonth?.alteredLabs ?? 0}
                    </strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-primary inline-block h-2.5 w-2.5 rounded-xs" />
                  <span>
                    Notas SOAP:{" "}
                    <strong className="text-foreground tabular-nums">
                      {activeMonth?.soapNotes ?? 0}
                    </strong>
                  </span>
                </span>
              </div>
            </div>
          </>
        )}

        {/* Sub-KPIs de calidad asistencial */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border-border bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[11px] font-medium">
              PA controlada en meta
            </p>
            <p className="text-foreground mt-1 text-lg font-bold tabular-nums">
              {kpis.controlledBpRatePct}%
            </p>
            <p className="text-muted-foreground text-[11px] tabular-nums">
              {kpis.controlledBpCount} de {kpis.patientsWithVitalsCount} con
              signos vitales
            </p>
          </div>

          <div className="border-border bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[11px] font-medium">
              Alergias registradas
            </p>
            <p className="text-clinical-critical mt-1 text-lg font-bold tabular-nums">
              {kpis.patientsWithAllergiesCount}
            </p>
            <p className="text-muted-foreground text-[11px] tabular-nums">
              De {kpis.totalPatients} pacientes activos
            </p>
          </div>

          <div className="border-border bg-background/60 rounded-xl border p-3">
            <p className="text-muted-foreground text-[11px] font-medium">
              Fármacos vigentes
            </p>
            <p className="text-primary mt-1 text-lg font-bold tabular-nums">
              {kpis.activeMedicationsCount}
            </p>
            <p className="text-muted-foreground text-[11px]">
              Prescripciones crónicas activas
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
