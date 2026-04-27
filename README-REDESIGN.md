# Partiqle — Redesign Notes

**Mood:** Bold & kinetic dark. Mono-forward typography. Electric lime + violet accents, heavy use of monospace numerals for ticket/queue numbers.

Everything in this redesign ships as **style & layout changes only** — no business logic, route, server action, or data-fetch has been touched. All form `name` fields, hidden inputs, `handleRequest` flows, Supabase queries, and redirect contracts are preserved exactly.

---

## 1. Design tokens — `styles/main.css`

A single token layer drives every surface. Tokens live under `:root` at the top of the file.

| Token group | Purpose |
|---|---|
| `--pq-bg`, `--pq-surface-0..3` | Layered dark surfaces — deepest black at page, lifted for cards, brighter for hover |
| `--pq-ink-0..4` | Foreground scale from white (`#fafafa`) to muted (`#3f3f46`) |
| `--pq-border`, `--pq-border-strong`, `--pq-border-hover` | Hairline strokes; `--pq-line` / `--pq-line-strong` are aliases used in some pages |
| `--pq-accent` — `oklch(0.88 0.19 125)` | Electric lime — the "NOW / LIVE" signal |
| `--pq-violet` — `oklch(0.72 0.18 290)` | Secondary accent, used for waiting-ticket progress |
| `--pq-amber` / `--pq-rose` | Waiting-state + danger chips |
| `--font-sans` | `Geist` (falls back to Inter / system) — body + headings |
| `--font-mono` | `JetBrains Mono` — every number, label, eyebrow, chip |
| `--pq-r-sm` / `--pq-r` / `--pq-r-lg` | 6 / 10 / 14 px radii |

**Body background** is a 3-layer radial gradient: violet top-right, lime bottom-left, near-black base. Gives the whole app a subtle aurora without being noisy.

**Focus rings** use the lime accent with a dark halo so they're readable on every surface.

---

## 2. Primitives (CSS utility classes in `main.css`)

These are the building blocks used across every page:

- `.pq-grid-bg` — hairline 56px grid with radial mask; drop inside hero sections
- `.pq-eyebrow` — mono micro-label with pulsing lime dot (uses `::before`)
- `.pq-dot` — standalone pulsing lime dot for inline use inside an eyebrow that already has text
- `.pq-card` / `.pq-card-hover` — gradient-topped card with hairline border and hover lift
- `.pq-btn` / `.pq-btn-primary` / `.pq-btn-ghost` / `.pq-btn-danger` — button system. Primary is solid lime on black.
- `.pq-input` — dark textual input with focused lime ring
- `.pq-label` — mono uppercase label above inputs
- `.pq-chip` + variants (`-live`, `-waiting`, `-called`, `-skipped`) — status pills
- `.pq-ticket-number` — big monospace numeral with tight tracking for ticket displays
- `.pq-queue-row` — row styling for stacked queue list items (hover lift, first row tinted)
- `.pq-row-btn` / `.pq-row-btn-primary` — tiny inline buttons for queue row actions
- `.pq-divider` — hairline gradient divider
- Animations: `pq-pulse` (dot), `pq-fade-up` (mount), `pq-ring` (concentric pulse)

---

## 3. Navbar + Footer — `components/ui/Navbar`, `components/ui/Footer`

- Hairline bottom border, transparent background so the hero grid shows through
- Logo word-mark in `Geist`, lime dot next to it
- Auth-aware nav: `Businesses` / `Account` / `Sign out` for signed-in, `Sign in` for public
- Footer collapses to a single thin strip with wordmark + social icons + `© Partiqle`

---

## 4. Pricing / landing — `app/page.tsx` + `components/ui/Pricing/Pricing.tsx`

- Tight hero: mono eyebrow, large `-0.03em` tracked headline, single-sentence subhead
- Interval toggle rendered as a pill with lime active state
- Pricing cards are hairline-bordered, gradient-topped. The highlighted plan swaps border for lime glow.
- Monospace numerals on every price — `$29` / month reads like a ticker
- Abstract SVG shape (arcs + dots) sits behind the hero as a queue metaphor

---

## 5. Auth — `app/signin/[id]/page.tsx` + `components/ui/AuthForms/*`

- Centered single-column card on the page with grid background behind
- Mono labels, lime focus rings
- OAuth buttons (`SignUp`, `PasswordSignIn`, etc) share the `.pq-btn` base; provider icons stay
- Form submissions still go through `handleRequest(e, serverAction, router)` unchanged

---

## 6. Account — `app/account/page.tsx` + `components/ui/AccountForms/*`

- Page header matches the rest of the app (eyebrow + large title + one-line subhead)
- Three cards: `CustomerPortalForm`, `NameForm`, `EmailForm` — each uses the shared `Card` component with updated typography inside
- Subscription price rendered as `.pq-ticket-number` (big mono) + `/month` micro-label for visual consistency with queue numbers

---

## 7. Businesses list + new — `app/businesses/*`

- `businesses/page.tsx` — 3-column grid of business cards. Each card: mono `BIZ · 001` serial, active chip, name, description, creation date, `Manage lines →` ghost button
- Empty state is a big dashed card with CTA
- `businesses/new/page.tsx` + `AddBusinessForm.tsx` — single form card. Name + description fields, both using `.pq-input` + `.pq-label`
- Dev-only raw-JSON `<details>` block tucked at the bottom of each card for debugging

---

## 8. Lines list + new — `app/businesses/[id]/lines/*`

- Same card grid pattern as businesses, plus:
  - **Now-serving mini-display** per card: `.pq-ticket-number` number in lime when active, dash when idle
  - `Live` / `Idle` chip top-right
- `new/page.tsx` + `AddLineForm.tsx` — single clean form card

---

## 9. Line detail (the centerpiece) — `app/businesses/[id]/lines/[lineId]/page.tsx`

Split into three vertical bands:

**Header band** — back link, eyebrow with pulsing live dot, large line name, `Call next →` button top-right (disabled when empty).

**Now-serving ticket display**
- Huge `clamp(96px, 14vw, 200px)` mono numeral — lime when someone is called, dash when idle
- Lime glow (`textShadow`) on the number when live
- Customer name + phone below the number
- `● Called` pulsing chip
- Right-column stats panel with `Waiting` / `Served` / `Last called` mono counters

**Queue stream + sidebar**
- Queue column: `.pq-queue-row` stacked list. First row (next up) has a lime tint and `Next` chip. Each row has `Call` (primary) + `Skip` (ghost) row-buttons inline.
- Sidebar: QR card (240px QR image, copy-ready direct URL) + the `AddPositionForm` walk-in card
- History rendered as a collapsible `<details>` with a dense monospace table

---

## 10. Public join — `app/lines/[lineId]/join/page.tsx` + `PublicJoinLineForm.tsx`

- Full-page centered layout, grid background + top-radial lime glow
- Mono "You're joining" kicker above a large serif-tracked line name
- Single `Take a ticket` card with `Your name *` (autofocus) and optional `Phone`
- `Powered by Partiqle` wordmark below

---

## 11. Position (customer waiting view) — `app/lines/[lineId]/positions/[positionId]/page.tsx`

The digital pager. Three states: `waiting` / `called` / `skipped`.

- Eyebrow flips between `Your ticket` and `Called — head in`
- Ticket-card has a dashed "tear strip" at the top with mono ticket ID + status chip
- **Big `#NNN` number** — white when waiting, lime with glow when called
- Waiting state shows:
  - `People ahead` counter
  - Violet → lime gradient progress bar
  - Mono legend: `Joined … Now serving #NNN … You`
- Called state swaps the lower panel for a lime strip: "It's your turn — head to the counter."
- Skipped state shows a muted "check in with staff to rejoin" strip
- Background radial glow flips violet (waiting) → lime (called)

---

## Files touched

```
partiqle/
  styles/main.css
  app/
    page.tsx
    account/page.tsx
    signin/[id]/page.tsx
    businesses/page.tsx
    businesses/new/page.tsx
    businesses/[id]/lines/page.tsx
    businesses/[id]/lines/new/page.tsx
    businesses/[id]/lines/[lineId]/page.tsx
    lines/[lineId]/join/page.tsx
    lines/[lineId]/positions/[positionId]/page.tsx
  components/ui/
    Navbar/Navbar.tsx
    Footer/Footer.tsx
    Pricing/Pricing.tsx
    AuthForms/(OauthSignIn|EmailSignIn|PasswordSignIn|SignUp|ForgotPassword|UpdatePassword|Separator).tsx
    AccountForms/(CustomerPortalForm|EmailForm|NameForm).tsx
    BusinessForms/AddBusinessForm.tsx
    LineForms/(AddLineForm|AddPositionForm|NextInLineButton|PositionActions|PublicJoinLineForm).tsx
```

## Things I did NOT touch

- `utils/supabase/**` — every query and server action is untouched
- `utils/stripe/**` — Stripe integration unchanged
- `middleware.ts`, `app/layout.tsx` business logic, any API route
- Every form's `name`, `id`, hidden input, and submission handler

## Follow-ups you'll likely want

1. **Realtime updates on the position page** — it currently relies on manual refresh. A Supabase realtime subscription on `positions` filtered by `lineId` is the natural next step.
2. **Toast styling** — the redesign doesn't style `react-hot-toast`; it'll currently render with library defaults. Swap `toaster.tsx` to use the new token palette when you have time.
3. **Skeleton / loading states** — server components render on first paint so loading is minimal, but client actions (`Call next`, `Add walk-in`) could use a subtle optimistic state. `.pq-btn` already has `:disabled` styling.
4. **Mobile tweaks to line detail** — the big number scales via `clamp()`, but the sidebar stacks below the queue on narrow viewports. Consider swapping the order (QR on top) so small screens don't scroll past the queue to find it.
