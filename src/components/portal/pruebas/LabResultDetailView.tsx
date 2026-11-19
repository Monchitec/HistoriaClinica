"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FlaskConical, Info, Plus, TrendingUp } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { getLabDefinition } from "@/data/lab-catalog";
import { evaluateLabResult } from "@/lib/clinical/lab-evaluation";
import { formatClinicalDateTime } from "@/lib/format/es-pe";
import { NewLabModal } from "./NewLabModal";
import { RangeBar } from "./RangeBar";

export function LabResultDetailView() {
  const params = useParams<{ id: string; pruebaId: string }>();
  const { db } = useHce();
  const [modalOpen, setModalOpen] = useState(false);

  const patient = db.patients.find((p) => p.id === params.id);
  const result = db.labResults.find(
    (r) => r.id === params.pruebaId && r.patientId === params.id,
  );

  if (!patient || !result) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="Resultado no encontrado"
        description="El examen solicitado no pertenece a esta historia clínica o fue eliminado."
        action={
          <Link href={`/portal/pacientes/${params.id}/pruebas`}>
            <Button variant="outline">Volver a resultados</Button>
          </Link>
        }
      />
    );
  }

  const definition = getLabDefinition(result.testCode);
  const evaluation = evaluateLabResult(result);
  const historyCount = db.labResults.filter(
    (r) => r.patientId === patient.id && r.testCode === result.testCode,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/portal/pacientes/${patient.id}/pruebas`}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Lista de resultados de exámenes
        </Link>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Registrar nuevo control
        </Button>
      </div>

      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {result.testName}
        </h1>
        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
          Recolectado el {formatClinicalDateTime(result.collectedAt)}
        </p>
      </div>

      {/* Estructura fiel a la imagen 6 de Kaiser Permanente */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-8">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  {definition?.shortName ?? result.testCode}
                </CardTitle>
                <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                  Rango normal: {result.refMin} – {result.refMax} {result.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={evaluation.status}>{evaluation.label}</Badge>
                <Link
                  href={`/portal/pacientes/${patient.id}/pruebas/${result.id}/tendencias`}
                >
                  <Button variant="secondary" size="sm">
                    <TrendingUp
                      className="text-primary h-4 w-4"
                      strokeWidth={1.75}
                    />
                    Ver tendencias ({historyCount})
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <RangeBar
                value={result.value}
                refMin={result.refMin}
                refMax={result.refMax}
                unit={result.unit}
                definition={definition}
              />

              {definition?.clinicalGuidance && (
                <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border p-4 text-xs leading-relaxed">
                  <p className="text-foreground mb-1 font-semibold">
                    Referencia clínica (Medicina Interna)
                  </p>
                  <p>{definition.clinicalGuidance}</p>
                </div>
              )}

              {result.notes && (
                <div className="border-primary/20 bg-secondary/50 text-foreground rounded-xl border p-4 text-xs">
                  <p className="text-primary font-semibold">
                    Nota del médico / laboratorio
                  </p>
                  <p className="mt-1">{result.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4 lg:col-span-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="border-border bg-muted/50 flex items-start gap-2.5 rounded-xl border p-3 text-xs">
                <Info
                  className="text-primary mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-foreground font-semibold">
                    Aprender más sobre{" "}
                    {definition?.shortName ?? result.testCode}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Categoría: {result.category}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h2 className="text-primary text-sm font-bold">
                  Información adicional
                </h2>
                <dl className="border-border space-y-2 border-t pt-2.5">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Autorizado por:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {result.orderedBy}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">
                      Fecha de colección:
                    </dt>
                    <dd className="text-foreground text-right font-medium tabular-nums">
                      {formatClinicalDateTime(result.collectedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Espécimen:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {result.specimen}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">
                      Fecha del resultado:
                    </dt>
                    <dd className="text-foreground text-right font-medium tabular-nums">
                      {formatClinicalDateTime(result.reportedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Estado:</dt>
                    <dd className="text-foreground text-right font-semibold">
                      {result.status}
                    </dd>
                  </div>
                  <div className="border-border border-t pt-2">
                    <dt className="text-muted-foreground">Laboratorio:</dt>
                    <dd className="text-foreground mt-0.5 font-medium">
                      {result.laboratory}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <NewLabModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={patient}
        defaultTestCode={result.testCode}
      />
    </div>
  );
}
