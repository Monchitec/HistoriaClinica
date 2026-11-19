"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useHce } from "@/components/shared/providers/HceProvider";
import { LoadingState } from "@/components/shared/ui/LoadingState";
import { RubiLogo } from "@/components/shared/ui/RubiLogo";
import { LeftSidebar } from "./LeftSidebar";

export function PortalShell({ children }: { children: ReactNode }) {
  const { isReady, session } = useHce();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isReady && !session) {
      router.replace("/login");
    }
  }, [isReady, session, router]);

  if (!isReady || !session) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <LoadingState label="Cargando portal clínico..." />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      {/* Sidebar izquierdo fijo en escritorio */}
      <div className="hidden lg:block lg:w-68 lg:shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <LeftSidebar />
        </div>
      </div>

      {/* Drawer móvil/tablet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="bg-foreground/40 fixed inset-0 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-xl">
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú lateral"
                className="border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border p-1.5"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <LeftSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-card sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <RubiLogo />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú lateral"
            className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
            <span>Menú</span>
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
