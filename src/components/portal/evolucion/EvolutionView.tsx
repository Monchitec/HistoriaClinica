"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Activity, Plus, Stethoscope } from "lucide-react";
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
import { FieldLabel, Input, Textarea } from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import {
  calculateBmi,
  classifyBloodPressure,
} from "@/lib/clinical/calculators";
import { formatClinicalDateTime } from "@/lib/format/es-pe";

export function EvolutionView() {
  const params = useParams<{ id: string }>();
  const { db, session, addSoapNote, addVitalSign } = useHce();

  const [soapOpen, setSoapOpen] = useState(false);
  const [vitalOpen, setVitalOpen] = useState(false);

  // Estado formulario SOAP
  const [reason, setReason] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [plan, setPlan] = useState("");
  const [soapError, setSoapError] = useState("");

  // Estado formulario signos vitales
  const [systolicBp, setSystolicBp] = useState("124");
  const [diastolicBp, setDiastolicBp] = useState("78");
  const [heartRate, setHeartRate] = useState("74");
  const [temperatureC, setTemperatureC] = useState("36.6");
  const [respiratoryRate, setRespiratoryRate] = useState("16");
  const [spo2, setSpo2] = useState("98");
  const [weightKg, setWeightKg] = useState("68");
  const [heightCm, setHeightCm] = useState("162");

  const patient = db.patients.find((p) => p.id === params.id);

  const notes = useMemo(
    () =>
      [...db.soapNotes]
        .filter((n) => n.patientId === params.id)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [db.soapNotes, params.id],
  );

  const vitals = useMemo(
    () =>
      [...db.vitals]
        .filter((v) => v.patientId === params.id)
        .sort(
          (a, b) =>
            new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
        ),
    [db.vitals, params.id],
  );

  if (!patient) return null;

  function handleSaveSoap(event: FormEvent) {
    event.preventDefault();
    if (!patient) return;
    if (!reason.trim() || !analysis.trim() || !plan.trim()) {
      setSoapError("Completa al menos motivo, análisis y plan.");
      return;
    }

    addSoapNote({
      patientId: patient.id,
      date: new Date().toISOString(),
      reason: reason.trim(),
      subjective: subjective.trim() || "Sin síntomas agregados referidos.",
      objective:
        objective.trim() || "Evaluación física registrada en consulta.",
      analysis: analysis.trim(),
      plan: plan.trim(),
      author: `${session?.name ?? "Dra. Rubí Collahua"} · ${session?.specialty ?? "Medicina Interna"}`,
    });

    setReason("");
    setSubjective("");
    setObjective("");
    setAnalysis("");
    setPlan("");
    setSoapError("");
    setSoapOpen(false);
  }

  function handleSaveVitals(event: FormEvent) {
    event.preventDefault();
    if (!patient) return;
    addVitalSign({
      patientId: patient.id,
      recordedAt: new Date().toISOString(),
      systolicBp: Number(systolicBp) || 120,
      diastolicBp: Number(diastolicBp) || 80,
      heartRate: Number(heartRate) || 72,
      temperatureC: Number(temperatureC) || 36.5,
      respiratoryRate: Number(respiratoryRate) || 16,
      spo2: Number(spo2) || 98,
      weightKg: Number(weightKg) || 70,
      heightCm: Number(heightCm) || 165,
    });
    setVitalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Evolución clínica (SOAP) y Signos Vitales
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Registro cronológico de atenciones y monitoreo de parámetros
            antropométricos y hemodinámicos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setVitalOpen(true)}>
            <Activity className="h-4 w-4" strokeWidth={1.75} />
            Registrar vitales
          </Button>
          <Button onClick={() => setSoapOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Nueva evolución SOAP
          </Button>
        </div>
      </div>

      {/* Signos Vitales */}
      <section id="vitales">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Signos Vitales y Antropometría</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVitalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Tomar signos
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {vitals.length === 0 ? (
              <p className="text-muted-foreground p-6 text-center text-xs">
                No hay registros de signos vitales todavía.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-border bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">PA (mmHg)</th>
                      <th className="px-4 py-3 font-semibold">FC / FR</th>
                      <th className="px-4 py-3 font-semibold">T° / SpO₂</th>
                      <th className="px-4 py-3 font-semibold">Peso / IMC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {vitals.map((v) => {
                      const bp = classifyBloodPressure(
                        v.systolicBp,
                        v.diastolicBp,
                      );
                      const bmi = calculateBmi(v.weightKg, v.heightCm);
                      return (
                        <tr key={v.id} className="hover:bg-muted/30">
                          <td className="text-muted-foreground px-4 py-3 tabular-nums">
                            {formatClinicalDateTime(v.recordedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-foreground font-bold tabular-nums">
                                {v.systolicBp}/{v.diastolicBp}
                              </span>
                              <Badge variant={bp.status}>{bp.label}</Badge>
                            </div>
                          </td>
                          <td className="text-foreground px-4 py-3 tabular-nums">
                            {v.heartRate} lpm · {v.respiratoryRate} rpm
                          </td>
                          <td className="text-foreground px-4 py-3 tabular-nums">
                            {v.temperatureC} °C · {v.spo2}%
                          </td>
                          <td className="text-foreground px-4 py-3 tabular-nums">
                            {v.weightKg} kg (IMC {bmi.bmi} · {bmi.category})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Notas SOAP */}
      <section aria-label="Notas de evolución SOAP" className="space-y-4">
        <h2 className="text-foreground text-lg font-bold">
          Notas de Evolución ({notes.length})
        </h2>

        {notes.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Sin notas de evolución"
            description="Registra la primera consulta SOAP para llevar el seguimiento ordenado de este paciente."
            action={
              <Button onClick={() => setSoapOpen(true)}>Crear nota SOAP</Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div>
                    <CardTitle>{note.reason}</CardTitle>
                    <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                      {formatClinicalDateTime(note.date)} · {note.author}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-xs sm:grid-cols-2">
                  <div className="bg-muted/45 rounded-xl p-3.5">
                    <p className="text-primary font-bold">S — Subjetivo</p>
                    <p className="text-foreground mt-1 leading-relaxed">
                      {note.subjective}
                    </p>
                  </div>
                  <div className="bg-muted/45 rounded-xl p-3.5">
                    <p className="text-primary font-bold">O — Objetivo</p>
                    <p className="text-foreground mt-1 leading-relaxed">
                      {note.objective}
                    </p>
                  </div>
                  <div className="bg-muted/45 rounded-xl p-3.5">
                    <p className="text-primary font-bold">A — Análisis</p>
                    <p className="text-foreground mt-1 leading-relaxed">
                      {note.analysis}
                    </p>
                  </div>
                  <div className="bg-muted/45 rounded-xl p-3.5">
                    <p className="text-primary font-bold">P — Plan</p>
                    <p className="text-foreground mt-1 leading-relaxed">
                      {note.plan}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Modal nueva evolución SOAP */}
      <Modal
        open={soapOpen}
        onClose={() => setSoapOpen(false)}
        title="Nueva nota de evolución SOAP"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveSoap} className="space-y-4">
          <div>
            <FieldLabel htmlFor="soap-reason" required>
              Motivo de consulta / Control
            </FieldLabel>
            <Input
              id="soap-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Control metabólico y revisión de resultados"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="soap-s">S — Subjetivo</FieldLabel>
              <Textarea
                id="soap-s"
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                placeholder="Síntomas, adherencia al tratamiento..."
              />
            </div>
            <div>
              <FieldLabel htmlFor="soap-o">O — Objetivo</FieldLabel>
              <Textarea
                id="soap-o"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Examen físico y hallazgos de laboratorio..."
              />
            </div>
            <div>
              <FieldLabel htmlFor="soap-a" required>
                A — Análisis / Diagnóstico
              </FieldLabel>
              <Textarea
                id="soap-a"
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                placeholder="Impresión clínica y estado evolutivo..."
              />
            </div>
            <div>
              <FieldLabel htmlFor="soap-p" required>
                P — Plan terapéutico
              </FieldLabel>
              <Textarea
                id="soap-p"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Ajustes de medicación, exámenes y próximo control..."
              />
            </div>
          </div>

          {soapError && (
            <p className="bg-clinical-critical-soft text-clinical-critical-foreground rounded-xl px-3 py-2 text-xs font-medium">
              {soapError}
            </p>
          )}

          <div className="border-border flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setSoapOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Firmar evolución</Button>
          </div>
        </form>
      </Modal>

      {/* Modal signos vitales */}
      <Modal
        open={vitalOpen}
        onClose={() => setVitalOpen(false)}
        title="Registrar signos vitales"
      >
        <form onSubmit={handleSaveVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <FieldLabel htmlFor="v-pas">PAS (mmHg)</FieldLabel>
              <Input
                id="v-pas"
                type="number"
                className="tabular-nums"
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-pad">PAD (mmHg)</FieldLabel>
              <Input
                id="v-pad"
                type="number"
                className="tabular-nums"
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-fc">FC (lpm)</FieldLabel>
              <Input
                id="v-fc"
                type="number"
                className="tabular-nums"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-fr">FR (rpm)</FieldLabel>
              <Input
                id="v-fr"
                type="number"
                className="tabular-nums"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-temp">Temp (°C)</FieldLabel>
              <Input
                id="v-temp"
                type="number"
                step="0.1"
                className="tabular-nums"
                value={temperatureC}
                onChange={(e) => setTemperatureC(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-spo2">SpO₂ (%)</FieldLabel>
              <Input
                id="v-spo2"
                type="number"
                className="tabular-nums"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-peso">Peso (kg)</FieldLabel>
              <Input
                id="v-peso"
                type="number"
                step="0.1"
                className="tabular-nums"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="v-talla">Talla (cm)</FieldLabel>
              <Input
                id="v-talla"
                type="number"
                className="tabular-nums"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-secondary text-secondary-foreground rounded-xl p-3 text-xs font-medium tabular-nums">
            IMC calculado:{" "}
            {calculateBmi(Number(weightKg), Number(heightCm)).bmi} kg/m² (
            {calculateBmi(Number(weightKg), Number(heightCm)).category}) · PA:{" "}
            {
              classifyBloodPressure(Number(systolicBp), Number(diastolicBp))
                .label
            }
          </div>

          <div className="border-border flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setVitalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar vitales</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
