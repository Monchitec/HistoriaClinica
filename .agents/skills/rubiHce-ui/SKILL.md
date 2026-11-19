---
name: rubi-hce-ui
description: >-
  Identidad visual, sistema de diseño y estándares UI/UX para Rubí HCE (Historia Clínica Electrónica
  de Medicina Interna en Perú). Define la paleta Azul Clínico / Royal Blue con Modo Claro principal,
  Modo Oscuro opcional (Midnight Obsidian para guardias nocturnas), tokens semánticos clínicos
  (normal, límite, crítico), visualización de resultados y tendencias tipo Kaiser Permanente,
  tipografía tabular y cero emojis.
---

# Identidad Visual y Estándares UI/UX — Rubí HCE

Guía oficial de diseño, dirección de arte e interacción para **Rubí HCE**, optimizada para la práctica clínica diaria en **Medicina Interna (Perú)**.

---

## 1. Perfil del Producto e Industria

- **Nombre del Sistema:** Rubí HCE
- **Especialidad y Ámbito:** Historia Clínica Electrónica (HCE) enfocada en Medicina Interna (seguimiento de pacientes crónicos, resultados de laboratorio con tendencias, evolución SOAP, antecedentes y medicación).
- **Estilo Visual:** _Clinical Clarity & Structured Canvas_ — inspiración en la claridad informativa de **Kaiser Permanente / Epic**, combinada con la nitidez moderna de la paleta **Royal Blue & Midnight Obsidian**.
- **Arquetipo de Producto:** Rigor médico, lectura rápida en menos de 10 segundos, baja fatiga visual en jornadas largas y cero ruido visual innecesario.
- **Layout Principal:** **Sidebar izquierdo** fijo en escritorio (colapsable en móvil/tablet) + **Banner fijo del paciente** en las vistas de historia clínica + tarjetas limpias de lectura rápida.

---

## 2. Paleta Oficial de Colores y Tokens Semánticos

Todos los colores se gestionan exclusivamente mediante **Tokens Semánticos** en `src/app/globals.css`. El **Modo Claro** es el tema principal por defecto (ideal para consultorio con iluminación blanca y lectura densa de exámenes); el **Modo Oscuro** es un tema opcional activable por el médico (_Modo Guardia_).

### ☀️ Modo Claro _(Tema Principal / Default Clínico)_

- **Background (Lienzo general):** `#F4F5F7` (Gris clínico neutral fresco para descansar la vista)
- **Foreground (Texto principal y titulares):** `#0F172A` (Azul medianoche profundo, contraste WCAG AAA)
- **Card (Tarjetas, paneles y sidebar):** `#FFFFFF` (Blanco puro con borde `#E2E8F0` y sombra sutil)
- **Card Foreground:** `#0F172A`
- **Primary (Acción principal, navegación activa y enlaces clave):** `#2563EB` (Royal Electric Blue clínico, ratio > 4.5:1)
- **Primary Hover:** `#1D4ED8`
- **Primary Foreground:** `#FFFFFF`
- **Secondary (Acciones secundarias y chips neutros):** `#EFF6FF` (Azul clínico muy suave)
- **Secondary Foreground:** `#1E3A8A`
- **Accent (Resaltado informativo / enlaces de tendencia):** `#0284C7` (Azul celeste clínico legible sobre blanco)
- **Muted (Fondos de tablas, barras inactivas y filtros):** `#F1F5F9`
- **Muted Foreground (Metadatos, unidades, fechas y etiquetas):** `#475569`
- **Border (Divisores y bordes de tarjetas):** `#E2E8F0`
- **Ring (Foco accesible por teclado):** `#2563EB`

### 🌙 Modo Oscuro _(Opcional — Modo Guardia / Midnight Obsidian)_

- **Background (Canvas general):** `#0A0D14` (Midnight Obsidian)
- **Foreground (Texto principal):** `#F8FAFC`
- **Card (Contenedores y tarjetas):** `#111622` (Grafito elevado con borde `#1E293B`)
- **Card Foreground:** `#F8FAFC`
- **Primary (Acción principal):** `#2563EB` con hover `#3B82F6`
- **Primary Foreground:** `#FFFFFF`
- **Secondary (Botones secundarios / módulos):** `#161B26` con borde `#1E293B`
- **Secondary Foreground:** `#F8FAFC`
- **Accent (Acentos y enlaces):** `#38BDF8` (Sky Blue de alta nitidez sobre fondo oscuro)
- **Muted (Superficies secundarias):** `#161B26`
- **Muted Foreground (Metadatos y etiquetas):** `#94A3B8`
- **Border:** `#1E293B`
- **Ring:** `#38BDF8`

### 🩺 Tokens Semánticos Clínicos _(Uso exclusivo para estado médico)_

El verde, ámbar y rojo quedan **reservados estrictamente para significados clínicos** (nunca como decoración arbitraria):

| Estado Clínico                    | Uso Médico                                                                 | Modo Claro (Color / Fondo Suave) | Modo Oscuro (Color / Fondo Suave) |
| --------------------------------- | -------------------------------------------------------------------------- | -------------------------------- | --------------------------------- |
| **Normal (`clinical-normal`)**    | Valores en rango, banda verde de referencia en gráficas, estado controlado | `#16A34A` / `#DCFCE7`            | `#22C55E` / `#052E16`             |
| **Límite (`clinical-warning`)**   | Valores borderline / atención (ej. HbA1c `5.7%`, seguimiento próximo)      | `#D97706` / `#FEF3C7`            | `#F59E0B` / `#451A03`             |
| **Crítico (`clinical-critical`)** | Valores críticos fuera de rango y **alerta permanente de Alergias**        | `#DC2626` / `#FEE2E2`            | `#EF4444` / `#450A0A`             |

> **Identidad de marca sutil:** Si se incluye un detalle rubí en el isotipo del logotipo de **Rubí HCE** (ej. `#BE123C`), debe limitarse únicamente al ícono de marca para no confundirse nunca con las alertas críticas clínicas.

---

## 3. Regla de Proporción Cromática Clínica

1. **70% Lienzo Neutro y Tarjetas:** `#F4F5F7` y `#FFFFFF` (o `#0A0D14` y `#111622` en modo oscuro) para máxima legibilidad de datos médicos.
2. **20% Estructura y Tipografía:** `#0F172A` y `#475569` para jerarquía clara entre título, valor clínico y metadatos.
3. **10% Acciones y Señales Clínicas:** Azul `#2563EB` para navegación y CTAs del médico; Verde / Ámbar / Rojo **solo** para rangos, tendencias y alergias.

---

## 4. Tipografía y Tratamiento de Datos Médicos

- **Tipografía Principal:** `Geist Sans` o `Inter` (limpia, neutral y de lectura ágil).
- **Tipografía Monoespaciada (`Geist Mono`):** Opcional para códigos `CIE-10`, `N° HC` y `DNI`.
- **Cifras Tabulares Obligatorias (`tabular-nums`):** Aplicar `tabular-nums` en **todos** los valores de laboratorio, rangos de referencia, signos vitales (`PA`, `FC`, `IMC`, `TFGe`), dosis de medicamentos, edades, fechas y `DNI`, para que los números queden alineados al comparar columnas e historiales.
- **Jerarquía de lectura clínica:**
  - Valor de laboratorio: grande, `font-bold tabular-nums`, acompañado siempre de su unidad (`%`, `mg/dL`, `mL/min/1.73m²`).
  - Rango de referencia: visible inmediatamente debajo en `text-muted-foreground`.

---

## 5. Patrones UI Clave de Rubí HCE

### 5.1 Banner Fijo del Paciente (_Patient Banner_)

- Visible en la parte superior de todas las rutas `/portal/pacientes/[id]/*`.
- Muestra: Nombre completo, edad/sexo, `DNI`, `N° HC`, cobertura (`SIS` / `EsSalud` / `Privado` / `Particular`) y **badge destacado en `clinical-critical` para Alergias** (o `Sin alergias conocidas` en tono neutro).

### 5.2 Tarjetas de Acceso Rápido (_Quick Access Tiles_)

- Fila compacta en el Resumen de Salud (inspirada en Kaiser Permanente) con ícono en azul primario y etiqueta clara: _Resultados_, _Evolución SOAP_, _Medicamentos_, _Antecedentes_, _Signos vitales_.

### 5.3 Detalle de Resultado de Laboratorio con Barra de Rango

- **Barra horizontal proporcional** con zona normal en verde (`clinical-normal`) y zonas fuera de rango en ámbar/rojo (`clinical-warning` / `clinical-critical`).
- Marcador exacto posicionado según el valor del paciente (ej. cápsula `5.7` sobre la escala `4.6 - 5.6 %`).
- Botón visible **`Ver tendencias`** en la esquina superior derecha de la tarjeta.
- Panel lateral o inferior de metadatos: médico solicitante, fecha de toma, espécimen, laboratorio y estado (`Final` / `Pendiente`).

### 5.4 Gráfica de Tendencias Longitudinales

- Filtros temporales en cápsulas segmentadas: `Más reciente`, `Todos`, `Mes`, `Año`, `Personalizado`.
- **Banda sombreada verde (`clinical-normal-soft`)** delimitando el rango de referencia normal.
- Línea azul (`primary`) conectando controles cronológicos, con puntos coloreados según su estado clínico (`normal`, `límite`, `crítico`) y tooltip accesible con fecha, valor exacto y variación respecto al control previo.

---

## 6. Iconografía y Componentes Compartidos

- **Librería Oficial de Iconos:** `lucide-react` con trazo uniforme (`strokeWidth={1.75}`).
- **Prohibición Estricta de Emojis:** Cero emojis como iconos decorativos, de navegación o de alerta. Todo icono debe ser SVG de `lucide-react`.
- **Iconos Clínicos Estándar:**
  - Portal / Inicio: `LayoutDashboard`
  - Pacientes: `Users`, `UserPlus`
  - Resumen de salud: `HeartPulse` / `ClipboardList`
  - Resultados de pruebas: `FlaskConical`
  - Tendencias: `TrendingUp`
  - Evolución SOAP: `FileText`, `Stethoscope`
  - Medicamentos: `Pill`
  - Antecedentes: `FolderClock`, `History`
  - Signos vitales: `Activity`
  - Alergias / Alerta crítica: `AlertTriangle`, `ShieldAlert`
  - Búsqueda y tema: `Search`, `Sun`, `Moon`
- **Sistema de Botones Compartidos (`src/components/shared/ui/Button`):**
  - _Primario:_ `bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-sm`
  - _Secundario:_ `bg-secondary text-secondary-foreground hover:bg-secondary/80`
  - _Outline:_ `border border-border bg-card text-foreground hover:bg-muted`
  - _Ghost:_ `text-foreground hover:bg-muted`
  - _Crítico / Peligro:_ `bg-clinical-critical text-white hover:bg-clinical-critical/90`

---

## 7. Checklist de Calidad Pre-Entrega

Antes de dar por terminada cualquier pantalla o componente clínico:

- [ ] Sin emojis en ningún lugar de la interfaz (100% `lucide-react`).
- [ ] Cero colores quemados de Tailwind (`bg-blue-*`, `bg-red-*`, `bg-slate-*`, etc.); solo tokens semánticos de `src/app/globals.css`.
- [ ] Modo Claro como predeterminado y compatibilidad visual verificada en Modo Oscuro.
- [ ] `tabular-nums` aplicado a valores de laboratorio, vitales, fechas, dosis y DNI.
- [ ] Ninguna alerta clínica depende solo del color (siempre incluir etiqueta textual o ícono).
- [ ] `cursor-pointer` y estado de foco visible (`focus-visible:ring-2`) en todos los controles interactivos.
- [ ] Contraste mínimo **4.5:1** (WCAG AA) y diseño responsive (móvil, tablet y escritorio).
- [ ] Estados de carga, vacío y error contemplados.
