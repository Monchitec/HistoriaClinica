export function LoadingState({
  label = "Cargando historia clínica...",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-4 py-6" role="status" aria-live="polite">
      <div className="bg-muted h-6 w-48 animate-pulse rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border-border bg-card h-28 animate-pulse rounded-2xl border" />
        <div className="border-border bg-card h-28 animate-pulse rounded-2xl border" />
        <div className="border-border bg-card h-28 animate-pulse rounded-2xl border" />
      </div>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
