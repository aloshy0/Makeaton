# Brightloop Software — Design System Specification
## Enterprise SaaS UI/UX Guidelines

---

## 1. Visual Language & Principles

Brightloop is styled as a world-class financial technology platform (comparable to Stripe Billing, Chargebee, and modern SaaS dashboards). 

- **Purposeful Minimalism**: Clean whitespace, subtle borders (`border-slate-200/60 dark:border-slate-800`), dense readability.
- **No Novelty Distractions**: No exaggerated neon gradients, no bloated cards, no dead non-functional buttons.
- **Immediate Financial Clarity**: High-contrast typographic hierarchy for numbers, currencies, and timestamps.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Primary Brand Palette
- **Primary Navy / Indigo**: `slate-950` / `indigo-600`
  - Default Active Accent: `#4f46e5` (`indigo-600`)
  - Accent Hover: `#4338ca` (`indigo-700`)
  - Deep Navy Sidebar: `#0f172a` (`slate-900`) / Surface `#020617` (`slate-950`)

### 2.2 Neutral Canvas
- Page Background: `#f8fafc` (`slate-50`)
- Card & Surface: `#ffffff` (`white`) with subtle shadow `shadow-sm`
- Border: `#e2e8f0` (`slate-200`)
- Subdued Text: `#64748b` (`slate-500`)
- Body Text: `#334155` (`slate-700`)
- Headings & KPI Numerals: `#0f172a` (`slate-900`)

### 2.3 Status Badges & Lifecycle Indicators

| Status | Background | Text | Border | Indicator Dot |
|---|---|---|---|---|
| **Active / Paid** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | `bg-emerald-500` |
| **Confirmed** | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `bg-blue-500` |
| **Quotation** | `bg-indigo-50` | `text-indigo-700` | `border-indigo-200` | `bg-indigo-500` |
| **Draft** | `bg-slate-100` | `text-slate-700` | `border-slate-200` | `bg-slate-400` |
| **Paused** | `bg-amber-50` | `text-amber-700` | `border-amber-200` | `bg-amber-500` |
| **Closed / Cancelled**| `bg-slate-100` | `text-slate-600` | `border-slate-200` | `bg-slate-500` |
| **Overdue** | `bg-rose-50` | `text-rose-700` | `border-rose-200` | `bg-rose-500` |

---

## 3. Financial KPI Card Anatomy

Each KPI Card features:
1. **Title Label**: 12px uppercase tracking-wider (`text-xs font-semibold text-slate-500 tracking-wider uppercase`).
2. **Current Metric**: 24px-28px bold tabular numbers (`text-2xl font-bold tracking-tight text-slate-900 font-mono`).
3. **Trend / Context Badge**: Subtle delta badge indicating monthly comparison or count.
4. **Contextual Icon**: Lucide icon in subtle container (`w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600`).

---

## 4. Typography & Tables

- **Font Family**: Inter / System UI sans-serif stack.
- **Numbers / Currencies**: Monospace / tabular numbers (`font-mono` / `tabular-nums`) to align decimal places vertically in data tables.
- **Table Density**:
  - Header: `px-4 py-3 text-xs font-semibold uppercase text-slate-500 bg-slate-50/75 border-b border-slate-200`.
  - Rows: `px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100 hover:bg-slate-50/50 transition-colors`.

---

## 5. Component States

Every data component strictly implements:
- **Loading State**: Subtle Skeleton pulses (`animate-pulse bg-slate-200/70 h-4 rounded`).
- **Empty State**: Icon illustration, informative prompt ("No active subscriptions found"), and actionable primary button ("Create Subscription").
- **Error State**: Non-blocking alert banner with explicit retry action.
