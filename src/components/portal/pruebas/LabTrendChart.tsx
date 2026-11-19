"use client";

import { useState } from "react";
import { Badge } from "@/components/shared/ui/Badge";
import { evaluateLabResult } from "@/lib/clinical/lab-evaluation";
import {
  formatClinicalDate,
  formatNumericValue,
  formatShortAxisDate,
} from "@/lib/format/es-pe";
import type { LabResult } from "@/types/clinical";

interface LabTrendChartProps {
  results: LabResult[];
  refMin: number;
  refMax: number;
  unit: string;
}

export function LabTrendChart({
  results,
  refMin,
  refMax,
  unit,
}: LabTrendChartProps) {
  const ordered = [...results].sort(
    (a, b) =>
      new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime(),
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    ordered[ordered.length - 1]?.id ?? null,
  );

  if (ordered.length === 0) {
    return (
      <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        No hay mediciones dentro del rango de fechas seleccionado.
      </div>
    );
  }

  const activePoint =
    ordered.find((item) => item.id === selectedId) ??
    ordered[ordered.length - 1];

  const allValues = [...ordered.map((r) => r.value), refMin, refMax];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const rawSpan = Math.max(rawMax - rawMin, 0.5);
  const yMin = Math.max(0, rawMin - rawSpan * 0.25);
  const yMax = rawMax + rawSpan * 0.25;
  const ySpan = Math.max(yMax - yMin, 0.1);

  const width = 760;
  const height = 290;
  const padLeft = 56;
  const padRight = 32;
  const padTop = 24;
  const padBottom = 56;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xForIndex = (idx: number) => {
    if (ordered.length === 1) return padLeft + plotW / 2;
    return padLeft + (idx / (ordered.length - 1)) * plotW;
  };

  const yForValue = (val: number) => {
    const ratio = (val - yMin) / ySpan;
    return padTop + plotH - ratio * plotH;
  };

  const bandTop = yForValue(refMax);
  const bandBottom = yForValue(refMin);
  const bandHeight = Math.max(bandBottom - bandTop, 2);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const val = yMin + t * ySpan;
    return {
      val,
      label: formatNumericValue(val, ySpan < 5 ? 1 : 0),
      y: yForValue(val),
    };
  });

  const polylinePoints = ordered
    .map((item, idx) => `${xForIndex(idx)},${yForValue(item.value)}`)
    .join(" ");

  const activeEval = evaluateLabResult(activePoint);

  return (
    <div className="space-y-5">
      {/* Detalle del punto seleccionado / inspeccionado */}
      <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-foreground text-xs font-medium">
            Control seleccionado:
          </span>
          <span className="text-foreground text-base font-bold tabular-nums">
            {activePoint.value} {unit}
          </span>
          <Badge variant={activeEval.status}>{activeEval.label}</Badge>
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatClinicalDate(activePoint.collectedAt)}
          </span>
        </div>
        <span className="text-muted-foreground text-xs">
          {activePoint.laboratory}
        </span>
      </div>

      {/* Gráfica SVG longitudinal con banda verde de referencia normal */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Gráfica de tendencia de resultados de laboratorio"
          className="h-auto w-full min-w-[540px] select-none"
        >
          {/* Rejilla horizontal y etiquetas eje Y */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                stroke="var(--border)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="var(--muted-foreground)"
                fontSize="11"
                className="tabular-nums"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Banda verde de rango normal (estilo Kaiser Permanente) */}
          <rect
            x={padLeft}
            y={bandTop}
            width={plotW}
            height={bandHeight}
            fill="var(--clinical-normal-soft)"
            opacity="0.7"
          />
          <line
            x1={padLeft}
            y1={bandTop}
            x2={width - padRight}
            y2={bandTop}
            stroke="var(--clinical-normal)"
            strokeWidth="1.25"
            opacity="0.7"
          />
          <line
            x1={padLeft}
            y1={bandBottom}
            x2={width - padRight}
            y2={bandBottom}
            stroke="var(--clinical-normal)"
            strokeWidth="1.25"
            opacity="0.7"
          />

          {/* Ejes principales */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotH}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            opacity="0.6"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={width - padRight}
            y2={padTop + plotH}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Línea de tendencia */}
          {ordered.length > 1 && (
            <polyline
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          )}

          {/* Puntos interactivos y fechas en eje X */}
          {ordered.map((item, idx) => {
            const cx = xForIndex(idx);
            const cy = yForValue(item.value);
            const evalItem = evaluateLabResult(item);
            const strokeColor =
              evalItem.status === "normal"
                ? "var(--clinical-normal)"
                : evalItem.status === "warning"
                  ? "var(--clinical-warning)"
                  : "var(--clinical-critical)";
            const isSelected = item.id === activePoint.id;
            const dateLabel = formatShortAxisDate(item.collectedAt);

            return (
              <g key={item.id}>
                {/* Etiqueta fecha eje X */}
                <line
                  x1={cx}
                  y1={padTop + plotH}
                  x2={cx}
                  y2={padTop + plotH + 5}
                  stroke="var(--muted-foreground)"
                  strokeWidth="1"
                />
                <text
                  x={cx}
                  y={padTop + plotH + 20}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize="11"
                >
                  {dateLabel.dayMonth}
                </text>
                <text
                  x={cx}
                  y={padTop + plotH + 34}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize="11"
                  className="tabular-nums"
                >
                  {dateLabel.year}
                </text>

                {/* Círculo del punto */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 7.5 : 5.5}
                  fill="var(--card)"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 4 : 3.2}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setSelectedId(item.id)}
                  onClick={() => setSelectedId(item.id)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="border-clinical-normal bg-clinical-normal-soft inline-block h-3 w-4 rounded-xs border" />
          Banda de rango normal ({refMin} – {refMax} {unit})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="border-clinical-normal bg-card inline-block h-2.5 w-2.5 rounded-full border-2" />
          En rango
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="border-clinical-warning bg-card inline-block h-2.5 w-2.5 rounded-full border-2" />
          Límite / Atención
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="border-clinical-critical bg-card inline-block h-2.5 w-2.5 rounded-full border-2" />
          Crítico / Fuera de meta
        </span>
      </div>

      {/* Tabla cronológica accesible */}
      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-xs">
          <thead className="border-border bg-muted/60 text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Fecha</th>
              <th className="px-4 py-2.5 font-semibold">Resultado</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              <th className="px-4 py-2.5 font-semibold">Variación</th>
              <th className="px-4 py-2.5 font-semibold">Laboratorio</th>
            </tr>
          </thead>
          <tbody className="divide-border bg-card divide-y">
            {[...ordered].reverse().map((row, idx, descRows) => {
              const prevRow = descRows[idx + 1];
              const diff = prevRow
                ? Number((row.value - prevRow.value).toFixed(2))
                : null;
              const evalRow = evaluateLabResult(row);

              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  className={`hover:bg-muted/40 cursor-pointer transition-colors ${
                    row.id === activePoint.id ? "bg-secondary/50" : ""
                  }`}
                >
                  <td className="text-foreground px-4 py-2.5 tabular-nums">
                    {formatClinicalDate(row.collectedAt)}
                  </td>
                  <td className="text-foreground px-4 py-2.5 font-bold tabular-nums">
                    {row.value} {unit}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={evalRow.status}>{evalRow.label}</Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 tabular-nums">
                    {diff === null
                      ? "Basal"
                      : `${diff > 0 ? "+" : ""}${diff} ${unit}`}
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5">
                    {row.laboratory}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
