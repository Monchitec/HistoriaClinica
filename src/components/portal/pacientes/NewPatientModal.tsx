"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Avatar } from "@/components/shared/ui/Avatar";
import { Button } from "@/components/shared/ui/Button";
import { FieldLabel, Input, Select } from "@/components/shared/ui/Input";
import { Modal } from "@/components/shared/ui/Modal";
import { compressImageFile } from "@/lib/format/image-compression";
import type { BiologicalSex, InsuranceType } from "@/types/clinical";

interface NewPatientModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewPatientModal({ open, onClose }: NewPatientModalProps) {
  const router = useRouter();
  const { createPatient } = useHce();

  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [birthDate, setBirthDate] = useState("1975-01-15");
  const [sex, setSex] = useState<BiologicalSex>("F");
  const [phone, setPhone] = useState("");
  const [insurance, setInsurance] = useState<InsuranceType>("EsSalud");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [photoUrl, setPhotoUrl] = useState("");
  const [initialAllergy, setInitialAllergy] = useState("");
  const [initialDiagnosisCode, setInitialDiagnosisCode] = useState("");
  const [initialDiagnosisDesc, setInitialDiagnosisDesc] = useState("");
  const [error, setError] = useState("");

  function resetFields() {
    setFullName("");
    setDni("");
    setBirthDate("1975-01-15");
    setSex("F");
    setPhone("");
    setInsurance("EsSalud");
    setBloodGroup("O+");
    setPhotoUrl("");
    setInitialAllergy("");
    setInitialDiagnosisCode("");
    setInitialDiagnosisDesc("");
    setError("");
  }

  async function handlePhotoSelected(file?: File) {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxDimension: 320 });
      setPhotoUrl(compressed);
    } catch {
      setError("No se pudo procesar la foto seleccionada.");
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

    const created = createPatient({
      fullName,
      dni,
      birthDate,
      sex,
      phone,
      insurance,
      bloodGroup,
      photoUrl: photoUrl.trim() || undefined,
      initialAllergy,
      initialDiagnosisCode,
      initialDiagnosisDesc,
    });

    resetFields();
    onClose();
    router.push(`/portal/pacientes/${created.id}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar nuevo paciente"
      description="Se generará un identificador UUID único y su Historia Clínica Electrónica."
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
          <div className="flex items-center gap-3">
            <Avatar
              src={photoUrl || undefined}
              name={fullName || "Nuevo Paciente"}
              size="lg"
            />
            <div>
              <p className="text-foreground text-xs font-semibold">
                Fotografía del paciente (opcional)
              </p>
              <p className="text-muted-foreground text-[11px]">
                Se optimiza automáticamente para identificación rápida en
                historia clínica.
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
              <span>Subir foto</span>
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
            <FieldLabel htmlFor="np-name" required>
              Apellidos y nombres completos
            </FieldLabel>
            <Input
              id="np-name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej. Luis Alberto Torres Rojas"
            />
          </div>

          <div>
            <FieldLabel htmlFor="np-dni" required>
              DNI / Documento
            </FieldLabel>
            <Input
              id="np-dni"
              className="tabular-nums"
              value={dni}
              onChange={(e) => {
                setDni(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej. 41258963"
            />
          </div>

          <div>
            <FieldLabel htmlFor="np-birth" required>
              Fecha de nacimiento
            </FieldLabel>
            <Input
              id="np-birth"
              type="date"
              className="tabular-nums"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="np-sex">Sexo biológico</FieldLabel>
            <Select
              id="np-sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as BiologicalSex)}
            >
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Select>
          </div>

          <div>
            <FieldLabel htmlFor="np-insurance">Cobertura / Seguro</FieldLabel>
            <Select
              id="np-insurance"
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
            <FieldLabel htmlFor="np-phone">Teléfono de contacto</FieldLabel>
            <Input
              id="np-phone"
              className="tabular-nums"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 987 654 321"
            />
          </div>

          <div>
            <FieldLabel htmlFor="np-blood">Grupo sanguíneo</FieldLabel>
            <Select
              id="np-blood"
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

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="np-allergy">
              Alergias medicamentosas (opcional)
            </FieldLabel>
            <Input
              id="np-allergy"
              value={initialAllergy}
              onChange={(e) => setInitialAllergy(e.target.value)}
              placeholder="Ej. Penicilina, Sulfas (dejar vacío si niega)"
            />
          </div>

          <div>
            <FieldLabel htmlFor="np-dx-code">
              CIE-10 inicial (opcional)
            </FieldLabel>
            <Input
              id="np-dx-code"
              className="font-mono uppercase"
              value={initialDiagnosisCode}
              onChange={(e) => setInitialDiagnosisCode(e.target.value)}
              placeholder="Ej. E11.9"
            />
          </div>

          <div>
            <FieldLabel htmlFor="np-dx-desc">
              Diagnóstico inicial (opcional)
            </FieldLabel>
            <Input
              id="np-dx-desc"
              value={initialDiagnosisDesc}
              onChange={(e) => setInitialDiagnosisDesc(e.target.value)}
              placeholder="Ej. Diabetes Mellitus Tipo 2"
            />
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
          <Button type="submit">Crear historia clínica</Button>
        </div>
      </form>
    </Modal>
  );
}
