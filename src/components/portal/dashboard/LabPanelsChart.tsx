"use client";

import { FlaskConical } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import type { LabPanelSummary } from "@/lib/clinical/dashboard-metrics";

interface LabPanelsChartProps {
  panels: LabPanelSummary[];
}

export function LabPanelsChart({ panels }: LabPanelsChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2.5">
          <div className="bg-secondary text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <FlaskConical className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <CardTitle>Pruebas vigentes por panel clínico</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Proporción de resultados en rango, límite y críticos por área
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {panels.length === 0 ? (
          <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs">
            No hay exámenes vigentes registrados todavía.
          </div>
        ) : (
          <>
            <div className="space-y-3.5">
              {panels.map((panel) => {
                const normalWidth = (panel.normal / panel.total) * 100;
                const warningWidth = (panel.warning / panel.total) * 100;
                const criticalWidth = (panel.critical / panel.total) * 100;

                return (
                  <div key={panel.category} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">
                          {panel.category}
                        </span>
                        <span className="text-muted-foreground text-[11px] tabular-nums">
                          ({panel.total}{" "}
                          {panel.total === 1 ? "prueba" : "pruebas"})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] tabular-nums">
                        {panel.normal > 0 && (
                          <span className="text-clinical-normal font-semibold">
                            {panel.normal} normal
                          </span>
                        )}
                        {panel.warning > 0 && (
                          <span className="text-clinical-warning font-semibold">
                            {panel.warning} límite
                          </span>
                        )}
                        {panel.critical > 0 && (
                          <span className="text-clinical-critical font-semibold">
                            {panel.critical} crítico
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      role="img"
                      aria-label={`Panel ${panel.category}: ${panel.normal} normal, ${panel.warning} límite, ${panel.critical} crítico`}
                      className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full"
                    >
                      {panel.normal > 0 && (
                        <div
                          className="bg-clinical-normal h-full transition-all duration-300"
                          style={{ width: `${normalWidth}%` }}
                        />
                      )}
                      {panel.warning > 0 && (
                        <div
                          className="bg-clinical-warning h-full transition-all duration-300"
                          style={{ width: `${warningWidth}%` }}
                        />
                      )}
                      {panel.critical > 0 && (
                        <div
                          className="bg-clinical-critical h-full transition-all duration-300"
                          style={{ width: `${criticalWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-border text-muted-foreground flex flex-wrap items-center gap-4 border-t pt-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-clinical-normal inline-block h-2.5 w-2.5 rounded-xs" />
                Normal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-clinical-warning inline-block h-2.5 w-2.5 rounded-xs" />
                Límite / Atención
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-clinical-critical inline-block h-2.5 w-2.5 rounded-xs" />
                Crítico / Fuera de meta
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
