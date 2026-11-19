# Regla Obligatoria de Sistema de Diseño y Tokens UI — Rubí HCE (Next.js)

## 1. Prohibición Estricta de Colores Quemados (Hardcoded)

- Está **estrictamente prohibido** escribir colores directos o arbitrarios de Tailwind (`bg-blue-600`, `bg-indigo-*`, `bg-slate-*`, `bg-green-*`, `bg-amber-*`, `bg-red-*`) o códigos hexadecimales (`bg-[#2563EB]`) directamente en componentes para botones, tarjetas, acentos, bordes o estados clínicos.

## 2. Uso Obligatorio de Tokens Semánticos (`src/app/globals.css`)

Todo componente nuevo o modificado debe usar exclusivamente los **nombres de tokens semánticos** definidos en `src/app/globals.css` (la fuente única de los valores `#HEX` y temas Claro/Oscuro vive en el skill `rubi-hce-ui`):

- **Acción principal y énfasis:** `bg-primary`, `text-primary-foreground`, `hover:bg-primary-hover`, `text-accent`, `ring-ring`.
- **Acción secundaria:** `bg-secondary`, `text-secondary-foreground`.
- **Superficies y textos:** `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-card-foreground`, `text-muted-foreground`.
- **Bordes:** `border-border`.
- **Estados clínicos (uso exclusivo para información médica):**
  - **Normal / En rango:** `bg-clinical-normal`, `bg-clinical-normal-soft`, `text-clinical-normal`
  - **Límite / Atención:** `bg-clinical-warning`, `bg-clinical-warning-soft`, `text-clinical-warning`
  - **Crítico / Alerta / Alergia:** `bg-clinical-critical`, `bg-clinical-critical-soft`, `text-clinical-critical`

## 3. Respeto al Skill de UI (`rubi-hce-ui`)

- Consulta siempre el skill `rubi-hce-ui` para los valores de paleta (Modo Claro por defecto y Modo Oscuro opcional), patrones clínicos (Banner del paciente, Barra de rango, Gráfica de tendencias), `tabular-nums` en valores médicos/DNI, etiquetas accesibles junto al color y uso exclusivo de iconos de `lucide-react` (cero emojis).
