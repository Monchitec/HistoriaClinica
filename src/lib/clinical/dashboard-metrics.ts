import {
  calculateAge,
  classifyBloodPressure,
} from "@/lib/clinical/calculators";
import {
  evaluateLabResult,
  type LabEvaluation,
} from "@/lib/clinical/lab-evaluation";
import type {
  ClinicalStatus,
  HceDatabase,
  InsuranceType,
  LabPanelCategory,
  LabResult,
  Patient,
  VitalSign,
} from "@/types/clinical";

export type DonutMetricMode =
  "estado" | "laboratorio" | "presion" | "cobertura";

export interface PatientClinicalAlert {
  lab: LabResult;
  patient: Patient;
  evaluation: LabEvaluation;
}

export interface DonutSegment {
  id: string;
  label: string;
  description: string;
  count: number;
  percentage: number;
  colorVar: string;
  badgeVariant: "neutral" | "primary" | ClinicalStatus;
  patients: Array<{
    id: string;
    fullName: string;
    hcNumber: string;
  }>;
}

export interface DonutBreakdown {
  mode: DonutMetricMode;
  title: string;
  subtitle: string;
  centerLabel: string;
  centerValue: string;
  totalUnits: number;
  unitLabel: string;
  segments: DonutSegment[];
}

export interface LabPanelSummary {
  category: LabPanelCategory;
  normal: number;
  warning: number;
  critical: number;
  total: number;
  normalRatePct: number;
}

export interface MonthlyActivityPoint {
  monthKey: string;
  label: string;
  normalLabs: number;
  alteredLabs: number;
  soapNotes: number;
  totalEvents: number;
}

export interface DiagnosisPrevalenceItem {
  code: string;
  description: string;
  patientCount: number;
  percentage: number;
  activeCount: number;
}

export interface ClinicalKpiSummary {
  totalPatients: number;
  stablePatientsCount: number;
  warningPatientsCount: number;
  criticalPatientsCount: number;
  controlRatePct: number;
  latestLabsTotal: number;
  latestLabsNormalCount: number;
  labControlRatePct: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;
  totalLabsCount: number;
  totalSoapNotesCount: number;
  totalDiagnosticStudiesCount: number;
  totalClinicalRecords: number;
  activeMedicationsCount: number;
  patientsWithAllergiesCount: number;
  controlledBpCount: number;
  patientsWithVitalsCount: number;
  controlledBpRatePct: number;
  averageAge: number;
  femaleCount: number;
  maleCount: number;
}

const MONTHS_SHORT_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/**
 * Obtiene el último resultado registrado por cada par (paciente, prueba).
 */
export function getLatestLabsPerPatientTest(
  labResults: LabResult[],
): LabResult[] {
  const latestMap = new Map<string, LabResult>();
  const sorted = [...labResults].sort(
    (a, b) =>
      new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
  );

  for (const item of sorted) {
    const key = `${item.patientId}::${item.testCode}`;
    if (!latestMap.has(key)) {
      latestMap.set(key, item);
    }
  }

  return Array.from(latestMap.values());
}

/**
 * Obtiene el último registro de signos vitales por paciente.
 */
export function getLatestVitalPerPatient(
  vitals: VitalSign[],
): Map<string, VitalSign> {
  const latestMap = new Map<string, VitalSign>();
  const sorted = [...vitals].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );

  for (const vital of sorted) {
    if (!latestMap.has(vital.patientId)) {
      latestMap.set(vital.patientId, vital);
    }
  }

  return latestMap;
}

/**
 * Genera la lista de alertas clínicas vigentes ordenadas por severidad y fecha.
 */
export function buildClinicalAlerts(
  patients: Patient[],
  latestLabs: LabResult[],
): PatientClinicalAlert[] {
  const patientMap = new Map(patients.map((p) => [p.id, p]));

  return latestLabs
    .map((lab) => {
      const patient = patientMap.get(lab.patientId);
      if (!patient) return null;
      const evaluation = evaluateLabResult(lab);
      if (evaluation.status === "normal") return null;
      return { lab, patient, evaluation };
    })
    .filter((item): item is PatientClinicalAlert => item !== null)
    .sort((a, b) => {
      if (a.evaluation.status !== b.evaluation.status) {
        return a.evaluation.status === "critical" ? -1 : 1;
      }
      return (
        new Date(b.lab.collectedAt).getTime() -
        new Date(a.lab.collectedAt).getTime()
      );
    });
}

function getPatientOverallStatus(
  patientId: string,
  latestLabs: LabResult[],
  latestVitals: Map<string, VitalSign>,
): ClinicalStatus {
  const patientLabs = latestLabs.filter((l) => l.patientId === patientId);
  const labStatuses = patientLabs.map((l) => evaluateLabResult(l).status);
  const latestVital = latestVitals.get(patientId);
  const bpStatus = latestVital
    ? classifyBloodPressure(latestVital.systolicBp, latestVital.diastolicBp)
        .status
    : "normal";

  if (labStatuses.includes("critical") || bpStatus === "critical") {
    return "critical";
  }
  if (labStatuses.includes("warning") || bpStatus === "warning") {
    return "warning";
  }
  return "normal";
}

function toPatientBrief(patient: Patient) {
  return {
    id: patient.id,
    fullName: patient.fullName,
    hcNumber: patient.hcNumber,
  };
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Construye las distribuciones para la gráfica de torta según el indicador elegido.
 */
export function buildDonutBreakdown(
  mode: DonutMetricMode,
  db: HceDatabase,
  latestLabs: LabResult[],
  latestVitals: Map<string, VitalSign>,
): DonutBreakdown {
  const totalPatients = db.patients.length;

  if (mode === "estado") {
    const groups: Record<ClinicalStatus, Patient[]> = {
      normal: [],
      warning: [],
      critical: [],
    };

    for (const patient of db.patients) {
      const status = getPatientOverallStatus(
        patient.id,
        latestLabs,
        latestVitals,
      );
      groups[status].push(patient);
    }

    const segments: DonutSegment[] = [
      {
        id: "normal",
        label: "Control estable",
        description: "Pruebas vigentes y presión arterial dentro de rango",
        count: groups.normal.length,
        percentage: pct(groups.normal.length, totalPatients),
        colorVar: "var(--clinical-normal)",
        badgeVariant: "normal",
        patients: groups.normal.map(toPatientBrief),
      },
      {
        id: "warning",
        label: "Seguimiento / Límite",
        description: "Valores limítrofes o PA elevada en control ambulatorio",
        count: groups.warning.length,
        percentage: pct(groups.warning.length, totalPatients),
        colorVar: "var(--clinical-warning)",
        badgeVariant: "warning",
        patients: groups.warning.map(toPatientBrief),
      },
      {
        id: "critical",
        label: "Prioridad clínica",
        description: "Resultados fuera de meta crítica o HTA estadio 2",
        count: groups.critical.length,
        percentage: pct(groups.critical.length, totalPatients),
        colorVar: "var(--clinical-critical)",
        badgeVariant: "critical",
        patients: groups.critical.map(toPatientBrief),
      },
    ];

    return {
      mode,
      title: "Estratificación clínica de pacientes",
      subtitle:
        "Clasificación integral según última analítica y presión arterial",
      centerLabel: "Control estable",
      centerValue: `${pct(groups.normal.length, totalPatients)}%`,
      totalUnits: totalPatients,
      unitLabel: "pacientes",
      segments,
    };
  }

  if (mode === "laboratorio") {
    const patientMap = new Map(db.patients.map((p) => [p.id, p]));
    const labGroups: Record<
      ClinicalStatus,
      { count: number; patientsMap: Map<string, Patient> }
    > = {
      normal: { count: 0, patientsMap: new Map() },
      warning: { count: 0, patientsMap: new Map() },
      critical: { count: 0, patientsMap: new Map() },
    };

    for (const lab of latestLabs) {
      const status = evaluateLabResult(lab).status;
      labGroups[status].count += 1;
      const p = patientMap.get(lab.patientId);
      if (p) {
        labGroups[status].patientsMap.set(p.id, p);
      }
    }

    const totalLabs = latestLabs.length;
    const segments: DonutSegment[] = [
      {
        id: "lab-normal",
        label: "En rango de referencia",
        description: "Exámenes vigentes dentro de parámetros normales",
        count: labGroups.normal.count,
        percentage: pct(labGroups.normal.count, totalLabs),
        colorVar: "var(--clinical-normal)",
        badgeVariant: "normal",
        patients: Array.from(labGroups.normal.patientsMap.values()).map(
          toPatientBrief,
        ),
      },
      {
        id: "lab-warning",
        label: "Zona límite / Atención",
        description: "Desviación leve o borderline en seguimiento",
        count: labGroups.warning.count,
        percentage: pct(labGroups.warning.count, totalLabs),
        colorVar: "var(--clinical-warning)",
        badgeVariant: "warning",
        patients: Array.from(labGroups.warning.patientsMap.values()).map(
          toPatientBrief,
        ),
      },
      {
        id: "lab-critical",
        label: "Crítico / Fuera de meta",
        description: "Valores que requieren ajuste terapéutico prioritario",
        count: labGroups.critical.count,
        percentage: pct(labGroups.critical.count, totalLabs),
        colorVar: "var(--clinical-critical)",
        badgeVariant: "critical",
        patients: Array.from(labGroups.critical.patientsMap.values()).map(
          toPatientBrief,
        ),
      },
    ];

    return {
      mode,
      title: "Efectividad analítica de laboratorio",
      subtitle: "Proporción de pruebas vigentes por estado de referencia",
      centerLabel: "En rango",
      centerValue: `${pct(labGroups.normal.count, totalLabs)}%`,
      totalUnits: totalLabs,
      unitLabel: "pruebas",
      segments,
    };
  }

  if (mode === "presion") {
    const bpGroups: Record<
      "normal" | "warning" | "critical" | "missing",
      Patient[]
    > = {
      normal: [],
      warning: [],
      critical: [],
      missing: [],
    };

    for (const patient of db.patients) {
      const vital = latestVitals.get(patient.id);
      if (!vital) {
        bpGroups.missing.push(patient);
        continue;
      }
      const bp = classifyBloodPressure(vital.systolicBp, vital.diastolicBp);
      bpGroups[bp.status].push(patient);
    }

    const withVitals = totalPatients - bpGroups.missing.length;
    const segments: DonutSegment[] = [
      {
        id: "bp-normal",
        label: "PA en meta (<120/80)",
        description: "Normotensión en el último control de consultorio",
        count: bpGroups.normal.length,
        percentage: pct(bpGroups.normal.length, totalPatients),
        colorVar: "var(--clinical-normal)",
        badgeVariant: "normal",
        patients: bpGroups.normal.map(toPatientBrief),
      },
      {
        id: "bp-warning",
        label: "Elevada / HTA Est. 1",
        description: "Sistólica 120–139 o diastólica 80–89 mmHg",
        count: bpGroups.warning.length,
        percentage: pct(bpGroups.warning.length, totalPatients),
        colorVar: "var(--clinical-warning)",
        badgeVariant: "warning",
        patients: bpGroups.warning.map(toPatientBrief),
      },
      {
        id: "bp-critical",
        label: "HTA Est. 2 / Crisis",
        description: "PA ≥ 140/90 mmHg; requiere ajuste terapéutico",
        count: bpGroups.critical.length,
        percentage: pct(bpGroups.critical.length, totalPatients),
        colorVar: "var(--clinical-critical)",
        badgeVariant: "critical",
        patients: bpGroups.critical.map(toPatientBrief),
      },
    ];

    if (bpGroups.missing.length > 0) {
      segments.push({
        id: "bp-missing",
        label: "Sin registro reciente",
        description: "Pacientes sin toma de signos vitales registrada",
        count: bpGroups.missing.length,
        percentage: pct(bpGroups.missing.length, totalPatients),
        colorVar: "var(--muted-foreground)",
        badgeVariant: "neutral",
        patients: bpGroups.missing.map(toPatientBrief),
      });
    }

    return {
      mode,
      title: "Control de presión arterial",
      subtitle: "Distribución según última medición registrada en historia",
      centerLabel: "PA en meta",
      centerValue: `${pct(bpGroups.normal.length, withVitals)}%`,
      totalUnits: totalPatients,
      unitLabel: "pacientes",
      segments,
    };
  }

  const insuranceOrder: Array<{
    type: InsuranceType;
    colorVar: string;
    description: string;
  }> = [
    {
      type: "EsSalud",
      colorVar: "var(--primary)",
      description: "Asegurados en red asistencial EsSalud",
    },
    {
      type: "SIS",
      colorVar: "var(--accent)",
      description: "Cobertura Seguro Integral de Salud",
    },
    {
      type: "Privado",
      colorVar: "var(--secondary-foreground)",
      description: "EPS y seguros privados de salud",
    },
    {
      type: "Particular",
      colorVar: "var(--muted-foreground)",
      description: "Atención ambulatoria particular",
    },
  ];

  const segments: DonutSegment[] = insuranceOrder.map((item) => {
    const matched = db.patients.filter((p) => p.insurance === item.type);
    return {
      id: `ins-${item.type.toLowerCase()}`,
      label: item.type,
      description: item.description,
      count: matched.length,
      percentage: pct(matched.length, totalPatients),
      colorVar: item.colorVar,
      badgeVariant: item.type === "Particular" ? "neutral" : "primary",
      patients: matched.map(toPatientBrief),
    };
  });

  const topSegment = [...segments].sort((a, b) => b.count - a.count)[0];

  return {
    mode,
    title: "Distribución por cobertura médica",
    subtitle: "Composición de pacientes según tipo de financiamiento",
    centerLabel:
      topSegment && topSegment.count > 0 ? topSegment.label : "Total",
    centerValue:
      topSegment && topSegment.count > 0
        ? `${topSegment.percentage}%`
        : `${totalPatients}`,
    totalUnits: totalPatients,
    unitLabel: "pacientes",
    segments,
  };
}

/**
 * Resume el estado normal/límite/crítico de las pruebas vigentes agrupadas por panel clínico.
 */
export function buildLabPanelBreakdown(
  latestLabs: LabResult[],
): LabPanelSummary[] {
  const panelMap = new Map<
    LabPanelCategory,
    { normal: number; warning: number; critical: number }
  >();

  for (const lab of latestLabs) {
    const current = panelMap.get(lab.category) ?? {
      normal: 0,
      warning: 0,
      critical: 0,
    };
    const status = evaluateLabResult(lab).status;
    current[status] += 1;
    panelMap.set(lab.category, current);
  }

  return Array.from(panelMap.entries())
    .map(([category, counts]) => {
      const total = counts.normal + counts.warning + counts.critical;
      return {
        category,
        ...counts,
        total,
        normalRatePct: pct(counts.normal, total),
      };
    })
    .sort((a, b) => b.total - a.total || b.critical - a.critical);
}

/**
 * Construye una serie mensual de los últimos 6 meses de actividad clínica (exámenes y notas SOAP).
 */
export function buildMonthlyClinicalActivity(
  labResults: LabResult[],
  soapNotes: HceDatabase["soapNotes"],
): MonthlyActivityPoint[] {
  const timestamps: number[] = [
    ...labResults.map((l) => new Date(l.collectedAt).getTime()),
    ...soapNotes.map((s) => new Date(s.date).getTime()),
  ].filter((t) => !Number.isNaN(t));

  const anchorDate =
    timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date();

  const months: MonthlyActivityPoint[] = [];
  const monthIndexMap = new Map<string, MonthlyActivityPoint>();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const d = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() - offset,
      1,
    );
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const shortYear = String(d.getFullYear()).slice(-2);
    const point: MonthlyActivityPoint = {
      monthKey: key,
      label: `${MONTHS_SHORT_ES[d.getMonth()]} ${shortYear}`,
      normalLabs: 0,
      alteredLabs: 0,
      soapNotes: 0,
      totalEvents: 0,
    };
    months.push(point);
    monthIndexMap.set(key, point);
  }

  for (const lab of labResults) {
    const d = new Date(lab.collectedAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthIndexMap.get(key);
    if (!bucket) continue;

    if (evaluateLabResult(lab).status === "normal") {
      bucket.normalLabs += 1;
    } else {
      bucket.alteredLabs += 1;
    }
    bucket.totalEvents += 1;
  }

  for (const note of soapNotes) {
    const d = new Date(note.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthIndexMap.get(key);
    if (!bucket) continue;

    bucket.soapNotes += 1;
    bucket.totalEvents += 1;
  }

  return months;
}

/**
 * Agrupa los diagnósticos CIE-10 más frecuentes entre los pacientes en seguimiento.
 */
export function buildDiagnosisPrevalence(
  patients: Patient[],
): DiagnosisPrevalenceItem[] {
  const totalPatients = patients.length;
  const dxMap = new Map<
    string,
    {
      code: string;
      description: string;
      patientIds: Set<string>;
      activeCount: number;
    }
  >();

  for (const patient of patients) {
    for (const dx of patient.diagnoses) {
      if (dx.status === "resuelto") continue;
      const key = dx.code.trim().toUpperCase();
      const existing = dxMap.get(key);
      if (existing) {
        existing.patientIds.add(patient.id);
        if (dx.status === "activo") existing.activeCount += 1;
      } else {
        dxMap.set(key, {
          code: dx.code,
          description: dx.description,
          patientIds: new Set([patient.id]),
          activeCount: dx.status === "activo" ? 1 : 0,
        });
      }
    }
  }

  return Array.from(dxMap.values())
    .map((item) => ({
      code: item.code,
      description: item.description,
      patientCount: item.patientIds.size,
      percentage: pct(item.patientIds.size, totalPatients),
      activeCount: item.activeCount,
    }))
    .sort(
      (a, b) =>
        b.patientCount - a.patientCount || b.activeCount - a.activeCount,
    )
    .slice(0, 6);
}

/**
 * Calcula los KPIs ejecutivos y asistenciales del portal médico.
 */
export function buildClinicalKpiSummary(
  db: HceDatabase,
  latestLabs: LabResult[],
  latestVitals: Map<string, VitalSign>,
  alerts: PatientClinicalAlert[],
): ClinicalKpiSummary {
  const totalPatients = db.patients.length;
  let stablePatientsCount = 0;
  let warningPatientsCount = 0;
  let criticalPatientsCount = 0;
  let controlledBpCount = 0;
  let patientsWithVitalsCount = 0;
  let totalAge = 0;
  let femaleCount = 0;
  let maleCount = 0;

  for (const patient of db.patients) {
    totalAge += calculateAge(patient.birthDate);
    if (patient.sex === "F") femaleCount += 1;
    else maleCount += 1;

    const status = getPatientOverallStatus(
      patient.id,
      latestLabs,
      latestVitals,
    );
    if (status === "normal") stablePatientsCount += 1;
    else if (status === "warning") warningPatientsCount += 1;
    else criticalPatientsCount += 1;

    const vital = latestVitals.get(patient.id);
    if (vital) {
      patientsWithVitalsCount += 1;
      if (
        classifyBloodPressure(vital.systolicBp, vital.diastolicBp).status ===
        "normal"
      ) {
        controlledBpCount += 1;
      }
    }
  }

  const criticalAlertsCount = alerts.filter(
    (a) => a.evaluation.status === "critical",
  ).length;
  const warningAlertsCount = alerts.filter(
    (a) => a.evaluation.status === "warning",
  ).length;
  const latestLabsTotal = latestLabs.length;
  const latestLabsNormalCount = Math.max(0, latestLabsTotal - alerts.length);

  return {
    totalPatients,
    stablePatientsCount,
    warningPatientsCount,
    criticalPatientsCount,
    controlRatePct: pct(stablePatientsCount, totalPatients),
    latestLabsTotal,
    latestLabsNormalCount,
    labControlRatePct: pct(latestLabsNormalCount, latestLabsTotal),
    activeAlertsCount: alerts.length,
    criticalAlertsCount,
    warningAlertsCount,
    totalLabsCount: db.labResults.length,
    totalSoapNotesCount: db.soapNotes.length,
    totalDiagnosticStudiesCount: db.diagnosticStudies.length,
    totalClinicalRecords:
      db.soapNotes.length + db.labResults.length + db.diagnosticStudies.length,
    activeMedicationsCount: db.medications.filter((m) => m.status === "activo")
      .length,
    patientsWithAllergiesCount: db.patients.filter(
      (p) => p.allergies.length > 0,
    ).length,
    controlledBpCount,
    patientsWithVitalsCount,
    controlledBpRatePct: pct(controlledBpCount, patientsWithVitalsCount),
    averageAge: totalPatients > 0 ? Math.round(totalAge / totalPatients) : 0,
    femaleCount,
    maleCount,
  };
}
