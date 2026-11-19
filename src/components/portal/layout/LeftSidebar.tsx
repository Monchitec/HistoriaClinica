"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Camera,
  FlaskConical,
  FolderClock,
  HeartPulse,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Pill,
  RotateCcw,
  Stethoscope,
  Users,
} from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Avatar } from "@/components/shared/ui/Avatar";
import { RubiLogo } from "@/components/shared/ui/RubiLogo";
import { ThemeToggle } from "@/components/shared/ui/ThemeToggle";
import { compressImageFile } from "@/lib/format/image-compression";

interface LeftSidebarProps {
  onNavigate?: () => void;
}

export function LeftSidebar({ onNavigate }: LeftSidebarProps) {
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const { db, session, logoutDoctor, resetDemoData, updateDoctorPhoto } =
    useHce();
  const [resetFeedback, setResetFeedback] = useState(false);

  const patientId = typeof params?.id === "string" ? params.id : undefined;
  const activePatient = patientId
    ? db.patients.find((p) => p.id === patientId)
    : undefined;

  const globalLinks = [
    {
      href: "/portal",
      label: "Portal Médico",
      icon: LayoutDashboard,
      isActive: pathname === "/portal",
    },
    {
      href: "/portal/pacientes",
      label: "Pacientes",
      icon: Users,
      isActive: pathname === "/portal/pacientes",
    },
  ];

  const patientLinks = activePatient
    ? [
        {
          href: `/portal/pacientes/${activePatient.id}`,
          label: "Resumen de salud",
          icon: HeartPulse,
          isActive: pathname === `/portal/pacientes/${activePatient.id}`,
        },
        {
          href: `/portal/pacientes/${activePatient.id}/pruebas`,
          label: "Resultados de pruebas",
          icon: FlaskConical,
          isActive: pathname.startsWith(
            `/portal/pacientes/${activePatient.id}/pruebas`,
          ),
        },
        {
          href: `/portal/pacientes/${activePatient.id}/imagenes`,
          label: "Imágenes diagnósticas",
          icon: ImageIcon,
          isActive: pathname.startsWith(
            `/portal/pacientes/${activePatient.id}/imagenes`,
          ),
        },
        {
          href: `/portal/pacientes/${activePatient.id}/evolucion`,
          label: "Evolución SOAP y Vitales",
          icon: Stethoscope,
          isActive: pathname.startsWith(
            `/portal/pacientes/${activePatient.id}/evolucion`,
          ),
        },
        {
          href: `/portal/pacientes/${activePatient.id}/medicamentos`,
          label: "Medicamentos",
          icon: Pill,
          isActive: pathname.startsWith(
            `/portal/pacientes/${activePatient.id}/medicamentos`,
          ),
        },
        {
          href: `/portal/pacientes/${activePatient.id}/antecedentes`,
          label: "Antecedentes",
          icon: FolderClock,
          isActive: pathname.startsWith(
            `/portal/pacientes/${activePatient.id}/antecedentes`,
          ),
        },
      ]
    : [];

  function handleResetDemo() {
    resetDemoData();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2500);
  }

  async function handleDoctorPhotoUpload(file?: File) {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxDimension: 320 });
      updateDoctorPhoto(compressed);
    } catch {
      // Ignorar archivo inválido silenciosamente
    }
  }

  function handleLogout() {
    logoutDoctor();
    router.push("/login");
  }

  return (
    <aside
      aria-label="Menú lateral del portal médico"
      className="border-border bg-card flex h-full flex-col justify-between border-r px-3.5 py-5"
    >
      <div className="space-y-6">
        <div className="px-1.5">
          <Link
            href="/portal"
            onClick={onNavigate}
            className="focus-visible:ring-ring inline-flex rounded-xl focus-visible:ring-2 focus-visible:outline-none"
          >
            <RubiLogo />
          </Link>
        </div>

        <nav aria-label="Navegación principal" className="space-y-1">
          <p className="text-muted-foreground px-2.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">
            Consultorio
          </p>
          {globalLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`focus-visible:ring-ring flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  item.isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {activePatient && (
          <nav
            aria-label="Secciones de la historia clínica"
            className="border-border space-y-1 border-t pt-4"
          >
            <div className="px-2.5 pb-1.5">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Historia clínica abierta
              </p>
              <p className="text-primary mt-0.5 truncate text-xs font-semibold">
                {activePatient.fullName}
              </p>
            </div>
            {patientLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`focus-visible:ring-ring flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    item.isActive
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      item.isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="border-border space-y-3 border-t pt-4">
        {session && (
          <div className="border-border bg-muted/60 flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
            <label
              title="Cambiar foto del médico"
              className="group relative shrink-0 cursor-pointer"
            >
              <Avatar
                src={session.photoUrl}
                name={session.name}
                size="md"
                rounded="full"
              />
              <span className="bg-foreground/65 text-background absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <input
                type="file"
                accept="image/*"
                aria-label="Cambiar foto del médico"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  void handleDoctorPhotoUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
            <div className="min-w-0">
              <p className="text-foreground truncate text-xs font-semibold">
                {session.name}
              </p>
              <p className="text-muted-foreground truncate text-[11px]">
                {session.specialty} ·{" "}
                <span className="tabular-nums">{session.cmp}</span>
              </p>
            </div>
          </div>
        )}

        <ThemeToggle fullWidth />

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleResetDemo}
            className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>
              {resetFeedback
                ? "Datos demo restablecidos"
                : "Restablecer datos demo"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="text-muted-foreground hover:bg-clinical-critical-soft hover:text-clinical-critical-foreground focus-visible:ring-ring flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Cambiar médico / Salir</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
