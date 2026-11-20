"use client";

import { useState, type FormEvent } from "react";
import { Camera } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Avatar } from "@/components/shared/ui/Avatar";
import { Button } from "@/components/shared/ui/Button";
import { FieldLabel, Input, Select } from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import { compressImageFile } from "@/lib/format/image-compression";
import type { BiologicalSex, InsuranceType, Patient } from "@/types/clinical";

interface EditPatientModalProps {
  patient: Patient | null;
  onClose: () => void;
}

function EditPatientForm({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  const { updatePatient } = useHce();

  const [fullName, setFullName] = useState(patient.fullName);
  const [dni, setDni] = useState(patient.dni);
  const [hcNumber, setHcNumber] = useState(patient.hcNumber);
  const [birthDate, setBirthDate] = useState(patient.birthDate);
  const [sex, setSex] = useState<BiologicalSex>(patient.sex);
  const [phone, setPhone] = useState(
    patient.phone === "Sin teléfono" ? "" : patient.phone,
  );
  const [insurance, setInsurance] = useState<InsuranceType>(patient.insurance);
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup);
  const [photoUrl, setPhotoUrl] = useState(patient.photoUrl ?? "");
  const [error, setError] = useState("");

  async function handlePhotoSelected(file?: File) {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxDimension: 320 });
      setPhotoUrl(compressed);
    } catch {
      setError("No se pudo procesar la fotografía seleccionada.");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim()) {
      setError("El nombre completo del paciente es obligatorio.");
      return;
    }
    if (!/^\d{8,12}$/.test(dni.trim())) {
      setError("Ingresa un DNI o documento válido (8 a 12 dígitos).");
      return;
    }
    if (!birthDate) {
      setError("Selecciona la fecha de nacimiento.");
      return;
    }

    updatePatient(patient.id, {
      fullName,
      dni,
      hcNumber,
      birthDate,
      sex,
      phone,
      insurance,
      bloodGroup,
      photoUrl,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
        <div className="flex items-center gap-3">
          <Avatar
            src={photoUrl || undefined}
            name={fullName || patient.fullName}
            size="lg"
          />
          <div>
            <p className="text-foreground text-xs font-semibold">
              Fotografía del paciente
            </p>
            <p className="text-muted-foreground text-[11px]">
              Visible en el banner clínico y listado de pacientes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {photoUrl && (
            <Button variant="ghost" size="sm" onClick={() => setPhotoUrl("")}>
              Quitar
            </Button>
          )}
          <label className="border-border bg-card text-foreground hover:bg-muted focus-within:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors focus-within:ring-2">
            <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Cambiar foto</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                void handlePhotoSelected(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="ep-name" required>
            Apellidos y nombres completos
          </FieldLabel>
          <Input
            id="ep-name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError("");
            }}
          />
        </div>

        <div>
          <FieldLabel htmlFor="ep-dni" required>
            DNI / Documento
          </FieldLabel>
          <Input
            id="ep-dni"
            className="tabular-nums"
            value={dni}
            onChange={(e) => {
              setDni(e.target.value);
              if (error) setError("");
            }}
          />
        </div>

        <div>
          <FieldLabel htmlFor="ep-hc">N° Historia Clínica</FieldLabel>
          <Input
            id="ep-hc"
            className="font-mono tabular-nums"
            value={hcNumber}
            onChange={(e) => setHcNumber(e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="ep-birth" required>
            Fecha de nacimiento
          </FieldLabel>
          <Input
            id="ep-birth"
            type="date"
            className="tabular-nums"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="ep-sex">Sexo biológico</FieldLabel>
          <Select
            id="ep-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value as BiologicalSex)}
          >
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </Select>
        </div>

        <div>
          <FieldLabel htmlFor="ep-insurance">Cobertura / Seguro</FieldLabel>
          <Select
            id="ep-insurance"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value as InsuranceType)}
          >
            <option value="EsSalud">EsSalud</option>
            <option value="SIS">SIS</option>
            <option value="Privado">Privado / EPS</option>
            <option value="Particular">Particular</option>
          </Select>
        </div>

        <div>
          <FieldLabel htmlFor="ep-phone">Teléfono de contacto</FieldLabel>
          <Input
            id="ep-phone"
            className="tabular-nums"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. 987 654 321"
          />
        </div>

        <div>
          <FieldLabel htmlFor="ep-blood">Grupo sanguíneo</FieldLabel>
          <Select
            id="ep-blood"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </Select>
        </div>
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
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  );
}

export function EditPatientModal({ patient, onClose }: EditPatientModalProps) {
  return (
    <Modal
      open={Boolean(patient)}
      onClose={onClose}
      title="Editar datos del paciente"
      description={
        patient
          ? `Actualiza los datos de filiación de ${patient.fullName}.`
          : undefined
      }
      maxWidthClass="max-w-2xl"
    >
      {patient && (
        <EditPatientForm key={patient.id} patient={patient} onClose={onClose} />
      )}
    </Modal>
  );
}
