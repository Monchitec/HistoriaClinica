"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  hceRepository,
  type CreateDiagnosticStudyInput,
  type CreateLabResultInput,
  type CreatePatientInput,
} from "@/services/hce-repository";
import type {
  Allergy,
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

interface StoreSnapshot {
  isReady: boolean;
  db: HceDatabase;
  session: DoctorSession | null;
}

const EMPTY_DB: HceDatabase = {
  patients: [],
  labResults: [],
  vitals: [],
  soapNotes: [],
  medications: [],
  diagnosticStudies: [],
};

const SERVER_SNAPSHOT: StoreSnapshot = {
  isReady: false,
  db: EMPTY_DB,
  session: null,
};

let clientSnapshot: StoreSnapshot | null = null;
const storeListeners = new Set<() => void>();

function refreshSnapshot() {
  clientSnapshot = {
    isReady: true,
    db: hceRepository.getDatabase(),
    session: hceRepository.getSession(),
  };
  storeListeners.forEach((listener) => listener());
}

function subscribeStore(listener: () => void) {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

function getClientSnapshot(): StoreSnapshot {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
  }
  if (!clientSnapshot) {
    clientSnapshot = {
      isReady: true,
      db: hceRepository.getDatabase(),
      session: hceRepository.getSession(),
    };
  }
  return clientSnapshot;
}

function getServerSnapshot(): StoreSnapshot {
  return SERVER_SNAPSHOT;
}

interface HceContextValue {
  isReady: boolean;
  db: HceDatabase;
  session: DoctorSession | null;
  loginDoctor: (session: DoctorSession) => void;
  logoutDoctor: () => void;
  createPatient: (input: CreatePatientInput) => Patient;
  addLabResult: (input: CreateLabResultInput) => LabResult[];
  addSoapNote: (note: Omit<SoapNote, "id">) => void;
  addVitalSign: (vital: Omit<VitalSign, "id">) => void;
  addMedication: (med: Omit<Medication, "id">) => void;
  toggleMedicationStatus: (medicationId: string) => void;
  addDiagnosis: (patientId: string, diagnosis: Omit<Diagnosis, "id">) => void;
  addAllergy: (patientId: string, allergy: Omit<Allergy, "id">) => void;
  removeAllergy: (patientId: string, allergyId: string) => void;
  updateHistory: (patientId: string, history: MedicalHistory) => void;
  updatePatientPhoto: (patientId: string, photoUrl?: string) => void;
  updateDoctorPhoto: (photoUrl?: string) => void;
  addDiagnosticStudy: (input: CreateDiagnosticStudyInput) => DiagnosticStudy;
  resetDemoData: () => void;
}

const HceContext = createContext<HceContextValue | null>(null);

export function HceProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeStore,
    getClientSnapshot,
    getServerSnapshot,
  );

  const loginDoctor = useCallback((session: DoctorSession) => {
    hceRepository.saveSession(session);
    refreshSnapshot();
  }, []);

  const logoutDoctor = useCallback(() => {
    hceRepository.clearSession();
    refreshSnapshot();
  }, []);

  const createPatient = useCallback((input: CreatePatientInput) => {
    const { patient } = hceRepository.createPatient(input);
    refreshSnapshot();
    return patient;
  }, []);

  const addLabResult = useCallback((input: CreateLabResultInput) => {
    const { created } = hceRepository.addLabResult(input);
    refreshSnapshot();
    return created;
  }, []);

  const addSoapNote = useCallback((note: Omit<SoapNote, "id">) => {
    hceRepository.addSoapNote(note);
    refreshSnapshot();
  }, []);

  const addVitalSign = useCallback((vital: Omit<VitalSign, "id">) => {
    hceRepository.addVitalSign(vital);
    refreshSnapshot();
  }, []);

  const addMedication = useCallback((med: Omit<Medication, "id">) => {
    hceRepository.addMedication(med);
    refreshSnapshot();
  }, []);

  const toggleMedicationStatus = useCallback((medicationId: string) => {
    hceRepository.toggleMedicationStatus(medicationId);
    refreshSnapshot();
  }, []);

  const addDiagnosis = useCallback(
    (patientId: string, diagnosis: Omit<Diagnosis, "id">) => {
      hceRepository.addDiagnosis(patientId, diagnosis);
      refreshSnapshot();
    },
    [],
  );

  const addAllergy = useCallback(
    (patientId: string, allergy: Omit<Allergy, "id">) => {
      hceRepository.addAllergy(patientId, allergy);
      refreshSnapshot();
    },
    [],
  );

  const removeAllergy = useCallback((patientId: string, allergyId: string) => {
    hceRepository.removeAllergy(patientId, allergyId);
    refreshSnapshot();
  }, []);

  const updateHistory = useCallback(
    (patientId: string, history: MedicalHistory) => {
      hceRepository.updateHistory(patientId, history);
      refreshSnapshot();
    },
    [],
  );

  const updatePatientPhoto = useCallback(
    (patientId: string, photoUrl?: string) => {
      hceRepository.updatePatientPhoto(patientId, photoUrl);
      refreshSnapshot();
    },
    [],
  );

  const updateDoctorPhoto = useCallback((photoUrl?: string) => {
    hceRepository.updateDoctorPhoto(photoUrl);
    refreshSnapshot();
  }, []);

  const addDiagnosticStudy = useCallback(
    (input: CreateDiagnosticStudyInput) => {
      const { study } = hceRepository.addDiagnosticStudy(input);
      refreshSnapshot();
      return study;
    },
    [],
  );

  const resetDemoData = useCallback(() => {
    hceRepository.resetDemoData();
    refreshSnapshot();
  }, []);

  const value = useMemo<HceContextValue>(
    () => ({
      isReady: snapshot.isReady,
      db: snapshot.db,
      session: snapshot.session,
      loginDoctor,
      logoutDoctor,
      createPatient,
      addLabResult,
      addSoapNote,
      addVitalSign,
      addMedication,
      toggleMedicationStatus,
      addDiagnosis,
      addAllergy,
      removeAllergy,
      updateHistory,
      updatePatientPhoto,
      updateDoctorPhoto,
      addDiagnosticStudy,
      resetDemoData,
    }),
    [
      snapshot,
      loginDoctor,
      logoutDoctor,
      createPatient,
      addLabResult,
      addSoapNote,
      addVitalSign,
      addMedication,
      toggleMedicationStatus,
      addDiagnosis,
      addAllergy,
      removeAllergy,
      updateHistory,
      updatePatientPhoto,
      updateDoctorPhoto,
      addDiagnosticStudy,
      resetDemoData,
    ],
  );

  return <HceContext.Provider value={value}>{children}</HceContext.Provider>;
}

export function useHce() {
  const ctx = useContext(HceContext);
  if (!ctx) {
    throw new Error("useHce debe usarse dentro de HceProvider");
  }
  return ctx;
}
