---
name: app-architecture
description: >-
  Guía de arquitectura para Rubí HCE (Historia Clínica Electrónica de Medicina Interna)
  basada en Next.js App Router, React, TypeScript y Tailwind CSS. Define cómo organizar rutas
  y componentes por módulo clínico, separar la lógica médica y la persistencia de la UI,
  mantener consistencia con los tokens clínicos y verificar cambios de forma segura.
---

# Arquitectura de Rubí HCE

## 1. Objetivo y principios

Esta guía establece las convenciones de **Rubí HCE** para que el proyecto sea fácil de entender, mantener y escalar a largo plazo.

Principios:

1. **Las rutas viven en `src/app/`.** Next.js utiliza archivos especiales (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) para definir rutas y layouts.
2. **Los componentes de la interfaz viven en `src/components/`.** Agrúpalos por módulo clínico y área funcional para que la relación entre cada ruta y sus componentes sea inmediata.
3. **Los componentes compartidos viven en `src/components/shared/`.** No muevas un componente allí hasta que sea realmente reutilizado entre varios módulos o sea una primitiva UI global.
4. **Mantén las responsabilidades claramente separadas:**
   - Las **páginas (`page.tsx`)** solo orquestan metadata, parámetros/datos de ruta y composición de alto nivel (sin HTML directo ni hooks cliente; ver `.agents/rules/architecture-nextjs.md`).
   - Los **componentes** presentan la UI y gestionan el estado visual/interactivo.
   - La **lógica y cálculos clínicos** (clasificación de rangos de laboratorio, cálculo de TFGe CKD-EPI, IMC, alertas) viven en `src/lib/clinical/`.
   - La **persistencia de datos** vive encapsulada en `src/services/` detrás de una interfaz desacoplada de la UI.
5. **Sigue las convenciones de Next.js 16.** Respeta `AGENTS.md` (React Compiler, `params` y `searchParams` asíncronos) y no conviertas `src/app/` en una carpeta genérica de componentes.
6. **Prefiere soluciones simples.** No crees carpetas, abstracciones ni archivos adicionales sin una funcionalidad concreta que los requiera.

---

## 2. Organización de rutas y componentes

### 2.1 Estructura recomendada para Rubí HCE

```text
src/
├── app/                                      # Rutas y layouts de Next.js App Router
│   ├── globals.css                           # Tokens globales, tema claro/oscuro y estados clínicos
│   ├── layout.tsx                            # Layout raíz, tipografía, metadata y providers globales
│   ├── not-found.tsx                         # Página 404 global
│   ├── error.tsx                             # Límite de error global
│   ├── page.tsx                              # Entrada raíz (redirige a /portal o /login)
│   ├── login/
│   │   └── page.tsx                          # URL /login (acceso del médico)
│   └── portal/                               # Área privada del portal médico (tras login)
│       ├── layout.tsx                        # Shell del portal: Sidebar izquierdo + área principal
│       ├── page.tsx                          # URL /portal (dashboard del médico + buscador + alertas)
│       └── pacientes/
│           ├── page.tsx                      # URL /portal/pacientes (directorio y creación de pacientes)
│           └── [id]/
│               ├── layout.tsx                # Contexto del paciente: Banner fijo (datos + alergias)
│               ├── page.tsx                  # URL /portal/pacientes/[id] (Resumen de salud / Snapshot)
│               ├── pruebas/
│               │   ├── page.tsx              # URL /portal/pacientes/[id]/pruebas (lista buscable de exámenes)
│               │   └── [pruebaId]/
│               │       ├── page.tsx          # URL /portal/pacientes/[id]/pruebas/[pruebaId] (detalle + barra de rango)
│               │       └── tendencias/
│               │           └── page.tsx      # URL /portal/pacientes/[id]/pruebas/[pruebaId]/tendencias (gráfica histórica)
│               ├── evolucion/
│               │   └── page.tsx              # URL /portal/pacientes/[id]/evolucion (notas SOAP y signos vitales)
│               ├── medicamentos/
│               │   └── page.tsx              # URL /portal/pacientes/[id]/medicamentos (medicación activa e historial)
│               └── antecedentes/
│                   └── page.tsx              # URL /portal/pacientes/[id]/antecedentes (patológicos, quirúrgicos, familiares, vacunas)
│
├── components/
│   ├── shared/                               # Primitivas UI y providers transversales
│   │   ├── ui/                               # Button, Input, Card, Badge, Modal, EmptyState, ThemeToggle
│   │   └── providers/                        # ThemeProvider, HceProvider, AuthProvider
│   └── portal/                               # Todo lo del portal médico (tras login), organizado por módulo
│       ├── layout/                           # Marco del portal: PortalShell, LeftSidebar, PatientBanner
│       ├── dashboard/                        # Pantalla /portal (dashboard del médico + buscador + alertas)
│       ├── pacientes/                        # Directorio y creación de pacientes (/portal/pacientes)
│       ├── resumen/                          # Resumen de salud del paciente (/portal/pacientes/[id])
│       ├── pruebas/                          # LabResultsList, LabResultDetail, RangeBar, LabTrendChart, NewLabModal
│       ├── evolucion/                        # SoapNotesList, NewSoapNoteForm, VitalsPanel
│       ├── medicamentos/                     # MedicationsList, MedicationForm
│       └── antecedentes/                     # MedicalHistoryView, AllergyManager
│
├── data/                                     # Catálogos clínicos estáticos y casos demo ficticios
│   ├── lab-catalog.ts                        # Pruebas de Medicina Interna (unidades, rangos y categorías)
│   └── demo-patients.ts                      # Pacientes ficticios realistas (Perú) para desarrollo y demo
│
├── lib/                                      # Funciones puras reutilizables
│   ├── clinical/                             # Cálculos clínicos puros (TFGe CKD-EPI, IMC, estado de rango)
│   └── format/                               # Formateadores locales es-PE (fechas, DNI, unidades clínicas)
│
├── services/                                 # Capa de persistencia desacoplada (patrón repositorio)
│   └── hce-repository.ts                     # Interfaz única de acceso a datos del portal
│
└── types/                                    # Tipos de dominio clínico compartidos
    └── clinical.ts                           # Patient, LabResult, SoapNote, Medication, VitalSign, Diagnosis
```

> **Nota evolutiva:** Esta estructura es la arquitectura objetivo; crea carpetas solo conforme implementes cada módulo. Si en una fase futura se incorpora un sitio informativo público, se añadirá como `src/app/(sitio)/` y `src/components/sitio/` sin alterar `src/app/portal/` ni `src/components/portal/`.

### 2.2 Cómo se relacionan las rutas y los componentes

- `src/app/portal/layout.tsx` envuelve todo lo que vive bajo `/portal/*` y usa `src/components/portal/layout/`.
- `src/app/portal/page.tsx` define la ruta `/portal` y compone `src/components/portal/dashboard/`.
- `src/app/portal/pacientes/[id]/pruebas/page.tsx` define la lista de exámenes del paciente y compone `src/components/portal/pruebas/`.
- Los parámetros dinámicos (`[id]`, `[pruebaId]`) deben ser siempre **identificadores opacos (UUID)** — nunca `DNI`, nombres personales ni números secuenciales predecibles.
- `src/components/shared/` contiene primitivas UI y providers reutilizados transversalmente.

### 2.3 Regla para ubicar un archivo o componente

Utiliza este orden de decisión:

1. **¿Pertenece a un único módulo clínico?** Colócalo en `src/components/portal/<modulo>/` (por ejemplo `RangeBar` y `LabTrendChart` en `src/components/portal/pruebas/`).
2. **¿Se comparte entre varias pantallas del portal médico?** Colócalo en `src/components/portal/layout/` (por ejemplo `LeftSidebar` o `PatientBanner`).
3. **¿Es una primitiva UI genérica (Button, Card, Input, Badge, Modal)?** Colócalo en `src/components/shared/ui/`.
4. **¿Es una regla o cálculo médico (clasificación de HbA1c, cálculo de TFGe, IMC)?** Colócalo en `src/lib/clinical/` como función pura tipada.
5. **¿Lee o guarda datos de pacientes o resultados?** Encapsúlalo en `src/services/` para que ningún componente visual acceda directamente a `localStorage` ni a queries de base de datos.

---

## 3. Responsabilidades de cada archivo

### 3.1 `page.tsx` y `layout.tsx`

En cumplimiento estricto de `.agents/rules/architecture-nextjs.md`:

- `page.tsx` es **exclusivamente un orquestador del servidor**: define `metadata` / `generateMetadata`, resuelve `await params` o `await searchParams` (Next.js 16) y renderiza el componente de vista del módulo.
- Prohibido escribir marcado HTML directo (`<div>`, `<main>`, `<button>`, etc.) o hooks cliente (`useState`, `useEffect`, etc.) dentro de `page.tsx`.

Ejemplo:

```tsx
import type { Metadata } from "next";
import { LabResultsView } from "@/components/portal/pruebas/LabResultsView";

export const metadata: Metadata = {
  title: "Resultados de pruebas",
  description: "Resultados de laboratorio y tendencias clínicas del paciente.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LabResultsView patientId={id} />;
}
```

### 3.2 Componentes de pantalla y visuales

- Divide pantallas complejas en subcomponentes pequeños y enfocados dentro de la misma carpeta del módulo.
- Usa TypeScript estricto; evita `any` y conversiones inseguras.
- Usa `index.ts` solo cuando simplifique exportaciones públicas de un módulo y no agregue indirección innecesaria.

---

## 4. React y Next.js: Server Components y Client Components

- Todos los componentes son **Server Components por defecto**.
- Añade `"use client"` únicamente cuando el componente necesite estado, efectos, eventos de interacción, gráficas interactivas o acceso a contexto/almacenamiento cliente.
- Mantén el límite de cliente tan pequeño como sea práctico.
- No accedas a `localStorage`, `window` ni `navigator` durante el renderizado en servidor; maneja la hidratación con estados de carga limpios.
- Usa `Link` de `next/link` para navegación interna y `Image` de `next/image` cuando corresponda.

---

## 5. Separación de JSX y estilos

Para componentes con estilos sustanciales o que requieran una convención uniforme, utiliza:

```text
LabResultDetail/
├── LabResultDetail.tsx
└── LabResultDetail.styles.ts
```

Reglas:

- En componentes pequeños o simples, mantén las clases Tailwind directamente en el JSX si separar el archivo añade más complejidad que claridad.
- Evita duplicar grandes cadenas de clases Tailwind; extrae primitivas a `src/components/shared/ui/`.
- Nunca uses colores quemados de Tailwind en componentes; utiliza exclusivamente los tokens semánticos de `src/app/globals.css` (ver `.agents/rules/ui-tokens.md` y el skill `rubi-hce-ui`).

---

## 6. Tokens semánticos, temas y UI compartida

Gestiona todos los colores desde `src/app/globals.css` con soporte para **Modo Claro (default clínico)** y **Modo Oscuro opcional (Modo Guardia)**, incluyendo:

- **Interfaz base:** `background`, `foreground`, `card`, `card-foreground`, `muted`, `muted-foreground`, `border`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `ring`.
- **Estados clínicos:** `clinical-normal`, `clinical-warning`, `clinical-critical` y sus variantes de superficie suave (`-soft`) y texto (`-foreground`).

Consulta siempre `.agents/rules/ui-tokens.md` y el skill `rubi-hce-ui` antes de crear o modificar interfaces.

---

## 7. Idioma y terminología clínica (Español — Perú)

- El idioma principal de **Rubí HCE** es **español (Perú, `es-PE`)**.
- Usa terminología estándar de Medicina Interna en Perú:
  - Identificación: `DNI`, `N° HC`, cobertura (`SIS`, `EsSalud`, `Privado`, `Particular`).
  - Diagnósticos: código `CIE-10` + descripción clínica.
  - Unidades métricas estándar: `mg/dL`, `%`, `g/dL`, `U/L`, `mL/min/1.73m²`, `mmHg`, `kg`, `cm`.
  - Fechas legibles en español (ej. `17 nov 2026`).
- No introduzcas infraestructura bilingüe (`src/i18n/`) salvo que exista un requerimiento real multiidioma.

---

## 8. Accesibilidad y usabilidad clínica

- Utiliza HTML semántico (`aside`, `header`, `nav`, `main`, `section`) y una jerarquía clara de encabezados (`h1` principal por vista).
- Todo control interactivo debe ser operable con teclado y mostrar foco visible (`ring-ring`).
- Los botones de solo ícono deben incluir `aria-label`.
- **No depender solo del color en alertas clínicas:** acompaña siempre verde/ámbar/rojo con etiqueta textual (`Normal`, `Límite`, `Alto`, `Bajo`, `Crítico`) o ícono accesible.
- Incluye estados explícitos de **carga**, **error** y **vacío** en listados y vistas clínicas.

---

## 9. Cambios, limpieza y código obsoleto

- No dejes código muerto, componentes comentados ni imports sin uso.
- Antes de eliminar un archivo existente, comprueba imports, exports, rutas y referencias.
- Evita refactorizaciones masivas no relacionadas con la tarea solicitada.
- Instala dependencias adicionales solo cuando una funcionalidad concreta lo justifique (ej. `lucide-react` para íconos o librería de gráficas para tendencias) y evita duplicar librerías para el mismo problema.

---

## 10. Flujo de trabajo del agente

Antes de modificar código:

1. Inspecciona `package.json`, `AGENTS.md`, `.agents/rules/` y los archivos existentes del módulo.
2. Identifica la ruta en `src/app/` y la carpeta correspondiente en `src/components/portal/`.
3. Reutiliza primitivas de `src/components/shared/ui/`, tipos de `src/types/clinical.ts` y helpers de `src/lib/clinical/`.

Al implementar:

1. Mantén `page.tsx` sin HTML ni lógica cliente; delega la vista al módulo correspondiente.
2. Conserva Server Components por defecto y acota los Client Components a la interacción necesaria.
3. Mantén la lógica clínica en `src/lib/clinical/` y la persistencia en `src/services/`.

Antes de terminar:

1. Revisa el diff y limpia cambios accidentales.
2. Resume qué cambió, qué archivos se crearon/modificaron y qué dependencias se agregaron.
