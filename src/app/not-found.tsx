import type { Metadata } from "next";
import { NotFoundView } from "@/components/shared/ui/NotFoundView";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return <NotFoundView />;
}
