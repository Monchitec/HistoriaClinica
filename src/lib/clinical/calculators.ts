import type { BiologicalSex } from "@/types/clinical";

export function calculateAge(
  birthDateIso: string,
  referenceDate: Date = new Date(),
): number {
  const birth = new Date(`${birthDateIso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

export interface BmiAssessment {
  bmi: number;
  category: string;
}

export function calculateBmi(
  weightKg: number,
  heightCm: number,
): BmiAssessment {
  if (weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, category: "Sin datos" };
  }
  const heightM = heightCm / 100;
  const raw = weightKg / (heightM * heightM);
  const bmi = Number(raw.toFixed(1));

  if (bmi < 18.5) return { bmi, category: "Bajo peso" };
  if (bmi < 25) return { bmi, category: "Normal" };
  if (bmi < 30) return { bmi, category: "Sobrepeso" };
  if (bmi < 35) return { bmi, category: "Obesidad I" };
  if (bmi < 40) return { bmi, category: "Obesidad II" };
  return { bmi, category: "Obesidad III" };
}

/**
 * Fórmula CKD-EPI 2021 (libre de factor racial) para TFGe en adultos.
 */
export function calculateEgfrCkdEpi2021(
  creatinineMgDl: number,
  ageYears: number,
  sex: BiologicalSex,
): number {
  if (creatinineMgDl <= 0 || ageYears <= 0) return 0;

  const kappa = sex === "F" ? 0.7 : 0.9;
  const alpha = sex === "F" ? -0.241 : -0.302;
  const sexMultiplier = sex === "F" ? 1.012 : 1.0;

  const ratio = creatinineMgDl / kappa;
  const minPart = Math.pow(Math.min(ratio, 1), alpha);
  const maxPart = Math.pow(Math.max(ratio, 1), -1.2);
  const agePart = Math.pow(0.9938, ageYears);

  const egfr = 142 * minPart * maxPart * agePart * sexMultiplier;
  return Number(egfr.toFixed(1));
}

export function classifyCkdStage(egfr: number): string {
  if (egfr >= 90) return "G1 (Normal o alta)";
  if (egfr >= 60) return "G2 (Levemente disminuida)";
  if (egfr >= 45) return "G3a (Leve a moderadamente disminuida)";
  if (egfr >= 30) return "G3b (Moderada a gravemente disminuida)";
  if (egfr >= 15) return "G4 (Gravemente disminuida)";
  return "G5 (Falla renal)";
}

export function classifyBloodPressure(
  systolic: number,
  diastolic: number,
): {
  label: string;
  status: "normal" | "warning" | "critical";
} {
  if (systolic >= 180 || diastolic >= 120) {
    return { label: "Crisis hipertensiva", status: "critical" };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { label: "HTA Estadio 2", status: "critical" };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { label: "HTA Estadio 1", status: "warning" };
  }
  if (systolic >= 120 && diastolic < 80) {
    return { label: "Elevada", status: "warning" };
  }
  return { label: "Normal", status: "normal" };
}
