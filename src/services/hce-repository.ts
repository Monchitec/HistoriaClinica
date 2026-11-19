import { INITIAL_DEMO_DB } from "@/data/demo-patients";
import { getLabDefinition } from "@/data/lab-catalog";
import {
  calculateAge,
  calculateEgfrCkdEpi2021,
} from "@/lib/clinical/calculators";
import type {
  Allergy,
  ClinicalStatus,
  Diagnosis,
  DiagnosticStudy,
  DoctorSession,
  HceDatabase,
  LabResult,
  MedicalHistory,
  Medication,
  Patient,
  SoapNote,
  VitalSign,
} from "@/types/clinical";

const DB_STORAGE_KEY = "rubi_hce_db_v1";
const SESSION_STORAGE_KEY = "rubi_hce_session_v1";

export const DEFAULT_DOCTOR_SESSION: DoctorSession = {
  email: "medico@rubihce.pe",
  name: "Dra. Rubí Collahua",
  specialty: "Medicina Interna",
  cmp: "CMP 068412",
  hospital: "Servicio de Medicina Interna — Lima",
  photoUrl: "/images/demo/doctor-rubi.jpg",
};

function createUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const val = char === "x" ? rand : (rand & 0x3) | 0x8;
    return val.toString(16);
  });
}

function cloneDemoDb(): HceDatabase {
  return JSON.parse(JSON.stringify(INITIAL_DEMO_DB)) as HceDatabase;
}

function readDb(): HceDatabase {
  if (typeof window === "undefined") {
    return cloneDemoDb();
  }
  try {
    const raw = window.localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      const seeded = cloneDemoDb();
      window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<HceDatabase>;
    const demoSeed = cloneDemoDb();
    const demoPhotoMap = new Map(
      demoSeed.patients.map((p) => [p.id, p.photoUrl]),
    );

    // Migración suave para navegadores con datos previos en localStorage
    const existingPatients = parsed.patients ?? demoSeed.patients;
    const existingPatientIds = new Set(existingPatients.map((p) => p.id));
    const missingDemoPatients = demoSeed.patients.filter(
      (p) => !existingPatientIds.has(p.id),
    );
    const missingDemoPatientIds = new Set(missingDemoPatients.map((p) => p.id));

    const hydratedPatients = [
      ...existingPatients.map((p) =>
        p.photoUrl ? p : { ...p, photoUrl: demoPhotoMap.get(p.id) },
      ),
      ...missingDemoPatients,
    ];

    const mergeMissingByPatient = <T extends { id: string; patientId: string }>(
      existingList: T[] | undefined,
      seedList: T[],
    ): T[] => {
      if (!existingList) return seedList;
      if (missingDemoPatientIds.size === 0) return existingList;
      const existingIds = new Set(existingList.map((item) => item.id));
      const additions = seedList.filter(
        (item) =>
          missingDemoPatientIds.has(item.patientId) &&
          !existingIds.has(item.id),
      );
      return [...existingList, ...additions];
    };

    return {
      patients: hydratedPatients,
      labResults: mergeMissingByPatient(parsed.labResults, demoSeed.labResults),
      vitals: mergeMissingByPatient(parsed.vitals, demoSeed.vitals),
      soapNotes: mergeMissingByPatient(parsed.soapNotes, demoSeed.soapNotes),
      medications: mergeMissingByPatient(
        parsed.medications,
        demoSeed.medications,
      ),
      diagnosticStudies: mergeMissingByPatient(
        parsed.diagnosticStudies,
        demoSeed.diagnosticStudies,
      ),
    };
  } catch {
    return cloneDemoDb();
  }
}

function writeDb(db: HceDatabase): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

export interface CreatePatientInput {
  fullName: string;
  dni: string;
  birthDate: string;
  sex: Patient["sex"];
  phone: string;
  insurance: Patient["insurance"];
  bloodGroup: string;
  photoUrl?: string;
  hcNumber?: string;
  initialAllergy?: string;
  initialDiagnosisCode?: string;
  initialDiagnosisDesc?: string;
}

export interface CreateDiagnosticStudyInput {
  patientId: string;
  modality: DiagnosticStudy["modality"];
  studyName: string;
  region: string;
  performedAt: string;
  orderedBy: string;
  radiologist: string;
  facility: string;
  findings: string;
  conclusion: string;
  status: ClinicalStatus;
  imageUrl?: string;
}

export interface CreateLabResultInput {
  patientId: string;
  testCode: string;
  value: number;
  collectedAt: string;
  orderedBy: string;
  laboratory: string;
  notes?: string;
  autoCalculateEgfr?: boolean;
}

export const hceRepository = {
  getDatabase(): HceDatabase {
    return readDb();
  },

  resetDemoData(): HceDatabase {
    const fresh = cloneDemoDb();
    writeDb(fresh);
    return fresh;
  },

  getSession(): DoctorSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DoctorSession;
      if (!parsed.photoUrl && parsed.email === DEFAULT_DOCTOR_SESSION.email) {
        return { ...parsed, photoUrl: DEFAULT_DOCTOR_SESSION.photoUrl };
      }
      return parsed;
    } catch {
      return null;
    }
  },

  updateDoctorPhoto(photoUrl?: string): DoctorSession | null {
    const current = this.getSession();
    if (!current) return null;
    const updated: DoctorSession = {
      ...current,
      photoUrl: photoUrl?.trim() || undefined,
    };
    this.saveSession(updated);
    return updated;
  },

  saveSession(session: DoctorSession): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  createPatient(input: CreatePatientInput): {
    db: HceDatabase;
    patient: Patient;
  } {
    const db = readDb();
    const nowIso = new Date().toISOString();
    const nextNumber = String(db.patients.length + 450).padStart(4, "0");

    const allergies: Allergy[] = input.initialAllergy?.trim()
      ? [
          {
            id: createUuid(),
            substance: input.initialAllergy.trim(),
            reaction: "Referida en filiación inicial",
            severity: "moderada",
          },
        ]
      : [];

    const diagnoses: Diagnosis[] = input.initialDiagnosisDesc?.trim()
      ? [
          {
            id: createUuid(),
            code: input.initialDiagnosisCode?.trim().toUpperCase() || "Z00.0",
            description: input.initialDiagnosisDesc.trim(),
            diagnosedAt: nowIso.slice(0, 10),
            status: "activo",
          },
        ]
      : [];

    const patient: Patient = {
      id: createUuid(),
      hcNumber: input.hcNumber?.trim() || `HC-2026-${nextNumber}`,
      dni: input.dni.trim(),
      fullName: input.fullName.trim(),
      birthDate: input.birthDate,
      sex: input.sex,
      phone: input.phone.trim() || "Sin teléfono",
      insurance: input.insurance,
      bloodGroup: input.bloodGroup || "O+",
      photoUrl: input.photoUrl?.trim() || undefined,
      allergies,
      diagnoses,
      history: {
        pathological: [],
        surgical: [],
        family: [],
        habits: [],
        vaccines: [],
      },
      updatedAt: nowIso,
    };

    const nextDb: HceDatabase = {
      ...db,
      patients: [patient, ...db.patients],
    };
    writeDb(nextDb);
    return { db: nextDb, patient };
  },

  addLabResult(input: CreateLabResultInput): {
    db: HceDatabase;
    created: LabResult[];
  } {
    const db = readDb();
    const def = getLabDefinition(input.testCode);
    const patient = db.patients.find((p) => p.id === input.patientId);
    const nowIso = new Date().toISOString();

    const mainResult: LabResult = {
      id: createUuid(),
      patientId: input.patientId,
      testCode: input.testCode,
      testName: def?.name ?? input.testCode,
      category: def?.category ?? "Glucemia",
      value: input.value,
      unit: def?.unit ?? "",
      refMin: def?.refMin ?? 0,
      refMax: def?.refMax ?? 100,
      collectedAt: input.collectedAt,
      reportedAt: nowIso,
      orderedBy: input.orderedBy,
      laboratory: input.laboratory.trim() || "Laboratorio Externo",
      specimen: def?.specimen ?? "Suero",
      status: "Final",
      notes: input.notes?.trim() || undefined,
    };

    const created: LabResult[] = [mainResult];

    if (
      input.testCode === "CREAT" &&
      input.autoCalculateEgfr !== false &&
      patient &&
      input.value > 0
    ) {
      const age = calculateAge(patient.birthDate);
      const egfrVal = calculateEgfrCkdEpi2021(
        input.value,
        age || 50,
        patient.sex,
      );
      const egfrDef = getLabDefinition("TFGE");
      created.push({
        id: createUuid(),
        patientId: input.patientId,
        testCode: "TFGE",
        testName:
          egfrDef?.name ??
          "TASA DE FILTRACIÓN GLOMERULAR ESTIMADA (CKD-EPI 2021)",
        category: "Renal",
        value: egfrVal,
        unit: egfrDef?.unit ?? "mL/min/1.73m²",
        refMin: egfrDef?.refMin ?? 60,
        refMax: egfrDef?.refMax ?? 120,
        collectedAt: input.collectedAt,
        reportedAt: nowIso,
        orderedBy: input.orderedBy,
        laboratory: "Cálculo automático Rubí HCE (CKD-EPI 2021)",
        specimen: "Calculado (Creatinina + Edad + Sexo)",
        status: "Final",
        notes: `Calculado automáticamente a partir de Creatinina ${input.value} mg/dL.`,
      });
    }

    const nextDb: HceDatabase = {
      ...db,
      labResults: [...created, ...db.labResults],
      patients: db.patients.map((p) =>
        p.id === input.patientId ? { ...p, updatedAt: nowIso } : p,
      ),
    };
    writeDb(nextDb);
    return { db: nextDb, created };
  },

  addSoapNote(note: Omit<SoapNote, "id">): HceDatabase {
    const db = readDb();
    const created: SoapNote = { ...note, id: createUuid() };
    const nextDb: HceDatabase = {
      ...db,
      soapNotes: [created, ...db.soapNotes],
      patients: db.patients.map((p) =>
        p.id === note.patientId ? { ...p, updatedAt: note.date } : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  addVitalSign(vital: Omit<VitalSign, "id">): HceDatabase {
    const db = readDb();
    const created: VitalSign = { ...vital, id: createUuid() };
    const nextDb: HceDatabase = {
      ...db,
      vitals: [created, ...db.vitals],
      patients: db.patients.map((p) =>
        p.id === vital.patientId ? { ...p, updatedAt: vital.recordedAt } : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  addMedication(med: Omit<Medication, "id">): HceDatabase {
    const db = readDb();
    const created: Medication = { ...med, id: createUuid() };
    const nextDb: HceDatabase = {
      ...db,
      medications: [created, ...db.medications],
    };
    writeDb(nextDb);
    return nextDb;
  },

  toggleMedicationStatus(medicationId: string): HceDatabase {
    const db = readDb();
    const nextDb: HceDatabase = {
      ...db,
      medications: db.medications.map((m) =>
        m.id === medicationId
          ? { ...m, status: m.status === "activo" ? "suspendido" : "activo" }
          : m,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  addDiagnosis(
    patientId: string,
    diagnosis: Omit<Diagnosis, "id">,
  ): HceDatabase {
    const db = readDb();
    const created: Diagnosis = { ...diagnosis, id: createUuid() };
    const nextDb: HceDatabase = {
      ...db,
      patients: db.patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              diagnoses: [created, ...p.diagnoses],
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  addAllergy(patientId: string, allergy: Omit<Allergy, "id">): HceDatabase {
    const db = readDb();
    const created: Allergy = { ...allergy, id: createUuid() };
    const nextDb: HceDatabase = {
      ...db,
      patients: db.patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              allergies: [...p.allergies, created],
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  removeAllergy(patientId: string, allergyId: string): HceDatabase {
    const db = readDb();
    const nextDb: HceDatabase = {
      ...db,
      patients: db.patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              allergies: p.allergies.filter((a) => a.id !== allergyId),
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  updateHistory(patientId: string, history: MedicalHistory): HceDatabase {
    const db = readDb();
    const nextDb: HceDatabase = {
      ...db,
      patients: db.patients.map((p) =>
        p.id === patientId
          ? { ...p, history, updatedAt: new Date().toISOString() }
          : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  updatePatientPhoto(patientId: string, photoUrl?: string): HceDatabase {
    const db = readDb();
    const nextDb: HceDatabase = {
      ...db,
      patients: db.patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              photoUrl: photoUrl?.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    };
    writeDb(nextDb);
    return nextDb;
  },

  addDiagnosticStudy(input: CreateDiagnosticStudyInput): {
    db: HceDatabase;
    study: DiagnosticStudy;
  } {
    const db = readDb();
    const nowIso = new Date().toISOString();
    const study: DiagnosticStudy = {
      id: createUuid(),
      patientId: input.patientId,
      modality: input.modality,
      studyName: input.studyName.trim(),
      region: input.region.trim(),
      performedAt: input.performedAt,
      reportedAt: nowIso,
      orderedBy: input.orderedBy.trim() || DEFAULT_DOCTOR_SESSION.name,
      radiologist:
        input.radiologist.trim() || "Servicio de Diagnóstico por Imágenes",
      facility: input.facility.trim() || "Centro de Imágenes Almenara — Lima",
      findings: input.findings.trim(),
      conclusion: input.conclusion.trim(),
      status: input.status,
      imageUrl: input.imageUrl?.trim() || undefined,
      studyUid: `1.2.840.113619.2.55.${Date.now()}`,
    };

    const nextDb: HceDatabase = {
      ...db,
      diagnosticStudies: [study, ...db.diagnosticStudies],
      patients: db.patients.map((p) =>
        p.id === input.patientId ? { ...p, updatedAt: nowIso } : p,
      ),
    };
    writeDb(nextDb);
    return { db: nextDb, study };
  },
};
