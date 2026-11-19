# Estándar Profesional de Arquitectura (Next.js App Router)

## 1. Principio de Responsabilidad Única para Rutas (`src/app/**/page.tsx`)

- Los archivos `page.tsx` son **únicamente orquestadores del servidor**, no pantallas de diseño.
- **Estructura permitida en `page.tsx`:**
  1. Metadata SEO (`Metadata` o `generateMetadata`).
  2. Preparación de datos del servidor (parámetros de ruta, cookies, headers, llamadas asíncronas).
  3. Composición de alto nivel (`return <FeatureView data={...} />` o envuelto con `<Suspense>`).
- **PROHIBICIÓN ESTRICTA:**
  - `page.tsx` NO debe contener marcado HTML directo (prohibido escribir etiquetas como `<div>`, `<button>`, `<header>`, `<main>`, `<p>`, `<input>`, listas, etc. directamente en la página).
  - `page.tsx` NO debe contener hooks de estado ni APIs de cliente (`useState`, `useEffect`, `useRef`, `window`, eventos `onClick`, etc.).
  - Si la página supera las ~100-120 líneas, es síntoma de que la lógica de obtención o transformación de datos debe extraerse a un archivo de servicio o consulta (`queries.ts`, `actions.ts` o en `lib/`).

## 2. Organización en `src/components/`

- **Componentes de Pantalla (`src/components/<modulo>/` o `src/components/<area>/<pagina>/`):**
  - Toda la interfaz visual, layout, estilos y eventos de usuario deben vivir aquí.
  - **No requieren ser reutilizables.** Su existencia se justifica por modularidad, legibilidad y separación de responsabilidades.
  - Divide una pantalla compleja en subcomponentes pequeños y enfocados dentro de esa misma carpeta.
- **Componentes Compartidos (`src/components/shared/` o `src/components/ui/`):**
  - Exclusivos para primitivas de diseño reutilizables en todo el proyecto (ej. `Button`, `Modal`, `Input`, `Badge`).

## 3. Tolerancia Cero al Código Monolítico

- Si una tarea requiere modificar una página y encuentras un `page.tsx` que mezcle interfaz visual y lógica de cliente, **está estrictamente prohibido seguir agregando código en él**. Se debe refactorizar delegando hacia `src/components/<modulo>/` antes o durante la tarea.
