"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  FlaskConical,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { Card, CardContent } from "@/components/shared/ui/Card";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Input } from "@/components/shared/ui/Input";
import { evaluateLabResult } from "@/lib/clinical/lab-evaluation";
import { formatClinicalDate } from "@/lib/format/es-pe";
import type { LabPanelCategory } from "@/types/clinical";
import { NewLabModal } from "./NewLabModal";

const CATEGORIES: Array<"Todas" | LabPanelCategory> = [
  "Todas",
  "Glucemia",
  "Renal",
  "Lipídico",
  "Hepático",
  "Hemograma",
  "Tiroideo",
  "Electrolitos",
];

export function LabResultsView() {
  const params = useParams<{ id: string }>();
  const { db } = useHce();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todas" | LabPanelCategory>("Todas");
  const [viewMode, setViewMode] = useState<"all" | "latest">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const patient = db.patients.find((p) => p.id === params.id);

  const patientLabs = useMemo(() => {
    const raw = db.labResults
      .filter((r) => r.patientId === params.id)
      .sort(
        (a, b) =>
          new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
      );

    const base =
      viewMode === "latest"
        ? Array.from(
            raw.reduce((map, item) => {
              if (!map.has(item.testCode)) map.set(item.testCode, item);
              return map;
            }, new Map<string, (typeof raw)[number]>()),
          ).map(([, item]) => item)
        : raw;

    const q = query.trim().toLowerCase();
    return base.filter((item) => {
      const matchCat = category === "Todas" || item.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.testName.toLowerCase().includes(q) ||
        item.testCode.toLowerCase().includes(q) ||
        item.laboratory.toLowerCase().includes(q)
      );
    });
  }, [db.labResults, params.id, viewMode, category, query]);

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Resultados de pruebas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Haz clic en cualquier examen para revisar su rango visual y su curva
            de tendencia histórica.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Registrar resultado
        </Button>
      </div>

      {/* Buscador y filtros (inspirado en imagen 8 de Kaiser Permanente) */}
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
                strokeWidth={1.75}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar resultados de exámenes (ej. HbA1c, Creatinina, LDL)..."
                aria-label="Buscar resultados de exámenes"
                className="pl-10"
              />
            </div>
            <div className="border-border bg-muted inline-flex rounded-xl border p-1">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos (
                {db.labResults.filter((r) => r.patientId === params.id).length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("latest")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "latest"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Último por prueba
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`focus-visible:ring-ring cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  category === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de resultados individuales */}
      {patientLabs.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Sin resultados registrados"
          description="No hay exámenes que coincidan con tu búsqueda o aún no se han cargado análisis para este paciente."
          action={
            <Button onClick={() => setModalOpen(true)}>
              Registrar primer resultado
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-border bg-muted/40 text-muted-foreground border-b px-5 py-3 text-xs font-semibold tabular-nums">
            Mostrando {patientLabs.length} resultado
            {patientLabs.length === 1 ? "" : "s"}
          </div>
          <ul className="divide-border divide-y">
            {patientLabs.map((item) => {
              const evaluation = evaluateLabResult(item);
              return (
                <li
                  key={item.id}
                  className="hover:bg-muted/35 flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="bg-secondary text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <FlaskConical className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <Link
                        href={`/portal/pacientes/${patient.id}/pruebas/${item.id}`}
                        className="text-foreground hover:text-primary text-sm font-bold"
                      >
                        {item.testName}
                      </Link>
                      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
                        <span>{formatClinicalDate(item.collectedAt)}</span>
                        <span>·</span>
                        <span>{item.orderedBy}</span>
                        <span>·</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2.5">
                      <span className="text-foreground text-sm font-bold tabular-nums">
                        {item.value} {item.unit}
                      </span>
                      <Badge variant={evaluation.status}>
                        {evaluation.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/portal/pacientes/${patient.id}/pruebas/${item.id}/tendencias`}
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
                        href={`/portal/pacientes/${patient.id}/pruebas/${item.id}`}
                        aria-label={`Ver detalle de ${item.testName}`}
                        className="border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg border"
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <NewLabModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={patient}
      />
    </div>
  );
}
