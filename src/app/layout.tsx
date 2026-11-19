import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HceProvider } from "@/components/shared/providers/HceProvider";
import { ThemeProvider } from "@/components/shared/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rubí HCE | Historia Clínica Electrónica",
    template: "%s | Rubí HCE",
  },
  description:
    "Portal clínico de seguimiento y análisis de historias clínicas para Medicina Interna.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-PE"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <HceProvider>{children}</HceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
