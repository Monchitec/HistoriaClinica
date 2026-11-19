"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Plus, ShieldAlert, Syringe, Trash2 } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/Card";
import { FieldLabel, Input, Select } from "@/components/shared/ui/Input";
import { formatClinicalDate } from "@/lib/format/es-pe";
import type { Allergy, MedicalHistory } from "@/types/clinical";

type HistoryCategoryKey = "pathological" | "surgical" | "family" | "habits";

function createVaccineId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `vac-${Math.random().toString(36).slice(2, 10)}`;
}

const HISTORY_SECTIONS: Array<{
  key: HistoryCategoryKey;
  title: string;
  placeholder: string;
}> = [
  {
    key: "pathological",
    title: "Antecedentes Patológicos",
    placeholder: "Ej. Dislipidemia diagnosticada en 2022",
  },
  {
    key: "surgical",
    title: "Antecedentes Quirúrgicos",
    placeholder: "Ej. Apendicectomía (2014)",
  },
  {
    key: "family",
    title: "Antecedentes Familiares",
    placeholder: "Ej. Padre con cardiopatía isquémica",
  },
  {
    key: "habits",
    title: "Hábitos y Estilo de Vida",
    placeholder: "Ej. Niega tabaco, caminata diaria 30 min",
  },
];

export function MedicalHistoryView() {
  const params = useParams<{ id: string }>();
  const { db, addAllergy, removeAllergy, updateHistory } = useHce();

  const [allergySubstance, setAllergySubstance] = useState("");
  const [allergyReaction, setAllergyReaction] = useState("");
  const [allergySeverity, setAllergySeverity] =
    useState<Allergy["severity"]>("moderada");

  const [newEntries, setNewEntries] = useState<
    Record<HistoryCategoryKey, string>
  >({
    pathological: "",
    surgical: "",
    family: "",
    habits: "",
  });

  const [vaccineName, setVaccineName] = useState("");
  const [vaccineDate, setVaccineDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [vaccineDose, setVaccineDose] = useState("Dosis anual");

  const patient = db.patients.find((p) => p.id === params.id);
  if (!patient) return null;

  function handleAddAllergy(event: FormEvent) {
    event.preventDefault();
    if (!patient || !allergySubstance.trim()) return;
    addAllergy(patient.id, {
      substance: allergySubstance.trim(),
      reaction: allergyReaction.trim() || "Reacción adversa referida",
      severity: allergySeverity,
    });
    setAllergySubstance("");
    setAllergyReaction("");
  }

  function handleAddHistoryItem(key: HistoryCategoryKey, event: FormEvent) {
    event.preventDefault();
    if (!patient) return;
    const text = newEntries[key].trim();
    if (!text) return;

    const updated: MedicalHistory = {
      ...patient.history,
      [key]: [...patient.history[key], text],
    };
    updateHistory(patient.id, updated);
    setNewEntries((prev) => ({ ...prev, [key]: "" }));
  }

  function handleRemoveHistoryItem(key: HistoryCategoryKey, idx: number) {
    if (!patient) return;
    const updated: MedicalHistory = {
      ...patient.history,
      [key]: patient.history[key].filter((_, i) => i !== idx),
    };
    updateHistory(patient.id, updated);
  }

  function handleAddVaccine(event: FormEvent) {
    event.preventDefault();
    if (!patient || !vaccineName.trim()) return;
    const updated: MedicalHistory = {
      ...patient.history,
      vaccines: [
        ...patient.history.vaccines,
        {
          id: createVaccineId(),
          name: vaccineName.trim(),
          date: vaccineDate,
          dose: vaccineDose.trim() || "Única",
        },
      ],
    };
    updateHistory(patient.id, updated);
    setVaccineName("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Antecedentes, Alergias y Vacunas
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cualquier cambio en alergias se refleja inmediatamente en el banner
          superior de seguridad.
        </p>
      </div>

      {/* Gestión de Alergias */}
      <Card className="border-clinical-critical/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert
              className="text-clinical-critical h-5 w-5"
              strokeWidth={1.75}
            />
            <CardTitle>Alergias Medicamentosas y Alimentarias</CardTitle>
          </div>
          <Badge
            variant={patient.allergies.length > 0 ? "critical" : "neutral"}
          >
            {patient.allergies.length} registrada
            {patient.allergies.length === 1 ? "" : "s"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.allergies.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              Sin alergias conocidas (NKDA).
            </p>
          ) : (
            <ul className="space-y-2">
              {patient.allergies.map((alg) => (
                <li
                  key={alg.id}
                  className="border-clinical-critical/25 bg-clinical-critical-soft/60 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs"
                >
                  <div>
                    <span className="text-clinical-critical-foreground font-bold">
                      {alg.substance}
                    </span>
                    <span className="text-clinical-critical-foreground/70 mx-2">
                      ·
                    </span>
                    <span className="text-clinical-critical-foreground">
                      {alg.reaction} ({alg.severity})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAllergy(patient.id, alg.id)}
                    aria-label={`Eliminar alergia a ${alg.substance}`}
                    className="text-clinical-critical-foreground hover:bg-clinical-critical/15 cursor-pointer rounded-lg p-1"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={handleAddAllergy}
            className="border-border grid gap-3 border-t pt-4 sm:grid-cols-12 sm:items-end"
          >
            <div className="sm:col-span-4">
              <FieldLabel htmlFor="alg-sub">Sustancia / Fármaco</FieldLabel>
              <Input
                id="alg-sub"
                value={allergySubstance}
                onChange={(e) => setAllergySubstance(e.target.value)}
                placeholder="Ej. Sulfas / Penicilina"
              />
            </div>
            <div className="sm:col-span-4">
              <FieldLabel htmlFor="alg-react">Reacción</FieldLabel>
              <Input
                id="alg-react"
                value={allergyReaction}
                onChange={(e) => setAllergyReaction(e.target.value)}
                placeholder="Ej. Rash cutáneo"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="alg-sev">Severidad</FieldLabel>
              <Select
                id="alg-sev"
                value={allergySeverity}
                onChange={(e) =>
                  setAllergySeverity(e.target.value as Allergy["severity"])
                }
              >
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="severa">Severa</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="critical" className="w-full">
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                Añadir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Secciones de antecedentes */}
      <div className="grid gap-6 md:grid-cols-2">
        {HISTORY_SECTIONS.map((section) => {
          const items = patient.history[section.key];
          return (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <Badge variant="neutral" className="tabular-nums">
                  {items.length}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-xs">
                    Sin registros en esta sección.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li
                        key={`${section.key}-${idx}`}
                        className="bg-muted/50 text-foreground flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-xs"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveHistoryItem(section.key, idx)
                          }
                          aria-label="Eliminar antecedente"
                          className="text-muted-foreground hover:text-clinical-critical cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form
                  onSubmit={(e) => handleAddHistoryItem(section.key, e)}
                  className="border-border flex gap-2 border-t pt-3"
                >
                  <Input
                    value={newEntries[section.key]}
                    onChange={(e) =>
                      setNewEntries((prev) => ({
                        ...prev,
                        [section.key]: e.target.value,
                      }))
                    }
                    placeholder={section.placeholder}
                    aria-label={section.title}
                  />
                  <Button type="submit" variant="secondary" size="md">
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vacunas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Syringe className="text-primary h-4 w-4" strokeWidth={1.75} />
            <CardTitle>Inmunizaciones / Vacunas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.history.vaccines.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              Sin vacunas registradas.
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-3">
              {patient.history.vaccines.map((vac) => (
                <div
                  key={vac.id}
                  className="border-border bg-muted/40 rounded-xl border p-3 text-xs"
                >
                  <p className="text-foreground font-bold">{vac.name}</p>
                  <p className="text-muted-foreground mt-0.5 tabular-nums">
                    {formatClinicalDate(vac.date)} · {vac.dose}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleAddVaccine}
            className="border-border grid gap-3 border-t pt-4 sm:grid-cols-12 sm:items-end"
          >
            <div className="sm:col-span-5">
              <FieldLabel htmlFor="vac-name">Vacuna</FieldLabel>
              <Input
                id="vac-name"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                placeholder="Ej. Neumococo / COVID-19 / Influenza"
              />
            </div>
            <div className="sm:col-span-3">
              <FieldLabel htmlFor="vac-date">Fecha</FieldLabel>
              <Input
                id="vac-date"
                type="date"
                className="tabular-nums"
                value={vaccineDate}
                onChange={(e) => setVaccineDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="vac-dose">Dosis</FieldLabel>
              <Input
                id="vac-dose"
                value={vaccineDose}
                onChange={(e) => setVaccineDose(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" className="w-full">
                Registrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
