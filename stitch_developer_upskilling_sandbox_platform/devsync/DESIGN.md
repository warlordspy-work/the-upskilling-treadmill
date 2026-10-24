---
name: DevSync
colors:
  surface: '#0e1321'
  surface-dim: '#0e1321'
  surface-bright: '#343948'
  surface-container-lowest: '#090e1c'
  surface-container-low: '#161b2a'
  surface-container: '#1a1f2e'
  surface-container-high: '#252a39'
  surface-container-highest: '#303444'
  on-surface: '#dee2f6'
  on-surface-variant: '#c2cab0'
  inverse-surface: '#dee2f6'
  inverse-on-surface: '#2b303f'
  outline: '#8c947c'
  outline-variant: '#424936'
  surface-tint: '#98da27'
  primary: '#ccff80'
  on-primary: '#213600'
  primary-container: '#a3e635'
  on-primary-container: '#416400'
  inverse-primary: '#446900'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#eeedff'
  on-tertiary: '#131e8c'
  tertiary-container: '#cccfff'
  on-tertiary-container: '#444fb7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b2f746'
  primary-fixed-dim: '#98da27'
  on-primary-fixed: '#121f00'
  on-primary-fixed-variant: '#334f00'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#000767'
  on-tertiary-fixed-variant: '#2f3aa3'
  background: '#0e1321'
  on-background: '#dee2f6'
  surface-variant: '#303444'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for modern developer upskilling platforms where cognitive clarity, deep focus, and technical credibility are paramount. Designed specifically to alleviate "AI anxiety" and prolonged screen fatigue, the aesthetic merges technical minimalism with high-precision developer-tool ergonomics. 

Rather than overwhelming learners with gamified noise, the system cultivates calm mastery through a deep, atmospheric dark interface paired with an energetic electric lime signal. Key tenets include:
- **Calm Authority**: Technical depth without clutter; UI elements recede into deep slate-navy surfaces to prioritize code snippets, interactive terminals, and conceptual graphs.
- **Signal-to-Noise Precision**: Color is strictly functional. Electric lime acts as a decisive beacon for kinetic forward progress, active executions, and crucial CTAs.
- **Instrument-Grade Tactility**: Sharp borders, subtle sub-pixel edge highlights, and muted atmospheric glows on interactive focus evoke high-end terminal environments and polished developer utilities.

## Colors

The palette is tuned specifically for deep dark mode to minimize photic stress while maintaining pristine contrast tokens that surpass WCAG AAA standards for text legibility.

- **Background & Canvas**:
  - `Canvas Root`: `#0A0F1D` (abyssal slate navy) creates an immersive, low-strain backdrop.
  - `Surface Low`: `#0F172A` (deep structural slate) for sidebars, terminal shells, and panels.
  - `Surface Mid`: `#1E293B` for elevated cards, active list items, and modal layers.
  - `Surface High / Hover`: `#334155` for interactive component hover states and secondary action surfaces.

- **Borders & Dividers**:
  - `Border Subtle`: `#1E293B` for grid rails, card strokes, and subtle content boundaries.
  - `Border Muted`: `#334155` for high-definition container division and neutral inputs.
  - `Border Focus / Active`: `#A3E635` at 40%–100% opacity for targeted feedback.

- **Primary Signals**:
  - `Primary (Electric Lime)`: `#A3E635` (hover: `#84CC16`, muted container: `#14532D`, foreground text on primary: `#0A0F1D`). Used selectively for high-priority CTAs, real-time compilation success, completion metrics, and active terminal flags.

- **Typography & Content**:
  - `Text Primary`: `#F8FAFC` (pure off-white, anti-glare).
  - `Text Secondary`: `#E2E8F0` for body copy and code context.
  - `Text Muted`: `#94A3B8` for labels, timestamps, line numbers, and passive metrics.

## Typography

The typographic hierarchy balances rapid scannability with long-form comfort:

1. **System Interface (`Inter`)**: Handled for all navigation, headings, conceptual instructional copy, and operational UI. Headings employ tight tracking (`-0.025em` to `-0.015em`) and solid weights to ensure distinct visual anchoring. Body copy preserves a generous line-height (`1.5` to `1.6`) to combat developer fatigue during deep-dive reading.
2. **Technical Surface (`JetBrains Mono`)**: Applied to all code editors, console readouts, keystroke tooltips, metrics badges, and curriculum milestone tags. Tabular numbers are enabled by default (`tnum`) to keep execution times, tokens, and progress figures perfectly aligned.

## Layout & Spacing

This design system uses a responsive fluid grid optimized for dual-purpose workflows (curriculum guides alongside side-by-side terminal/code environments).

- **Desktop (1200px+)**: 12-column layout with `2rem` outer page margins and `1.5rem` gutters. IDE-like split interfaces use flexible ratio grids (e.g., 40% curriculum panel, 60% dynamic sandbox).
- **Tablet (768px – 1199px)**: 8-column layout with `1.5rem` margins and `1rem` gutters. Sandbox panels transition to tabbed views or stacked viewports.
- **Mobile (<768px)**: 4-column layout with `1rem` margins and `1rem` gutters. Code execution windows convert to dedicated full-width sheets with horizontal scroll controls.

Spacing relies on a strict 4px/8px incremental rhythm. Generous vertical breathing room (`space-xl`) between curriculum chapters prevents information overload, while compact inner component padding (`space-xs` to `space-sm`) retains professional, tool-like efficiency.

## Elevation & Depth

To prevent screen fatigue and maintain an authentic developer aesthetic, physical drop shadows are eliminated in favor of **Tonal Layering** and **Subtle Luminous Borders**:

- **Ground Level (Canvas)**: `#0A0F1D` flat base plane.
- **Level 1 (Panels & Groupings)**: `#0F172A` background encased in a 1px border of `#1E293B`.
- **Level 2 (Cards & Floating Units)**: `#1E293B` background with a 1px border of `#334155`.
- **Level 3 (Overlays & Dialogs)**: `#1E293B` background layered over a semi-opaque `#0A0F1D`/80 backdrop blur (`backdrop-filter: blur(12px)`), bounded by a 1px `#475569` perimeter.
- **Interactive Luminescence**: When interactive targets (cards, primary buttons, input fields) receive hover or active focus, visual lift is achieved not via heavy blur, but via a crisp border transition to `#A3E635` accompanied by an ultra-subtle, directional neon halo: `box-shadow: 0 0 16px -4px rgba(163, 230, 53, 0.18)`.

## Shapes

The shape system adopts a **Soft (Level 1)** curvature model. Buttons, input fields, tags, and small badges utilize `4px` (`0.25rem`) corner radiuses, reflecting the structured, engineered geometry of code editors and IDE controls. 

Large content cards, console terminals, and modal surfaces step up to `8px` (`0.5rem`, `rounded-lg`). Fully rounded or circular radii are reserved exclusively for circular progress rings and user avatar status pips. This restrained geometry enforces a crisp, mature, and utilitarian identity.

## Components

### Buttons
- **Primary Action**: Solid `#A3E635` background with `#0A0F1D` bold text. Radius `4px`. On hover: `#84CC16` with a soft lime ambient glow (`0 0 12px rgba(163, 230, 53, 0.25)`). Active: scale `0.99`.
- **Secondary / Ghost**: Background transparent, 1px border of `#334155`, text `#E2E8F0`. On hover: border `#94A3B8`, background `#1E293B`.
- **Terminal Run**: Dark surface `#0F172A` with a left border accent of `#A3E635`, text `JetBrains Mono` 13px.

### Chips & Badges
- **Status / Active**: `#0A0F1D` surface with a 1px border of `#A3E635`/40, text `#A3E635`, prefixed by a blinking 6px lime pulse dot.
- **Language / Skill Tag**: Background `#1E293B`, text `#94A3B8`, 1px border `#334155`, font `JetBrains Mono` 11px uppercase.

### Cards (Course Modules & Challenges)
- Surface `#0F172A`, 1px border `#1E293B`, `8px` corner radius, internal padding `1.5rem`.
- On hover: border transitions smoothly to `#334155`, headline illuminates from `#E2E8F0` to `#F8FAFC`.

### Progress Indicators
- Linear track: `#1E293B`, 4px height, filled bar in solid `#A3E635` with an animated subtle end-glow cap.

### Input Fields & Terminal Consoles
- Inputs: `#0A0F1D` background, 1px border `#334155`, text `#F8FAFC`, placeholder `#64748B`. Focus state: border `#A3E635`, outline: none, 2px translucent glow ring.
- Terminal Output Box: `#0A0F1D` background, top bar with mock window controls, font `JetBrains Mono`, syntax highlighted with secondary blues and lime execution flags.

### Checkboxes & Milestone Radios
- Square 16px with 3px border radius. Unchecked: 1px border `#334155`, background `#0F172A`. Checked: solid `#A3E635` fill with `#0A0F1D` checkmark icon.