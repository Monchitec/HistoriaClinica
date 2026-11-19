"use client";

import { Stethoscope } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import type {
  ClinicalKpiSummary,
  DiagnosisPrevalenceItem,
} from "@/lib/clinical/dashboard-metrics";

interface DiagnosisPrevalenceCardProps {
  diagnoses: DiagnosisPrevalenceItem[];
  kpis: ClinicalKpiSummary;
}

export function DiagnosisPrevalenceCard({
  diagnoses,
  kpis,
}: DiagnosisPrevalenceCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader>
          <div className="flex items-start gap-2.5">
            <div className="bg-secondary text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Stethoscope className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <CardTitle>Morbilidad prevalente (CIE-10) y cohorte</CardTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Condiciones crónicas activas y distribución demográfica del
                servicio
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3.5 p-5">
          {diagnoses.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">
              Sin diagnósticos activos registrados.
            </p>
          ) : (
            diagnoses.map((dx) => (
              <div key={dx.code} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="bg-secondary text-primary shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold">
                      {dx.code}
                    </span>
                    <span className="text-foreground truncate font-medium">
                      {dx.description}
                    </span>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-[11px] font-semibold tabular-nums">
                    {dx.patientCount} pac. ({dx.percentage}%)
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${dx.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </div>

      {/* Resumen demográfico de la cohorte */}
      <div className="border-border grid grid-cols-3 gap-2.5 border-t px-5 py-3.5 text-xs">
        <div className="bg-muted/40 rounded-xl px-3 py-2">
          <p className="text-muted-foreground text-[11px]">Edad promedio</p>
          <p className="text-foreground mt-0.5 font-bold tabular-nums">
            {kpis.averageAge} años
          </p>
        </div>
        <div className="bg-muted/40 rounded-xl px-3 py-2">
          <p className="text-muted-foreground text-[11px]">Distribución sexo</p>
          <p className="text-foreground mt-0.5 font-bold tabular-nums">
            {kpis.femaleCount} M · {kpis.maleCount} H
          </p>
        </div>
        <div className="bg-muted/40 rounded-xl px-3 py-2">
          <p className="text-muted-foreground text-[11px]">Estudios imagen</p>
          <p className="text-primary mt-0.5 font-bold tabular-nums">
            {kpis.totalDiagnosticStudiesCount} placas
          </p>
        </div>
      </div>
    </Card>
  );
}
