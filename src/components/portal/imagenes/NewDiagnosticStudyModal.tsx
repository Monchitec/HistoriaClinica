"use client";

import { useState, type FormEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Button } from "@/components/shared/ui/Button";
import {
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import { compressImageFile } from "@/lib/format/image-compression";
import type {
  ClinicalStatus,
  DiagnosticModality,
  Patient,
} from "@/types/clinical";

interface NewDiagnosticStudyModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

const MODALITIES: DiagnosticModality[] = [
  "Rayos X",
  "Ecografía",
  "Tomografía",
  "Resonancia",
  "Electrocardiograma",
];

export function NewDiagnosticStudyModal({
  open,
  onClose,
  patient,
}: NewDiagnosticStudyModalProps) {
  const { session, addDiagnosticStudy } = useHce();

  const [modality, setModality] = useState<DiagnosticModality>("Rayos X");
  const [studyName, setStudyName] = useState("");
  const [region, setRegion] = useState("");
  const [performedAt, setPerformedAt] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [radiologist, setRadiologist] = useState("");
  const [facility, setFacility] = useState(
    "Servicio de Diagnóstico por Imágenes — Lima",
  );
  const [status, setStatus] = useState<ClinicalStatus>("normal");
  const [findings, setFindings] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");

  function resetFields() {
    setModality("Rayos X");
    setStudyName("");
    setRegion("");
    setPerformedAt(new Date().toISOString().slice(0, 16));
    setRadiologist("");
    setFacility("Servicio de Diagnóstico por Imágenes — Lima");
    setStatus("normal");
    setFindings("");
    setConclusion("");
    setImageUrl("");
    setError("");
  }

  async function handleFileChange(file?: File) {
    if (!file) return;
    setCompressing(true);
    setError("");
    try {
      const compressed = await compressImageFile(file, {
        maxDimension: 1400,
        quality: 0.82,
      });
      setImageUrl(compressed);
    } catch {
      setError("No se pudo procesar la imagen seleccionada.");
    } finally {
      setCompressing(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!studyName.trim()) {
      setError("Ingresa el nombre del estudio (ej. Radiografía de Tórax PA).");
      return;
    }
    if (!findings.trim() || !conclusion.trim()) {
      setError("Completa los hallazgos y la conclusión radiológica.");
      return;
    }

    addDiagnosticStudy({
      patientId: patient.id,
      modality,
      studyName: studyName.trim(),
      region: region.trim() || "General",
      performedAt: performedAt
        ? new Date(performedAt).toISOString()
        : new Date().toISOString(),
      orderedBy: session?.name ?? "Dra. Rubí Collahua",
      radiologist:
        radiologist.trim() || "Médico Radiólogo — Diagnóstico por Imágenes",
      facility: facility.trim() || "Servicio de Radiología",
      findings: findings.trim(),
      conclusion: conclusion.trim(),
      status,
      imageUrl: imageUrl || undefined,
    });

    resetFields();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar estudio de imagen diagnóstica"
      description={`Paciente: ${patient.fullName} · La imagen se optimiza automáticamente antes de guardarse.`}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="img-modality">Modalidad</FieldLabel>
            <Select
              id="img-modality"
              value={modality}
              onChange={(e) =>
                setModality(e.target.value as DiagnosticModality)
              }
            >
              {MODALITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <FieldLabel htmlFor="img-status">Clasificación clínica</FieldLabel>
            <Select
              id="img-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ClinicalStatus)}
            >
              <option value="normal">Normal / Sin hallazgos agudos</option>
              <option value="warning">Hallazgo de seguimiento / Límite</option>
              <option value="critical">Hallazgo crítico / Prioritario</option>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="img-name" required>
              Nombre del estudio
            </FieldLabel>
            <Input
              id="img-name"
              value={studyName}
              onChange={(e) => {
                setStudyName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej. Radiografía de Tórax PA y Lateral"
            />
          </div>

          <div>
            <FieldLabel htmlFor="img-region">Región anatómica</FieldLabel>
            <Input
              id="img-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Ej. Tórax, Abdomen superior"
            />
          </div>

          <div>
            <FieldLabel htmlFor="img-date">Fecha del estudio</FieldLabel>
            <Input
              id="img-date"
              type="datetime-local"
              className="tabular-nums"
              value={performedAt}
              onChange={(e) => setPerformedAt(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="img-radiologist">Médico informante</FieldLabel>
            <Input
              id="img-radiologist"
              value={radiologist}
              onChange={(e) => setRadiologist(e.target.value)}
              placeholder="Ej. Dr. Carlos Mendoza Ríos"
            />
          </div>

          <div>
            <FieldLabel htmlFor="img-facility">Centro / Servicio</FieldLabel>
            <Input
              id="img-facility"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="img-findings" required>
              Hallazgos radiológicos
            </FieldLabel>
            <Textarea
              id="img-findings"
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Describe los hallazgos imagenológicos relevantes..."
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="img-conclusion" required>
              Conclusión / Impresión diagnóstica
            </FieldLabel>
            <Textarea
              id="img-conclusion"
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Impresión diagnóstica final del radiólogo..."
            />
          </div>
        </div>

        {/* Carga y compresión de placa */}
        <div className="border-border bg-muted/40 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-foreground text-xs font-semibold">
                Placa o imagen diagnóstica (JPG, PNG, WebP)
              </p>
              <p className="text-muted-foreground text-[11px]">
                Compresión inteligente en navegador (máx. 1400 px) para carga
                rápida.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {imageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageUrl("")}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Quitar
                </Button>
              )}
              <label className="border-border bg-card text-foreground hover:bg-muted focus-within:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors focus-within:ring-2">
                <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>
                  {compressing ? "Optimizando..." : "Adjuntar imagen"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={compressing}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleFileChange(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {imageUrl && (
            <div className="border-border bg-foreground mt-3 flex justify-center overflow-hidden rounded-xl border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Vista previa de imagen diagnóstica"
                className="max-h-48 rounded-lg object-contain"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="bg-clinical-critical-soft text-clinical-critical-foreground rounded-xl px-3 py-2 text-xs font-medium">
            {error}
          </p>
        )}

        <div className="border-border flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={compressing}>
            Guardar estudio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
