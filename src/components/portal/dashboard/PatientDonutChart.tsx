"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, PieChart } from "lucide-react";
import { Badge } from "@/components/shared/ui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import type {
  DonutBreakdown,
  DonutMetricMode,
} from "@/lib/clinical/dashboard-metrics";

interface PatientDonutChartProps {
  breakdowns: Record<DonutMetricMode, DonutBreakdown>;
}

const MODE_OPTIONS: Array<{ id: DonutMetricMode; label: string }> = [
  { id: "estado", label: "Pacientes" },
  { id: "laboratorio", label: "Analítica Lab" },
  { id: "presion", label: "Presión arterial" },
  { id: "cobertura", label: "Cobertura" },
];

export function PatientDonutChart({ breakdowns }: PatientDonutChartProps) {
  const [mode, setMode] = useState<DonutMetricMode>("estado");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null,
  );

  const activeBreakdown = breakdowns[mode];

  const nonZeroSegments = useMemo(
    () => activeBreakdown.segments.filter((s) => s.count > 0),
    [activeBreakdown],
  );

  const activeSegment = useMemo(() => {
    if (selectedSegmentId) {
      const found = activeBreakdown.segments.find(
        (s) => s.id === selectedSegmentId,
      );
      if (found) return found;
    }
    return null;
  }, [activeBreakdown, selectedSegmentId]);

  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const totalCount = nonZeroSegments.reduce((acc, s) => acc + s.count, 0);

  const arcSlices = useMemo(() => {
    if (totalCount <= 0) return [];
    const gapPx = nonZeroSegments.length > 1 ? 4 : 0;

    return nonZeroSegments.reduce<
      Array<{
        segment: (typeof nonZeroSegments)[number];
        dashArray: string;
        dashOffset: number;
      }>
    >((acc, segment, index) => {
      const prevOffset =
        index === 0
          ? 0
          : acc[index - 1].dashOffset * -1 +
            (acc[index - 1].segment.count / totalCount) * circumference;

      const rawArc = (segment.count / totalCount) * circumference;
      const visibleArc = Math.max(rawArc - gapPx, 2);

      acc.push({
        segment,
        dashArray: `${visibleArc} ${circumference - visibleArc}`,
        dashOffset: -prevOffset,
      });

      return acc;
    }, []);
  }, [nonZeroSegments, totalCount, circumference]);

  function handleModeChange(nextMode: DonutMetricMode) {
    setMode(nextMode);
    setSelectedSegmentId(null);
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-start gap-2.5">
          <div className="bg-secondary text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <PieChart className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <CardTitle>{activeBreakdown.title}</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {activeBreakdown.subtitle}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Indicador de gráfica de torta"
          className="bg-muted inline-flex flex-wrap gap-1 rounded-xl p-1"
        >
          {MODE_OPTIONS.map((opt) => {
            const isActive = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleModeChange(opt.id)}
                className={`focus-visible:ring-ring cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  isActive
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {totalCount === 0 ? (
          <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-8 text-center text-xs">
            Aún no hay pacientes registrados para graficar este indicador.
          </div>
        ) : (
          <>
            <div className="grid items-center gap-6 sm:grid-cols-12">
              {/* Donut SVG interactivo */}
              <div className="flex justify-center sm:col-span-5">
                <div className="relative h-52 w-52">
                  <svg
                    viewBox="0 0 220 220"
                    role="img"
                    aria-label={`${activeBreakdown.title}: ${activeBreakdown.centerValue} ${activeBreakdown.centerLabel}`}
                    className="h-full w-full"
                  >
                    <circle
                      cx="110"
                      cy="110"
                      r={radius}
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="22"
                    />
                    <g transform="rotate(-90 110 110)">
                      {arcSlices.map(({ segment, dashArray, dashOffset }) => {
                        const isSelected = activeSegment?.id === segment.id;
                        const isDimmed = activeSegment !== null && !isSelected;

                        return (
                          <circle
                            key={segment.id}
                            cx="110"
                            cy="110"
                            r={radius}
                            fill="none"
                            stroke={segment.colorVar}
                            strokeWidth={isSelected ? 27 : 22}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            opacity={isDimmed ? 0.35 : 1}
                            className="cursor-pointer transition-all duration-200"
                            onClick={() =>
                              setSelectedSegmentId((prev) =>
                                prev === segment.id ? null : segment.id,
                              )
                            }
                          />
                        );
                      })}
                    </g>
                  </svg>

                  {/* Indicador central */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <span className="text-foreground text-3xl font-bold tracking-tight tabular-nums">
                      {activeSegment
                        ? `${activeSegment.percentage}%`
                        : activeBreakdown.centerValue}
                    </span>
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px] font-semibold">
                      {activeSegment
                        ? activeSegment.label
                        : activeBreakdown.centerLabel}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-[11px] tabular-nums">
                      {activeSegment
                        ? `${activeSegment.count} de ${activeBreakdown.totalUnits}`
                        : `${activeBreakdown.totalUnits} ${activeBreakdown.unitLabel}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leyenda interactiva */}
              <div className="space-y-2.5 sm:col-span-7">
                {activeBreakdown.segments.map((segment) => {
                  const isSelected = activeSegment?.id === segment.id;
                  return (
                    <button
                      key={segment.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelectedSegmentId((prev) =>
                          prev === segment.id ? null : segment.id,
                        )
                      }
                      className={`focus-visible:ring-ring w-full cursor-pointer rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                        isSelected
                          ? "border-primary bg-secondary/45"
                          : "border-border bg-background/50 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: segment.colorVar }}
                            aria-hidden="true"
                          />
                          <span className="text-foreground truncate text-xs font-semibold">
                            {segment.label}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 tabular-nums">
                          <span className="text-foreground text-xs font-bold">
                            {segment.count}
                          </span>
                          <Badge variant={segment.badgeVariant}>
                            {segment.percentage}%
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${segment.percentage}%`,
                            backgroundColor: segment.colorVar,
                          }}
                        />
                      </div>

                      <p className="text-muted-foreground mt-1.5 text-[11px]">
                        {segment.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desglose rápido de pacientes del segmento seleccionado */}
            <div className="border-border bg-muted/40 rounded-xl border px-3.5 py-2.5">
              {activeSegment ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground text-xs font-semibold">
                      {activeSegment.label}:
                    </span>
                    {activeSegment.patients.length === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        Sin pacientes en este grupo.
                      </span>
                    ) : (
                      activeSegment.patients.map((patient) => (
                        <Link
                          key={patient.id}
                          href={`/portal/pacientes/${patient.id}`}
                          className="border-border bg-card text-foreground hover:border-primary hover:text-primary focus-visible:ring-ring inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <span>{patient.fullName}</span>
                          <ArrowUpRight
                            className="h-3 w-3 shrink-0"
                            strokeWidth={1.75}
                          />
                        </Link>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSegmentId(null)}
                    className="text-primary cursor-pointer text-[11px] font-semibold hover:underline"
                  >
                    Ver todos
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Haz clic en cualquier segmento de la gráfica o leyenda para
                  inspeccionar los pacientes del grupo.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
