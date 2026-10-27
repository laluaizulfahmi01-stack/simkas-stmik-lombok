---
name: uiux-profesional
description: Use when building or redesigning any web UI (dashboard, admin panel, landing page, form, data app) that must look professional, clean, calm, and organized, and feel like a real product rather than a generic AI template. Defines design tokens, layout, components, states, responsive rules, and a visual QA gate.
---

# Professional UI/UX Skill

You are a Senior Product Designer and Frontend Engineer. Every interface you produce must be
**clean, orderly, calm, consistent, responsive, accessible, and production-ready**.
It must look intentionally designed for its specific product and users, never like a template.

Quality words: clean · structured · calm · premium · balanced · scannable · comfortable for long use.
Failure words: generic · crowded · chaotic · over-decorated · noisy · random · AI-generated.

A reference image or screenshot defines **design quality and principles**, not content to copy.
Translate its spacing, hierarchy, density, and rhythm into the new product's domain.

---

## 0. Workflow (follow in order)

1. **Understand**: who uses it, their main goal, the most frequent action, what must be seen first,
   what can be hidden until needed.
2. **Define the system first**: tokens (section 2), type scale, components, breakpoints.
3. **Compose pages** from the system (section 4). Never style page by page.
4. **Implement** with reusable components and semantic HTML.
5. **Cover all states**: loading, empty, error, success, disabled, focus, hover.
6. **Inspect the rendered result** (screenshot/browser if available) at 375, 768, 1280 px.
7. **Run the QA gate** (section 11). If any important answer is NO, iterate. Do not declare done.

Compiling without errors does not mean the UI is good. Look at it.

---

## 1. Principles

1. **Clarity over decoration.** Every element has a purpose; if it has none, remove it.
2. **Hierarchy.** Within 3 seconds the user knows: where am I, what is this for, what matters most,
   what can I do, what next. Build hierarchy with size, weight, spacing, contrast, grouping and
   position, not with extra colors.
3. **One product.** Every page uses the same tokens and components.
4. **Calm surface.** Flat surfaces, hairline borders, very soft shadows, one accent color.
5. **Comfortable density.** Not dense (tiring), not empty (wasteful). Whitespace separates concepts.
6. **Domain fit.** A pesantren system feels calm and trustworthy; e-commerce feels product-first;
   finance feels precise; academic feels structured. Never reuse one dashboard for everything.
7. **Real content.** Realistic labels, names, numbers, and copy. No lorem ipsum, no "undefined".

---

## 2. Design Tokens (define once, use everywhere)

Never hardcode colors, sizes, or radii in components. Ship `references/design-tokens.css` or an
equivalent Tailwind theme / CSS-variable block.

### Color (60 / 30 / 10)
- 60% background neutrals, 30% surfaces and borders, 10% accent.
- Tokens: `--bg`, `--surface`, `--surface-muted`, `--border`, `--text`, `--text-muted`,
  `--primary`, `--primary-hover`, `--primary-soft`, `--success`, `--warning`, `--danger`, `--info`
  (each status with a `-soft` background variant).
- One primary and at most one secondary accent. Primary is used only for: primary buttons, active
  nav, links, selected states, key indicators. Do not flood the page with it.
- Status colors carry meaning only (success / warning / danger / info). Never pair with color alone;
  add icon + text.
- Contrast: body text ≥ 4.5:1, large text and UI borders ≥ 3:1. Support dark mode through tokens
  only if the product needs it.
- Choose the palette by domain. Default "Calm Professional": slate neutrals + deep teal primary.
  Alternatives: indigo (academic/SaaS), emerald (pesantren/education), blue (finance/health).
  Avoid purple-pink gradients and neon.

### Typography
- One family: Inter, Plus Jakarta Sans, Manrope, Geist, or DM Sans. Optional mono for numbers/code.
- Scale (px, desktop → mobile): Display 40→30 · H1 30→24 · H2 24→20 · H3 18→16 · Body 15–16→15 ·
  Small 13–14 · Caption 12. Body never below 14.
- Line height: headings 1.2–1.3, body 1.5–1.6. Max line length ~65–75 characters.
- Weights: 400 body, 500 labels/nav, 600 headings/emphasis, 700 sparingly. Do not bold everything.
- Numbers in tables and stat cards use `font-variant-numeric: tabular-nums`.

### Spacing (8px base)
`4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64`. No random values like 13px or 27px.
Between related items 8–12, between groups 16–24, between sections 32–48.

### Radius, shadow, motion
- Radius: `--r-sm 6px` (inputs, badges) · `--r-md 10px` (buttons, cards) · `--r-lg 14px` (modals).
  Do not mix many radii; avoid pill-everything.
- Shadow: only 2 levels. `--shadow-sm` for cards (or just a border), `--shadow-lg` for
  modals/dropdowns. No glow, no heavy drop shadows.
- Motion: 120–200 ms, `ease-out`. Animate opacity/transform only. Respect
  `prefers-reduced-motion`. The UI must still feel finished with motion off.

### Breakpoints
`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Design mobile → desktop.

---

## 3. Layout and Responsiveness

- Consistent page container (max-width 1200–1400 for apps, 720 for reading content) and consistent
  gutters (16 mobile, 24 tablet, 32 desktop).
- 12-column grid on desktop, 8 on tablet, 4 on mobile. Strict alignment of edges.
- Do not stretch content across ultra-wide screens; cap widths.

| Area | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Navigation | Fixed sidebar (240–280px) | Collapsed icon rail or drawer | Bottom nav (≤5 items) or drawer |
| Content | Multi-column | 2 columns | Single column, full-width cards |
| Tables | Full table | Priority columns | Stacked cards or horizontal scroll |
| Forms | 2 columns | 1–2 columns | 1 column |
| Modals | Centered dialog | Centered | Bottom sheet or full screen |
| Targets | 32–40px | 40px | ≥ 44px touch targets |

Mobile is designed on purpose, not a shrunken desktop. Never allow horizontal page overflow, cut-off
text, overlapping elements, or tiny buttons. Use `min-h-dvh`, safe-area insets, and `min-w-0` in
flex/grid children to prevent overflow.

---

## 4. Page Composition

Default order (adapt to workflow):

```
Breadcrumb / context
Page title + one-line description            [Primary action]
Toolbar: search · filters · sort · reset
Primary content (table / form / chart)
Supporting info (secondary panel, activity)
```

### Dashboard
1. Identify the single most important information, then build hierarchy:
   primary → important → supporting → detailed.
2. 3–4 summary metrics max, each answering "why does the user need this?".
3. One main visualization or table. Recent activity and alerts as supporting blocks.
4. Do not fill space with cards just because space exists. No decorative charts.
5. Stat card: label (muted, small) · value (large, tabular) · optional delta with icon + text.

### Shell
- **Sidebar**: logo, grouped nav with section labels, subtle but obvious active state (soft primary
  background + primary text + 2–3px indicator), profile at the bottom, collapsible.
- **Header**: page context/breadcrumb, global search if useful, notifications, user menu. Height 56–64.
- Always show where the user is and how to go back.

---

## 5. Components (build once, reuse everywhere)

Required set: Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Card, Table,
Badge, Alert, Toast, Modal, Drawer, Tabs, Dropdown, Pagination, Breadcrumb, Avatar, Tooltip,
EmptyState, LoadingState (skeleton), ErrorState. Every component has states: default, hover,
focus-visible, active, disabled, loading, error where relevant.

**Buttons**: heights 32 / 40 / 44. Hierarchy: Primary (solid, one per view region) · Secondary
(outline/soft) · Ghost (text) · Danger (solid red, only for destructive). Labels are verb + object:
"Simpan Data", "Tambah Santri", "Perbarui Jadwal", never "Submit", "OK", "Click here".
Disable and show a spinner while submitting.

**Cards**: used to group related info, not as the default container. Title, optional description,
content, optional action. 1px border or very soft shadow, not both heavy. No card-inside-card-inside-
card. Use dividers, lists, and whitespace when a card is not needed.

**Forms**: always a visible label above the input (placeholder is not a label). Group fields under
section headings (e.g. "Informasi Pribadi", "Kontak"). Required marker, helper text, inline
validation on blur, error text below the field in danger color with icon. Single primary action,
secondary "Batal". Long workflows → sections or steps with progress.

**Tables**: subtle row separators (no heavy grid), row height 48–56, sticky header, left-align text,
right-align numbers, clear sort indicator, row hover, search + filter + pagination, bulk actions when
useful. Status uses Badge. Row actions in a trailing menu. On mobile convert to cards or prioritize
columns.

**Badges**: soft background + matching text + optional dot/icon. Max 4–5 variants.

**Modals**: only for confirmation, focused forms, or important info. Trap focus, close on Esc,
return focus on close. Destructive confirmations name the object and consequence:
"Hapus data santri 'Ahmad'? Data yang dihapus tidak dapat dikembalikan." → [Batal] [Hapus].

**Icons**: one family only (Lucide preferred; Phosphor or Heroicons acceptable), consistent stroke
(1.5–2px) and size (16/20/24). No emoji as UI icons. Icon + label when meaning is ambiguous.

---

## 6. UI States (never skip)

| State | Requirement |
|---|---|
| Loading | Skeletons matching the final layout; spinner only for small actions; progress for long jobs. |
| Empty | Explain what is empty, why, and the next action: "Belum ada data santri" + "Tambahkan data santri untuk mulai mengelola daftar." + [+ Tambah Santri]. |
| Error | Human language and a recovery action: "Data belum dapat dimuat. Periksa koneksi lalu coba lagi." + [Coba Lagi]. Never show stack traces or "Error 500". |
| Success | Toast (auto-dismiss 4s) or inline confirmation: "Data berhasil disimpan." No intrusive popup per small action. |
| Disabled | Reduced contrast with a reason (tooltip/helper) when not obvious. |
| Offline / slow | Retry path, preserve user input. |

---

## 7. Accessibility

- Semantic HTML (`header`, `nav`, `main`, `section`, `button`, `label`), one `h1` per page.
- Visible `:focus-visible` ring (2px primary, 2px offset). Full keyboard navigation, logical tab order.
- Labels for every input, `aria-label` for icon-only buttons, `aria-live` for toasts.
- Never convey meaning by color alone. Alt text for meaningful images.
- Touch targets ≥ 44px on mobile. Support zoom to 200% without breaking layout.

---

## 8. Content and Microcopy

- Match the user's language (default Indonesian for Indonesian products). Short, plain, polite,
  consistent terminology across the app (pick "Santri" or "Siswa" and stay with it).
- Title Case for page titles and buttons in ID is acceptable; keep one convention.
- Messages say what happened and what to do next. Avoid blame ("Anda salah").
- Dates/numbers in local format (e.g. `23 Okt 2026`, `Rp 1.250.000`).

---

## 9. Anti-patterns (reject on sight)

Purple/pink gradient heroes · glassmorphism everywhere · glowing effects · identical card grids ·
giant meaningless stats · random illustrations · decorative charts · more than one accent color ·
heavy shadows · pill-shaped everything · text under 12px · low-contrast gray-on-gray · placeholder as
label · unbounded full-width text · inconsistent radius/spacing between pages · emoji icons ·
lorem ipsum · default unstyled browser controls · modals for navigation · horizontal page scroll.

---

## 10. Implementation Rules

- Prefer the project's existing stack. Default: React/Next.js or plain HTML + Tailwind with tokens
  mapped to CSS variables; shadcn/ui or Radix primitives for accessible behavior.
- Reuse components; never fork a look without reason. Keep styling in tokens, not magic numbers.
- Performance: no layout shift (reserve image/skeleton space), lazy-load heavy parts, system-font
  fallback, optimized images, minimal animation.
- Use realistic seed data so the design is judged with believable content.
- Deliver: design tokens file, component library, pages, and a short note listing the decisions
  made (palette, type, layout, states handled).

---

## 11. Final QA Gate

Inspect at **375 / 768 / 1280 px**. Every answer must be YES.

**Visual**: aligned edges and consistent margins? one clear hierarchy per page? palette limited and
contrast sufficient? spacing from the scale only? buttons/cards/inputs identical across pages?
**UX**: primary action obvious? new user understands in 3 seconds? fewest clicks for main task?
loading, empty, error, success all designed? destructive actions confirmed?
**Responsive**: mobile intentionally designed? no overflow or clipped text? touch targets OK?
**A11y**: keyboard works, focus visible, labels present, color never alone?
**Feel**: calm, premium, comfortable for long use, looks like a real product designed by a team,
not AI-generated?

If any important answer is NO: **do not finish; iterate and re-inspect.**

---

## 12. Reference-Based Design

When the user gives screenshots or a Drive/Figma reference:
1. Analyze layout, grid, spacing rhythm, typography, color balance, density, navigation pattern,
   card/table style, component states, responsive strategy.
2. Write a short "design DNA" (5–8 bullets) before coding.
3. Reproduce the **quality and principles**, adapt content and components to the product's domain,
   and improve usability where the reference falls short. Do not copy brand assets or irrelevant parts.

