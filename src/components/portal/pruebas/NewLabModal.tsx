"use client";

import { useState, type FormEvent } from "react";
import { Calculator } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Button } from "@/components/shared/ui/Button";
import {
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import { getLabDefinition, LAB_CATALOG } from "@/data/lab-catalog";
import {
  calculateAge,
  calculateEgfrCkdEpi2021,
  classifyCkdStage,
} from "@/lib/clinical/calculators";
import type { Patient } from "@/types/clinical";

interface NewLabModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  defaultTestCode?: string;
}

export function NewLabModal({
  open,
  onClose,
  patient,
  defaultTestCode = "HBA1C",
}: NewLabModalProps) {
  const { addLabResult, session } = useHce();

  const [testCode, setTestCode] = useState(defaultTestCode);
  const [valueStr, setValueStr] = useState("");
  const [collectedDate, setCollectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [laboratory, setLaboratory] = useState(
    "Laboratorio Central Almenara — Lima",
  );
  const [notes, setNotes] = useState("");
  const [autoEgfr, setAutoEgfr] = useState(true);
  const [error, setError] = useState("");

  const selectedDef = getLabDefinition(testCode) ?? LAB_CATALOG[0];
  const numericValue = Number(valueStr);
  const isValidNum =
    valueStr.trim() !== "" && !Number.isNaN(numericValue) && numericValue >= 0;

  const previewEgfr =
    testCode === "CREAT" && isValidNum && numericValue > 0
      ? calculateEgfrCkdEpi2021(
          numericValue,
          calculateAge(patient.birthDate) || 50,
          patient.sex,
        )
      : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidNum) {
      setError("Ingresa un valor numérico válido.");
      return;
    }

    addLabResult({
      patientId: patient.id,
      testCode,
      value: numericValue,
      collectedAt: `${collectedDate}T09:00:00`,
      orderedBy: `${session?.name ?? "Dra. Rubí Collahua"} · ${session?.specialty ?? "Medicina Interna"}`,
      laboratory,
      notes,
      autoCalculateEgfr: autoEgfr,
    });

    setValueStr("");
    setNotes("");
    setError("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar resultado de laboratorio"
      description={`Paciente: ${patient.fullName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="lab-test" required>
            Examen de laboratorio
          </FieldLabel>
          <Select
            id="lab-test"
            value={testCode}
            onChange={(e) => {
              setTestCode(e.target.value);
              setError("");
            }}
          >
            {LAB_CATALOG.map((item) => (
              <option key={item.code} value={item.code}>
                {item.shortName} — {item.name} ({item.unit})
              </option>
            ))}
          </Select>
          <p className="text-muted-foreground mt-1 text-[11px] tabular-nums">
            Rango de referencia: {selectedDef.refMin} – {selectedDef.refMax}{" "}
            {selectedDef.unit} · Categoría: {selectedDef.category}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="lab-value" required>
              Valor ({selectedDef.unit})
            </FieldLabel>
            <Input
              id="lab-value"
              type="number"
              step="any"
              className="tabular-nums"
              value={valueStr}
              onChange={(e) => {
                setValueStr(e.target.value);
                if (error) setError("");
              }}
              placeholder={`Ej. ${selectedDef.refMax}`}
            />
          </div>

          <div>
            <FieldLabel htmlFor="lab-date" required>
              Fecha de toma
            </FieldLabel>
            <Input
              id="lab-date"
              type="date"
              className="tabular-nums"
              value={collectedDate}
              onChange={(e) => setCollectedDate(e.target.value)}
            />
          </div>
        </div>

        {previewEgfr !== null && (
          <div className="border-primary/25 bg-secondary rounded-xl border p-3.5 text-xs">
            <div className="text-secondary-foreground flex items-center gap-2 font-semibold">
              <Calculator className="text-primary h-4 w-4" strokeWidth={1.75} />
              <span>
                TFGe estimada (CKD-EPI 2021):{" "}
                <span className="font-bold tabular-nums">
                  {previewEgfr} mL/min/1.73m²
                </span>
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Estadio estimado: {classifyCkdStage(previewEgfr)}
            </p>
            <label className="text-foreground mt-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={autoEgfr}
                onChange={(e) => setAutoEgfr(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              <span>
                Guardar automáticamente TFGe calculada en el historial
              </span>
            </label>
          </div>
        )}

        <div>
          <FieldLabel htmlFor="lab-origin">Laboratorio</FieldLabel>
          <Input
            id="lab-origin"
            value={laboratory}
            onChange={(e) => setLaboratory(e.target.value)}
            placeholder="Ej. Laboratorio Central / Particular"
          />
        </div>

        <div>
          <FieldLabel htmlFor="lab-notes">
            Observación clínica (opcional)
          </FieldLabel>
          <Textarea
            id="lab-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Control post ajuste de dosis..."
          />
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
          <Button type="submit">Guardar resultado</Button>
        </div>
      </form>
    </Modal>
  );
}
