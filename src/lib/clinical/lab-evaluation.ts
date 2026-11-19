import { getLabDefinition } from "@/data/lab-catalog";
import type {
  ClinicalStatus,
  LabResult,
  LabTestDefinition,
} from "@/types/clinical";

export interface LabEvaluation {
  status: ClinicalStatus;
  label: "Normal" | "Límite" | "Alto" | "Bajo" | "Crítico";
  direction: "normal" | "high" | "low";
  summary: string;
}

export function evaluateLabValue(
  value: number,
  refMin: number,
  refMax: number,
  definition?: LabTestDefinition,
): LabEvaluation {
  if (value >= refMin && value <= refMax) {
    return {
      status: "normal",
      label: "Normal",
      direction: "normal",
      summary: "Dentro del rango de referencia",
    };
  }

  if (value > refMax) {
    if (
      definition?.criticalHigh !== undefined &&
      value >= definition.criticalHigh
    ) {
      return {
        status: "critical",
        label: "Alto",
        direction: "high",
        summary: `Por encima del límite crítico (>= ${definition.criticalHigh})`,
      };
    }
    if (
      definition?.warningHigh !== undefined &&
      value <= definition.warningHigh
    ) {
      return {
        status: "warning",
        label: "Límite",
        direction: "high",
        summary: "Ligeramente elevado (zona de atención)",
      };
    }
    const ratio = refMax > 0 ? value / refMax : 1.5;
    return {
      status: ratio >= 1.25 ? "critical" : "warning",
      label: ratio >= 1.25 ? "Alto" : "Límite",
      direction: "high",
      summary: "Por encima del rango de referencia",
    };
  }

  // value < refMin
  if (
    definition?.criticalLow !== undefined &&
    value <= definition.criticalLow
  ) {
    return {
      status: "critical",
      label: "Bajo",
      direction: "low",
      summary: `Por debajo del límite crítico (<= ${definition.criticalLow})`,
    };
  }
  if (definition?.warningLow !== undefined && value >= definition.warningLow) {
    return {
      status: "warning",
      label: "Límite",
      direction: "low",
      summary: "Ligeramente disminuido (zona de atención)",
    };
  }

  return {
    status: "warning",
    label: "Bajo",
    direction: "low",
    summary: "Por debajo del rango de referencia",
  };
}

export function evaluateLabResult(result: LabResult): LabEvaluation {
  const def = getLabDefinition(result.testCode);
  return evaluateLabValue(result.value, result.refMin, result.refMax, def);
}
