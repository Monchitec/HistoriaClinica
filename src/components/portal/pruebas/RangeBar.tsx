import { evaluateLabValue } from "@/lib/clinical/lab-evaluation";
import type { LabTestDefinition } from "@/types/clinical";

interface RangeBarProps {
  value: number;
  refMin: number;
  refMax: number;
  unit: string;
  definition?: LabTestDefinition;
}

export function RangeBar({
  value,
  refMin,
  refMax,
  unit,
  definition,
}: RangeBarProps) {
  const evaluation = evaluateLabValue(value, refMin, refMax, definition);

  const span = Math.max(refMax - refMin, 1);
  const scaleMin =
    definition?.scaleMin ??
    (refMin === 0 ? 0 : Math.max(0, Number((refMin - span * 0.6).toFixed(2))));
  const scaleMax =
    definition?.scaleMax ?? Number((refMax + span * 0.8).toFixed(2));
  const totalScale = Math.max(scaleMax - scaleMin, 0.01);

  const toPercent = (num: number) =>
    Math.min(97, Math.max(3, ((num - scaleMin) / totalScale) * 100));

  const normalStartPct = refMin <= scaleMin ? 0 : toPercent(refMin);
  const normalEndPct = refMax >= scaleMax ? 100 : toPercent(refMax);
  const valuePct = toPercent(value);

  const pillClasses =
    evaluation.status === "normal"
      ? "bg-clinical-normal text-primary-foreground"
      : evaluation.status === "warning"
        ? "bg-clinical-warning text-primary-foreground"
        : "bg-clinical-critical text-primary-foreground";

  return (
    <div className="space-y-3 py-3">
      <div className="relative pt-10 pb-2">
        {/* Marcador flotante con valor */}
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${valuePct}%` }}
        >
          <span
            className={`rounded-full px-3 py-0.5 text-sm font-bold tabular-nums shadow-xs ${pillClasses}`}
          >
            {value}
          </span>
          <span
            aria-hidden="true"
            className="border-t-foreground mt-1 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent"
          />
        </div>

        {/* Barra proporcional de rangos */}
        <div className="bg-muted relative flex h-2.5 w-full overflow-hidden rounded-full">
          {normalStartPct > 0 && (
            <div
              className="bg-clinical-warning/75 h-full"
              style={{ width: `${normalStartPct}%` }}
            />
          )}
          <div
            className="bg-clinical-normal h-full"
            style={{ width: `${Math.max(normalEndPct - normalStartPct, 4)}%` }}
          />
          {normalEndPct < 100 && (
            <div
              className="bg-clinical-warning/80 h-full"
              style={{ width: `${100 - normalEndPct}%` }}
            />
          )}
        </div>

        {/* Etiquetas de límites normales */}
        <div className="text-muted-foreground relative mt-2 h-5 text-xs font-medium tabular-nums">
          {refMin > scaleMin && (
            <span
              className="absolute -translate-x-1/2"
              style={{ left: `${normalStartPct}%` }}
            >
              {refMin}
            </span>
          )}
          {refMax < scaleMax && (
            <span
              className="absolute -translate-x-1/2"
              style={{ left: `${normalEndPct}%` }}
            >
              {refMax}
            </span>
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="tabular-nums">
          Rango normal de referencia: {refMin} – {refMax} {unit}
        </span>
        <span className="text-foreground font-semibold">
          {evaluation.summary}
        </span>
      </div>
    </div>
  );
}
