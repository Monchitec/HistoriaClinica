"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHce } from "@/components/shared/providers/HceProvider";
import { LoadingState } from "@/components/shared/ui/LoadingState";

export function EntryGate() {
  const router = useRouter();
  const { isReady, session } = useHce();

  useEffect(() => {
    if (!isReady) return;
    router.replace(session ? "/portal" : "/login");
  }, [isReady, session, router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4">
      <LoadingState label="Iniciando Rubí HCE..." />
    </div>
  );
}
