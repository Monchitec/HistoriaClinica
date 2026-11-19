import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "./Button";

export function NotFoundView() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="bg-secondary text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
        <FileSearch className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h1 className="text-foreground mt-4 text-2xl font-bold tracking-tight">
        Ruta clínica no encontrada
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        La dirección solicitada no existe dentro de Rubí HCE.
      </p>
      <div className="mt-6">
        <Link href="/portal">
          <Button>Volver al Portal Médico</Button>
        </Link>
      </div>
    </div>
  );
}
