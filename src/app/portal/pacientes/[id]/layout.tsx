import type { ReactNode } from "react";
import { PatientShell } from "@/components/portal/layout/PatientShell";

export const instant = false;

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <PatientShell>{children}</PatientShell>;
}
