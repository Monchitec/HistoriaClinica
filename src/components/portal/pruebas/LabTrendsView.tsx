"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, TrendingUp } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Button } from "@/components/shared/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { FieldLabel, Input } from "@/components/shared/ui/Input";
import { getLabDefinition } from "@/data/lab-catalog";
import { LabTrendChart } from "./LabTrendChart";
import { NewLabModal } from "./NewLabModal";

type PeriodFilter = "recent" | "all" | "month" | "year" | "custom";

const PERIOD_OPTIONS: Array<{ id: PeriodFilter; label: string }> = [
  { id: "recent", label: "Más reciente" },
  { id: "all", label: "Todos los datos" },
  { id: "month", label: "Mes" },
  { id: "year", label: "Año" },
  { id: "custom", label: "Personalizado" },
];

export function LabTrendsView() {
  const params = useParams<{ id: string; pruebaId: string }>();
  const { db } = useHce();

  const [period, setPeriod] = useState<PeriodFilter>("recent");
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2026-12-31");
  const [modalOpen, setModalOpen] = useState(false);

  const patient = db.patients.find((p) => p.id === params.id);
  const targetResult = db.labResults.find(
    (r) => r.id === params.pruebaId && r.patientId === params.id,
  );

  const filteredSeries = useMemo(() => {
    if (!targetResult) return [];

    const allSeries = db.labResults
      .filter(
        (r) =>
          r.patientId === params.id && r.testCode === targetResult.testCode,
      )
      .sort(
        (a, b) =>
          new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime(),
      );

    if (allSeries.length === 0) return [];
    const latestTs = new Date(
      allSeries[allSeries.length - 1].collectedAt,
    ).getTime();

    if (period === "recent") {
      return allSeries.slice(-10);
    }
    if (period === "month") {
      const cutoff = latestTs - 35 * 24 * 60 * 60 * 1000;
      return allSeries.filter(
        (r) => new Date(r.collectedAt).getTime() >= cutoff,
      );
    }
    if (period === "year") {
      const cutoff = latestTs - 366 * 24 * 60 * 60 * 1000;
      return allSeries.filter(
        (r) => new Date(r.collectedAt).getTime() >= cutoff,
      );
    }
    if (period === "custom") {
      const startTs = new Date(`${fromDate}T00:00:00`).getTime();
      const endTs = new Date(`${toDate}T23:59:59`).getTime();
      return allSeries.filter((r) => {
        const ts = new Date(r.collectedAt).getTime();
        return ts >= startTs && ts <= endTs;
      });
    }
    return allSeries;
  }, [db.labResults, params.id, targetResult, period, fromDate, toDate]);

  if (!patient || !targetResult) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Tendencia no disponible"
        description="No se encontró el parámetro solicitado para graficar."
        action={
          <Link href={`/portal/pacientes/${params.id}/pruebas`}>
            <Button variant="outline">Volver a pruebas</Button>
          </Link>
        }
      />
    );
  }

  const definition = getLabDefinition(targetResult.testCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/portal/pacientes/${patient.id}/pruebas/${targetResult.id}`}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Detalles de resultados del examen
        </Link>

        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Registrar nuevo valor
        </Button>
      </div>

      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Tendencias de resultados
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Evolución longitudinal de{" "}
          <span className="text-foreground font-semibold">
            {targetResult.testName}
          </span>
        </p>
      </div>

      {/* Barra de filtros temporales estilo Kaiser imagen 7 */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-4">
          <div
            role="tablist"
            aria-label="Filtro temporal de tendencia"
            className="border-border bg-muted/60 inline-flex flex-wrap justify-center gap-1 rounded-full border p-1"
          >
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={period === option.id}
                onClick={() => setPeriod(option.id)}
                className={`focus-visible:ring-ring cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  period === option.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-foreground hover:bg-card"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex flex-wrap items-end gap-3 pt-1">
              <div>
                <FieldLabel htmlFor="trend-from">Desde</FieldLabel>
                <Input
                  id="trend-from"
                  type="date"
                  className="tabular-nums"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel htmlFor="trend-to">Hasta</FieldLabel>
                <Input
                  id="trend-to"
                  type="date"
                  className="tabular-nums"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <p className="text-primary text-xs font-semibold tabular-nums">
            {period === "recent"
              ? `Mostrando los ${filteredSeries.length} resultados más recientes`
              : `Mostrando ${filteredSeries.length} resultados en el periodo`}
          </p>
        </CardContent>
      </Card>

      {/* Gráfica longitudinal con banda verde de referencia */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              {definition?.shortName ?? targetResult.testCode}
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
              Rango normal: {targetResult.refMin} – {targetResult.refMax}{" "}
              {targetResult.unit}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <LabTrendChart
            results={filteredSeries}
            refMin={targetResult.refMin}
            refMax={targetResult.refMax}
            unit={targetResult.unit}
          />
        </CardContent>
      </Card>

      <NewLabModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={patient}
        defaultTestCode={targetResult.testCode}
      />
    </div>
  );
}
