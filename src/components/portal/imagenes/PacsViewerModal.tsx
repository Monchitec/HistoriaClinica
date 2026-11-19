"use client";

import { useState } from "react";
import { Contrast, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { Modal } from "@/components/shared/ui/Modal";
import { formatClinicalDateTime } from "@/lib/format/es-pe";
import type { DiagnosticStudy } from "@/types/clinical";

interface PacsViewerModalProps {
  study: DiagnosticStudy | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<DiagnosticStudy["status"], string> = {
  normal: "Normal",
  warning: "Seguimiento",
  critical: "Prioritario",
};

export function PacsViewerModal({ study, onClose }: PacsViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(105);
  const [inverted, setInverted] = useState(false);

  if (!study) return null;

  function resetView() {
    setZoom(100);
    setBrightness(100);
    setContrast(105);
    setInverted(false);
  }

  return (
    <Modal
      open={Boolean(study)}
      onClose={onClose}
      title={study.studyName}
      description={`${study.modality} · ${study.region} · ${formatClinicalDateTime(study.performedAt)}`}
      maxWidthClass="max-w-5xl"
    >
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Lienzo oscuro tipo visor PACS */}
        <div className="space-y-3 lg:col-span-7">
          <div className="border-border bg-muted/60 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.max(50, z - 25))}
                aria-label="Alejar zoom"
              >
                <ZoomOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <span className="text-foreground min-w-12 text-center text-xs font-semibold tabular-nums">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.min(250, z + 25))}
                aria-label="Acercar zoom"
              >
                <ZoomIn className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="text-muted-foreground flex items-center gap-1.5">
                <span>Brillo</span>
                <input
                  type="range"
                  min={60}
                  max={160}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="accent-primary w-16 cursor-pointer"
                />
              </label>

              <label className="text-muted-foreground flex items-center gap-1.5">
                <span>Contraste</span>
                <input
                  type="range"
                  min={70}
                  max={180}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="accent-primary w-16 cursor-pointer"
                />
              </label>

              <Button
                variant={inverted ? "primary" : "outline"}
                size="sm"
                onClick={() => setInverted((v) => !v)}
              >
                <Contrast className="h-3.5 w-3.5" strokeWidth={1.75} />
                Invertir
              </Button>

              <Button variant="ghost" size="sm" onClick={resetView}>
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Restablecer
              </Button>
            </div>
          </div>

          <div className="border-border flex h-[380px] items-center justify-center overflow-auto rounded-xl border bg-black p-3">
            {study.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={study.imageUrl}
                alt={study.studyName}
                className="max-h-full origin-center transition-transform duration-150 select-none"
                style={{
                  transform: `scale(${zoom / 100})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${inverted ? "invert(1)" : ""}`,
                }}
              />
            ) : (
              <p className="text-muted-foreground text-xs">
                Estudio registrado sin imagen adjunta (solo informe
                radiológico).
              </p>
            )}
          </div>
        </div>

        {/* Informe radiológico estructurado */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{study.modality}</Badge>
            <Badge variant={study.status}>{STATUS_LABELS[study.status]}</Badge>
          </div>

          <div className="border-border bg-muted/40 space-y-1.5 rounded-xl border p-3.5 text-xs">
            <p className="text-foreground font-bold">Hallazgos</p>
            <p className="text-muted-foreground leading-relaxed">
              {study.findings}
            </p>
          </div>

          <div className="border-border bg-secondary/40 space-y-1.5 rounded-xl border p-3.5 text-xs">
            <p className="text-secondary-foreground font-bold">
              Conclusión / Impresión diagnóstica
            </p>
            <p className="text-foreground leading-relaxed font-medium">
              {study.conclusion}
            </p>
          </div>

          <dl className="border-border space-y-2 rounded-xl border p-3.5 text-xs">
            <div>
              <dt className="text-muted-foreground">Médico informante</dt>
              <dd className="text-foreground font-semibold">
                {study.radiologist}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Servicio / Sede</dt>
              <dd className="text-foreground font-medium">{study.facility}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Solicitado por</dt>
              <dd className="text-foreground font-medium">{study.orderedBy}</dd>
            </div>
            {study.studyUid && (
              <div>
                <dt className="text-muted-foreground">Study Instance UID</dt>
                <dd className="text-muted-foreground font-mono text-[11px] break-all tabular-nums">
                  {study.studyUid}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </Modal>
  );
}
