---
name: seo-standards
description: >-
  Estándares de metadatos, privacidad de indexación y configuración de robots para Rubí HCE
  en Next.js (App Router). Protege las rutas privadas del portal clínico contra indexación en
  buscadores y define cuándo aplicar SEO público si se añade un sitio informativo futuro.
---

# Estándares de Metadatos y Privacidad de Indexación — Rubí HCE

Este documento define las reglas de metadatos y control de indexación para **Rubí HCE** en Next.js (App Router).

> **Principio rector en salud:** A diferencia de una tienda online o sitio público, un **portal de Historia Clínica Electrónica (HCE)** maneja flujos clínicos privados. La prioridad es **impedir la indexación de rutas clínicas** y ofrecer títulos claros de pestaña para el médico.

---

## 1. Arquitectura en Next.js App Router

```text
src/app/
├── layout.tsx               # Metadatos globales, plantilla de título y política noindex por defecto
├── robots.ts                # Bloqueo de rastreo en rutas privadas del portal (/robots.txt)
└── portal/**/page.tsx       # Títulos claros por módulo clínico (sin exponer datos sensibles de pacientes)
```

---

## 2. Metadatos Globales (`src/app/layout.tsx`)

### Plantilla de Título y Descripción

- **Título Base (`default`):** `Rubí HCE | Historia Clínica Electrónica`
- **Formato Dinámico (`template`):** `%s | Rubí HCE`
  - Ejemplos: `Portal Médico | Rubí HCE`, `Resultados de pruebas | Rubí HCE`, `Evolución clínica | Rubí HCE`.
- **Descripción:** `Portal clínico de seguimiento y análisis de historias clínicas para Medicina Interna.`
- **Idioma del documento:** `lang="es-PE"`.

### Regla de Privacidad en Títulos y Metadata

- **Nunca incluir datos identificables de pacientes** (nombre completo, DNI o diagnósticos) en metadatos públicos, Open Graph ni etiquetas accesibles por rastreadores.
- Usar títulos funcionales de módulo (ej. `Resumen de salud | Rubí HCE`, `Tendencias de laboratorio | Rubí HCE`).

---

## 3. Control de Indexación (`robots` y `src/app/robots.ts`)

Mientras **Rubí HCE** opere exclusivamente como portal privado del médico (Fase 1 y Fase 2):

1. En `src/app/layout.tsx`, configurar por defecto:

```ts
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
```

2. En `src/app/robots.ts`, bloquear el rastreo de todo el portal privado:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
```

---

## 4. Regla para un Sitio Público Futuro (Opcional)

Solo si en una fase posterior se crea un grupo de rutas público `src/app/(sitio)/`:

- Habilitar `robots: { index: true, follow: true }` únicamente dentro del layout de `(sitio)/`.
- En `src/app/robots.ts`, permitir solo las rutas públicas y mantener siempre bloqueados `/login`, `/portal` y `/pacientes`.
- Agregar `src/app/sitemap.ts`, Open Graph y Schema.org (`SoftwareApplication` o `MedicalOrganization`) exclusivamente para las páginas públicas.
