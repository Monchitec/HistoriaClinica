"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { Button } from "@/components/shared/ui/Button";
import { Input } from "@/components/shared/ui/Input";
import { ThemeToggle } from "@/components/shared/ui/ThemeToggle";
import { DEFAULT_DOCTOR_SESSION } from "@/services/hce-repository";

function deriveDoctorName(identifier: string): string {
  const clean = identifier.trim();
  if (
    !clean ||
    clean.toLowerCase() === DEFAULT_DOCTOR_SESSION.email.toLowerCase()
  ) {
    return DEFAULT_DOCTOR_SESSION.name;
  }
  const localPart = clean
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
  const capitalized = localPart
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return capitalized ? `Dr(a). ${capitalized}` : DEFAULT_DOCTOR_SESSION.name;
}

export function LoginView() {
  const router = useRouter();
  const { loginDoctor } = useHce();

  const [identifier, setIdentifier] = useState(DEFAULT_DOCTOR_SESSION.email);
  const [password, setPassword] = useState("rubi2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!identifier.trim()) {
      setError("Ingresa tu usuario o correo electrónico.");
      return;
    }
    if (password.trim().length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    loginDoctor({
      ...DEFAULT_DOCTOR_SESSION,
      email: identifier.trim(),
      name: deriveDoctorName(identifier),
    });

    router.push("/portal");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Mitad izquierda: Panel azul degradado con mensaje principal */}
      <section
        aria-label="Presentación del portal clínico"
        className="from-login-hero-from via-login-hero-via to-login-hero-to text-primary-foreground relative flex flex-col justify-between bg-linear-to-b px-8 py-10 lg:px-14"
      >
        <div className="lg:hidden">
          <span className="text-sm font-bold tracking-tight">Rubí HCE</span>
        </div>

        <div className="my-auto flex flex-col items-center justify-center py-10 text-center">
          <h1 className="max-w-md text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Portal clínico para seguimiento integral de pacientes
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-sm text-sm">
            Historias clínicas de Medicina Interna, rangos de laboratorio y
            curvas evolutivas en un solo lugar.
          </p>
        </div>

        <footer className="border-primary-foreground/15 text-primary-foreground/75 border-t pt-5 text-center text-xs">
          © 2026 Rubí HCE · Acceso Clínico Privado
        </footer>
      </section>

      {/* Mitad derecha: Formulario limpio de inicio de sesión */}
      <main className="bg-card relative flex flex-col justify-between px-6 py-8 sm:px-12">
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <div className="space-y-1.5">
            <p className="text-foreground text-xl font-bold tracking-tight">
              Bienvenido a
            </p>
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight">
              RUBÍ <span className="text-primary">HCE PORTAL</span>
            </h2>
            <p className="text-muted-foreground pt-1 text-xs">
              Ingresa tus credenciales para acceder a tu consultorio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="login-identifier"
                className="text-muted-foreground mb-1.5 block text-[11px] font-bold tracking-wider uppercase"
              >
                Usuario o correo electrónico
              </label>
              <div className="relative">
                <Input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="medico@rubihce.pe"
                  className="bg-secondary/50 pr-10"
                />
                <Mail
                  aria-hidden="true"
                  className="text-primary pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
                  strokeWidth={1.75}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="text-muted-foreground mb-1.5 block text-[11px] font-bold tracking-wider uppercase"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs font-medium select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="border-border accent-primary h-4 w-4 rounded"
              />
              <span>Recordarme en este equipo</span>
            </label>

            {error && (
              <p className="bg-clinical-critical-soft text-clinical-critical-foreground rounded-xl px-3 py-2 text-xs font-medium">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full shadow-md">
              Ingresar
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </form>

          <p className="text-muted-foreground mt-5 text-center text-[11px]">
            Credenciales demo precargadas:{" "}
            <span className="text-foreground font-mono font-semibold">
              medico@rubihce.pe
            </span>{" "}
            /{" "}
            <span className="text-foreground font-mono font-semibold">
              rubi2026
            </span>
          </p>
        </div>

        <div className="text-muted-foreground text-center text-[11px] lg:text-right">
          Historia Clínica Electrónica · Medicina Interna
        </div>
      </main>
    </div>
  );
}
