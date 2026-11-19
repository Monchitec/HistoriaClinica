export function RubiLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7.5 3.5H16.5L21 9.2L12 20.5L3 9.2L7.5 3.5Z"
            className="stroke-current"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M3 9.2H21"
            className="stroke-current"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="13.5" r="2.1" className="fill-brand-ruby" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-foreground text-base font-bold tracking-tight">
            Rubí <span className="text-primary">HCE</span>
          </span>
          <span className="text-muted-foreground text-[11px] font-medium">
            Medicina Interna
          </span>
        </span>
      )}
    </span>
  );
}
