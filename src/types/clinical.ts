export type BiologicalSex = "M" | "F";

export type InsuranceType = "SIS" | "EsSalud" | "Privado" | "Particular";

export type ClinicalStatus = "normal" | "warning" | "critical";

export type LabPanelCategory =
  | "Glucemia"
  | "Renal"
  | "Lipídico"
  | "Hepático"
  | "Hemograma"
  | "Tiroideo"
  | "Electrolitos";

export interface Diagnosis {
  id: string;
  code: string;
  description: string;
  diagnosedAt: string;
  status: "activo" | "controlado" | "resuelto";
  notes?: string;
}

export interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: "leve" | "moderada" | "severa";
}

export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  dose: string;
}

export interface MedicalHistory {
  pathological: string[];
  surgical: string[];
  family: string[];
  habits: string[];
  vaccines: VaccineRecord[];
}

export interface Patient {
  id: string;
  hcNumber: string;
  dni: string;
  fullName: string;
  birthDate: string;
  sex: BiologicalSex;
  phone: string;
  insurance: InsuranceType;
  bloodGroup: string;
  photoUrl?: string;
  allergies: Allergy[];
  diagnoses: Diagnosis[];
  history: MedicalHistory;
  updatedAt: string;
}

export interface LabTestDefinition {
  code: string;
  name: string;
  shortName: string;
  category: LabPanelCategory;
  unit: string;
  refMin: number;
  refMax: number;
  warningHigh?: number;
  criticalHigh?: number;
  warningLow?: number;
  criticalLow?: number;
  scaleMin: number;
  scaleMax: number;
  specimen: string;
  clinicalGuidance: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testCode: string;
  testName: string;
  category: LabPanelCategory;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  collectedAt: string;
  reportedAt: string;
  orderedBy: string;
  laboratory: string;
  specimen: string;
  status: "Final" | "Pendiente";
  notes?: string;
}

export interface VitalSign {
  id: string;
  patientId: string;
  recordedAt: string;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperatureC: number;
  respiratoryRate: number;
  spo2: number;
  weightKg: number;
  heightCm: number;
}

export interface SoapNote {
  id: string;
  patientId: string;
  date: string;
  reason: string;
  subjective: string;
  objective: string;
  analysis: string;
  plan: string;
  author: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  indication: string;
  startedAt: string;
  status: "activo" | "suspendido";
  notes?: string;
}

export type DiagnosticModality =
  "Rayos X" | "Ecografía" | "Tomografía" | "Resonancia" | "Electrocardiograma";

export interface DiagnosticStudy {
  id: string;
  patientId: string;
  modality: DiagnosticModality;
  studyName: string;
  region: string;
  performedAt: string;
  reportedAt: string;
  orderedBy: string;
  radiologist: string;
  facility: string;
  findings: string;
  conclusion: string;
  status: ClinicalStatus;
  imageUrl?: string;
  studyUid?: string;
}

export interface DoctorSession {
  email: string;
  name: string;
  specialty: string;
  cmp: string;
  hospital: string;
  photoUrl?: string;
}

export interface HceDatabase {
  patients: Patient[];
  labResults: LabResult[];
  vitals: VitalSign[];
  soapNotes: SoapNote[];
  medications: Medication[];
  diagnosticStudies: DiagnosticStudy[];
}
