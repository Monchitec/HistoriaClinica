"use client";

import { ErrorView } from "@/components/shared/ui/ErrorView";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView onRetry={reset} />;
}
