# Design System: AI-Powered National Unified Material Master Platform

## 1. Visual Theme & Atmosphere
A high-agency, executive engineering cockpit with calibrated data density and fluid spring-physics micro-interactions. The visual atmosphere is clinical, refined, and distinctly modern — bridging heavy enterprise industrial governance with the speed and elegance of modern fintech systems. It completely rejects outdated paper/PDF aesthetics in favor of crisp surfaces, subtle diffused depth, precision typography, and active telemetry pulses.

## 2. Color Palette & Functional Roles
- **Canvas Substrate** (`#F8FAFC` / Slate-50) — Clean, modern application background canvas.
- **Pure Surface** (`#FFFFFF`) — Card, modal, and primary container fills.
- **Recessed Surface** (`#F1F5F9` / Slate-100) — Tab backgrounds, nested data cells, and interactive table headers.
- **Charcoal Ink** (`#0F172A` / Slate-900) — Primary headers, dominant typography, high-contrast labels.
- **Muted Steel** (`#64748B` / Slate-500) — Secondary text, metadata, telemetry subtitles, unit dimensions.
- **Whisper Border** (`#E2E8F0` / Slate-200) — 1px razor-sharp structural dividers and card borders.
- **Signal Crimson Accent** (`#E11D48` / Rose-600) — Primary focal CTA, active triage indicators, and critical alert highlights (Saturation < 80%, strictly no neon glows).
- **Verified Emerald** (`#059669` / Emerald-600) — Green Tier auto-match confirmations and unbroken cryptographic ledger status.
- **Adjudication Amber** (`#D97706` / Amber-600) — Yellow Tier human-in-the-loop review alerts and tolerance warnings.

## 3. Typography Architecture
- **Display & Headlines:** `Geist` / `Outfit` / `Satoshi` — Track-tight (`-0.025em`), controlled scale hierarchy, weight-driven emphasis (Bold 700 / Semi-Bold 600).
- **Body:** `Geist` / `Inter-Free Sans` — Relaxed leading (`1.5`), 65ch maximum line length, high contrast Charcoal Ink.
- **Telemetry & Numbers:** `JetBrains Mono` — Monospace for all material codes (`NMC-100023`), SAP part numbers, confidence percentages, price values (`₹14,200`), and cryptographic SHA-256 hashes.
- **Banned:** Generic browser serifs, decorative script fonts, screaming oversized low-contrast typography.

## 4. Component Behaviors & Stylings
- **Buttons:** Tactile push feedback on `:active` (`scale-[0.98]` and `translate-y-[1px]`). Solid Signal Crimson or Deep Slate fill with crisp white text. Secondary buttons use clean white surfaces with Slate-200 borders.
- **Cards & Data Panels:** Generously rounded corners (`rounded-xl` / `12px`), 1px Slate-200 border, and soft diffused whisper shadow (`shadow-xs` / `shadow-sm`). Elevation communicates hierarchy; background nesting creates spatial clarity.
- **Badges & Indicators:** Pill-shaped and square-cut micro badges with soft tinted background fills and matching border tones (`bg-emerald-50 text-emerald-700 border-emerald-200`).
- **Telemetry Pulses:** Active 6-Agent AI status indicators feature subtle CSS ping/pulse micro-animations (`animate-pulse`).
- **Loading & Empty States:** Precision skeletal shimmer overlays matching exact layout dimensions. Zero generic circular spinners.

## 5. Layout Principles & Grid System
- **Cockpit-Dense Dashboard Layout:** Max-width containment (`1440px`), clean section grouping, and responsive CSS grid architectures.
- **Asymmetric Comparison Split:** The Reviewer Portal features a balanced dual-panel comparison with the 5-Axis Radar Chart and XAI Diff Matrix serving as the central visual anchor.
- **Responsive Strategy:** Strict single-column collapse on viewports `< 768px` with no horizontal overflow. Full viewport height stability using `min-h-[100dvh]`.

## 6. Motion Philosophy & Micro-Interactions
- **Physics Engine:** Spring physics feel (`cubic-bezier(0.25, 1, 0.5, 1)`), 150–200ms transitions.
- **Hardware Acceleration:** Animations restricted exclusively to GPU-safe `transform` and `opacity`.
- **Perpetual Micro-Interactions:** Continuous live status indicators, smooth slider updates on the Strategic Sourcing simulator, and optimistic UI transitions.

## 7. Explicit Anti-Patterns (Banned)
- ❌ No PDF / plain paper-document appearance.
- ❌ No retro brutalist black-and-white print styling.
- ❌ No AI purple/neon gradients or glow effects.
- ❌ No emojis in interface controls.
- ❌ No overlapping elements or absolute position clutter.
- ❌ No fake round numbers (`99.99%`).
- ❌ No generic copywriting clichés ("Elevate", "Next-Gen").
