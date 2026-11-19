"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Pill, Plus, Power } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { Card, CardContent } from "@/components/shared/ui/Card";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { FieldLabel, Input, Select } from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import { formatClinicalDate } from "@/lib/format/es-pe";

export function MedicationsView() {
  const params = useParams<{ id: string }>();
  const { db, addMedication, toggleMedicationStatus } = useHce();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [route, setRoute] = useState("Vía oral");
  const [indication, setIndication] = useState("");
  const [notes, setNotes] = useState("");

  const patient = db.patients.find((p) => p.id === params.id);

  const meds = useMemo(
    () => db.medications.filter((m) => m.patientId === params.id),
    [db.medications, params.id],
  );

  if (!patient) return null;

  const activeMeds = meds.filter((m) => m.status === "activo");
  const suspendedMeds = meds.filter((m) => m.status === "suspendido");

  function handleAddMed(event: FormEvent) {
    event.preventDefault();
    if (!patient || !name.trim() || !dose.trim()) return;

    addMedication({
      patientId: patient.id,
      name: name.trim(),
      dose: dose.trim(),
      frequency: frequency.trim() || "Cada 24 horas",
      route,
      indication: indication.trim() || "Manejo crónico",
      startedAt: new Date().toISOString().slice(0, 10),
      status: "activo",
      notes: notes.trim() || undefined,
    });

    setName("");
    setDose("");
    setFrequency("");
    setIndication("");
    setNotes("");
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Medicamentos y Esquema Terapéutico
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Control de fármacos activos, dosis, frecuencia e historial de
            suspensiones.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Agregar medicamento
        </Button>
      </div>

      {meds.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Sin medicamentos registrados"
          description="Agrega el esquema terapéutico habitual o las nuevas indicaciones del paciente."
          action={
            <Button onClick={() => setModalOpen(true)}>
              Prescribir medicamento
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-foreground text-base font-bold">
              Medicación activa ({activeMeds.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {activeMeds.map((med) => (
                <Card key={med.id}>
                  <CardContent className="flex flex-col justify-between gap-3 p-5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-foreground text-base font-bold">
                            {med.name}
                          </p>
                          <p className="text-primary text-sm font-semibold tabular-nums">
                            {med.dose} · {med.route}
                          </p>
                        </div>
                        <Badge variant="normal">Activo</Badge>
                      </div>
                      <p className="text-foreground mt-2 text-xs">
                        {med.frequency}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Indicación: {med.indication} · Desde{" "}
                        <span className="tabular-nums">
                          {formatClinicalDate(med.startedAt)}
                        </span>
                      </p>
                      {med.notes && (
                        <p className="bg-muted/60 text-muted-foreground mt-2 rounded-lg px-2.5 py-1.5 text-[11px]">
                          {med.notes}
                        </p>
                      )}
                    </div>
                    <div className="border-border border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMedicationStatus(med.id)}
                      >
                        <Power className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Suspender
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {suspendedMeds.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-muted-foreground text-base font-bold">
                Suspendidos / Historial ({suspendedMeds.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {suspendedMeds.map((med) => (
                  <Card key={med.id} className="opacity-80">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-foreground text-sm font-bold line-through">
                          {med.name} {med.dose}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {med.frequency} · {med.indication}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMedicationStatus(med.id)}
                      >
                        Reactivar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Agregar medicamento"
      >
        <form onSubmit={handleAddMed} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="med-name" required>
                Principio activo / Fármaco
              </FieldLabel>
              <Input
                id="med-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Empagliflozina"
              />
            </div>
            <div>
              <FieldLabel htmlFor="med-dose" required>
                Dosis
              </FieldLabel>
              <Input
                id="med-dose"
                className="tabular-nums"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Ej. 10 mg"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="med-freq">Frecuencia</FieldLabel>
              <Input
                id="med-freq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Ej. Cada 24 horas (mañana)"
              />
            </div>
            <div>
              <FieldLabel htmlFor="med-route">Vía</FieldLabel>
              <Select
                id="med-route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              >
                <option value="Vía oral">Vía oral</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Inhalatoria">Inhalatoria</option>
                <option value="Endovenosa">Endovenosa</option>
                <option value="Tópica">Tópica</option>
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="med-ind">Indicación clínica</FieldLabel>
            <Input
              id="med-ind"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              placeholder="Ej. Diabetes Mellitus Tipo 2 / Nefroprotección"
            />
          </div>

          <div>
            <FieldLabel htmlFor="med-notes">
              Indicaciones adicionales
            </FieldLabel>
            <Input
              id="med-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Tomar con alimentos"
            />
          </div>

          <div className="border-border flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar medicamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
