# HELIO Design Direction

## North star: calm solar operations room

HELIO should feel like a precise, modern energy-control product: useful at a glance,
confident under pressure, and never visually noisy. The interface should make live
system state and the next operator action clear before decorative detail.

## Reference patterns to adapt

These are patterns to adapt for HELIO, not templates or visual assets to copy:

1. **Persistent, quiet navigation** — a compact sidebar that establishes location
   without competing with operational data.
2. **A clear dashboard hierarchy** — a top summary band, followed by a modular grid
   of focused cards; each card answers one question.
3. **Filter before detail** — put the current site, date range, and relevant state
   controls together above charts and tables.
4. **Semantic data colour** — reserve colour for meaning: amber for solar/action,
   green for healthy/positive, blue for electricity/data, amber for warning, and red
   for faults. Charts must remain understandable without colour alone.
5. **Low-glare dark surfaces** — use layered charcoal surfaces and subtle borders,
   not pure black or heavy glow. Light mode follows the same hierarchy in soft neutral
   whites.
6. **Purposeful motion** — short transitions clarify state changes; loading uses
   skeletons/progress rather than indefinite decorative animation. Respect reduced
   motion preferences.

## Visual rules

- Prefer an 8px spacing rhythm and 12–16px card corners.
- Keep page backgrounds flat; use one restrained radial solar glow only where it
  clarifies hierarchy.
- Use a maximum of one primary and one secondary action per screen area.
- Use tabular numerals and compact labels for telemetry; reserve expressive display
  type for page titles and product moments.
- Give charts room to breathe: labels outside plots where possible, quiet gridlines,
  and no more than four series in a single default view.
- Treat alerts as a distinct severity system, never as decorative accent colour.
- Maintain WCAG AA text contrast in both themes and visible keyboard focus states.

## Colour contract

The palette is inspired by the supplied coral, violet, lime, blush, and blue reference.
Those bright source colours are not used for long-form text or critical UI states;
HELIO uses darker, contrast-safe shades for those purposes.

| Token family | Meaning | Use it for | Do not use it for |
|---|---|---|---|
| `solar-*` | Solar generation / primary action | Primary CTAs, brand mark, page titles, selected navigation, generation series | Faults or generic success |
| `grid-*` | Healthy system / sustainable state | Online, healthy, positive deltas, success | AI or warning states |
| `insight-*` | AI and forecasting | Forecasts, recommendations, model outputs, keyboard focus | System health or destructive actions |
| `energy-blue` / `energy-cyan` | Electrical and data streams | Grid/import series, informational indicators | Success/failure status |
| `energy-amber` | Attention needed | Warnings, maintenance required | Primary CTA if a solar token is available |
| `energy-rose` | Fault or destructive state | Critical alerts, errors, destructive actions | Decorative highlights |

Implementation rules:

1. Use `helio-*` semantic surface tokens (`canvas`, `surface`, `border`, `ink`,
   `muted`) for app structure; never hard-code a white, black, or slate surface in
   a new shared component.
2. Use palette families for meaning, not decoration. A component gets one accent by
   default; more than two accents requires a data or state reason.
3. Pair text with a 600/700 shade on light surfaces and a 300/400 shade on dark
   surfaces. Do not use a 400/500 accent as small text on white.
4. Charts must preserve a fixed meaning: solar = lime, grid = blue/cyan, forecast =
   violet, warning = amber, fault = coral. Include a label, pattern, or tooltip so
   colour is never the only signal. Solar uses warm amber/orange, not green.
5. Interactive focus uses `helio-focus` (violet), regardless of the component's
   accent colour, so keyboard navigation is predictable.

## Pilot area and acceptance criteria

The first implementation pilot will be the shell (top bar, sidebar, shared cards and
buttons). It succeeds when:

- A user can identify the current section, system health, and primary action in a few
  seconds.
- The sidebar remains readable at desktop width, collapses cleanly, and does not need
  a page-length scroll for primary navigation.
- Light and dark variants feel designed as a pair, not as inverted colours.
- The shared components can be reused on every consolidated page without visual
  exceptions.

## Sources of inspiration

Figma's dashboard and energy-management examples informed the modular card layout,
filter-first controls, stable sidebar, and paired light/dark dashboard approach.
They are inspiration only; HELIO will use its own components, tokens, and code.

- https://www.figma.com/templates/dashboard-designs/
- https://www.figma.com/resource-library/ai-website-examples/
