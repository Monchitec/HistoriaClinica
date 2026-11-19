"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Image as ImageIcon, Plus, Search } from "lucide-react";
import { NewDiagnosticStudyModal } from "@/components/portal/imagenes/NewDiagnosticStudyModal";
import { PacsViewerModal } from "@/components/portal/imagenes/PacsViewerModal";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { Card, CardContent } from "@/components/shared/ui/Card";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Input } from "@/components/shared/ui/Input";
import { formatClinicalDate } from "@/lib/format/es-pe";
import type { DiagnosticModality, DiagnosticStudy } from "@/types/clinical";

const MODALITY_FILTERS: Array<"Todas" | DiagnosticModality> = [
  "Todas",
  "Rayos X",
  "Ecografía",
  "Tomografía",
  "Resonancia",
  "Electrocardiograma",
];

const STATUS_LABELS: Record<DiagnosticStudy["status"], string> = {
  normal: "Normal",
  warning: "Seguimiento",
  critical: "Prioritario",
};

export function DiagnosticImagesView() {
  const params = useParams<{ id: string }>();
  const { db } = useHce();

  const [query, setQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState<
    "Todas" | DiagnosticModality
  >("Todas");
  const [newStudyOpen, setNewStudyOpen] = useState(false);
  const [activeStudy, setActiveStudy] = useState<DiagnosticStudy | null>(null);

  const patient = db.patients.find((p) => p.id === params.id);

  const filteredStudies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.diagnosticStudies
      .filter((study) => study.patientId === params.id)
      .filter(
        (study) =>
          modalityFilter === "Todas" || study.modality === modalityFilter,
      )
      .filter((study) => {
        if (!q) return true;
        return (
          study.studyName.toLowerCase().includes(q) ||
          study.region.toLowerCase().includes(q) ||
          study.findings.toLowerCase().includes(q) ||
          study.conclusion.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
      );
  }, [db.diagnosticStudies, params.id, modalityFilter, query]);

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Imágenes Diagnósticas
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Radiografías, ecografías, tomografías e informes radiológicos con
            visor clínico integrado.
          </p>
        </div>
        <Button onClick={() => setNewStudyOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Registrar estudio
        </Button>
      </div>

      {/* Buscador y filtros por modalidad */}
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
              strokeWidth={1.75}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre de estudio, región anatómica o conclusión..."
              aria-label="Buscar estudio de imagen"
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {MODALITY_FILTERS.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setModalityFilter(mod)}
                className={`focus-visible:ring-ring cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  modalityFilter === mod
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredStudies.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Sin estudios de imagen coincidentes"
          description="No hay radiografías, ecografías o estudios registrados para este filtro. Puedes registrar uno nuevo."
          action={
            <Button variant="outline" onClick={() => setNewStudyOpen(true)}>
              Registrar primer estudio
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredStudies.map((study) => (
            <Card
              key={study.id}
              className="hover:border-primary/40 transition-colors"
            >
              <CardContent className="grid gap-5 p-5 md:grid-cols-12">
                {/* Miniatura de la placa */}
                <button
                  type="button"
                  onClick={() => setActiveStudy(study)}
                  className="border-border group relative flex h-44 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-black md:col-span-4"
                >
                  {study.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={study.imageUrl}
                      alt={study.studyName}
                      className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-1.5 text-xs">
                      <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                      <span>Sin placa adjunta</span>
                    </div>
                  )}
                  <span className="bg-primary text-primary-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold opacity-95 shadow-sm">
                    <Eye className="h-3 w-3" strokeWidth={1.75} />
                    Abrir visor
                  </span>
                </button>

                {/* Información e informe clínico */}
                <div className="flex flex-col justify-between gap-3 md:col-span-8">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-foreground text-base font-bold">
                          {study.studyName}
                        </h2>
                        <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                          {study.region} · Realizado el{" "}
                          {formatClinicalDate(study.performedAt)} ·{" "}
                          {study.facility}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="primary">{study.modality}</Badge>
                        <Badge variant={study.status}>
                          {STATUS_LABELS[study.status]}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-3 text-xs">
                      <p className="text-foreground font-semibold">
                        Conclusión radiológica
                      </p>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {study.conclusion}
                      </p>
                    </div>
                  </div>

                  <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
                    <span className="text-muted-foreground">
                      Informado por:{" "}
                      <strong className="text-foreground font-medium">
                        {study.radiologist}
                      </strong>
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveStudy(study)}
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Ver placa e informe completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewDiagnosticStudyModal
        open={newStudyOpen}
        onClose={() => setNewStudyOpen(false)}
        patient={patient}
      />

      <PacsViewerModal
        study={activeStudy}
        onClose={() => setActiveStudy(null)}
      />
    </div>
  );
}
