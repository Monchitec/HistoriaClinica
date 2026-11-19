import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function ErrorView({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="bg-clinical-critical-soft text-clinical-critical flex h-12 w-12 items-center justify-center rounded-2xl">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h1 className="text-foreground mt-4 text-xl font-bold">
        Ocurrió un error inesperado
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        No se pudo mostrar esta vista clínica. Intenta recargar la sección o
        volver al portal médico.
      </p>
      <div className="mt-6 flex gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        )}
        <Link href="/portal">
          <Button>Ir al Portal Médico</Button>
        </Link>
      </div>
    </div>
  );
}
