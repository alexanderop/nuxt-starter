# Styling Guide

This guide defines how styling should be written in this starter.

The goal is consistency:

- global CSS owns design tokens and browser-level defaults
- Tailwind utilities handle most layout and visual composition
- local component CSS is rare and intentional

See also [components-guide.md](./components-guide.md) and [composables-guide.md](./composables-guide.md).

## Core Rule

Write styles in this order of preference:

1. Compose Tailwind utilities directly in the template.
2. Add or extend a design token.
3. Add scoped or module CSS only when utilities would make the markup harder to understand.

This keeps styling centralized, portable, and easy for another agent to extend.

## Token-First Styling

Treat the design system as tokens first, utilities second.

Use tokens for values that should stay consistent across the app:

- background colors
- foreground colors
- border colors
- accent colors
- shadows
- spacing primitives when they become part of the system

Typical token names:

- `--bg`
- `--bg-subtle`
- `--bg-elevated`
- `--fg`
- `--fg-muted`
- `--border`
- `--border-strong`
- `--accent`
- `--accent-strong`

Do not hardcode design values in many places when they represent a reusable design decision.

Reference tokens in Tailwind via the `@theme` block in `main.css`, which maps CSS variables to Tailwind color utilities like `bg-bg`, `text-fg`, `border-border`.

## Utilities Over Bespoke Classes

Prefer utility classes for:

- layout
- spacing
- alignment
- borders
- colors
- typography tweaks
- interaction states

Prefer a custom class only when the class represents a stable shared role or when utility composition becomes noisy.

Good:

```vue
<template>
  <section
    class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
  >
    <h2 class="m-0 text-xl tracking-[-0.02em]">Title</h2>
    <p class="mt-2 text-[var(--fg-muted)]">Supporting copy.</p>
  </section>
</template>
```

Avoid:

```vue
<template>
  <section class="marketing-card">
    <h2 class="marketing-card__title">Title</h2>
    <p class="marketing-card__copy">Supporting copy.</p>
  </section>
</template>
```

when the custom classes only wrap ordinary spacing, color, and border declarations.

## Global CSS Responsibilities

Keep global CSS limited to things that genuinely belong at the application level:

- reset and box sizing
- `:root` tokens
- light and dark theme values
- focus defaults
- selection styles
- scrollbar behavior
- document typography and body background
- browser-specific fallbacks

Do not move component-specific styling into global CSS just because it is easier in the moment.

## Dark Mode Strategy

Dark mode should be solved primarily through token changes.

Prefer this:

```css
:root[data-theme='dark'] {
  --bg: oklch(0.16 0.01 250);
  --fg: oklch(0.96 0.004 250);
}
```

over duplicating light and dark variants inside every component.

If a component needs special dark-mode treatment, first ask whether the token system is missing a semantic value.

## Interaction States

Keep interaction states visible in the markup when possible.

Use utilities for:

- `hover:`
- `focus-visible:`
- `aria-[current=page]:`
- `aria-[pressed=true]:`
- disabled styles

This makes state behavior easy to review without opening another file.

## When Local CSS Is Acceptable

Use `<style scoped>` or `<style module>` only when one of these is true:

- the selector logic is too complex for utilities
- the animation is non-trivial
- the layout depends on advanced CSS that becomes unreadable in class strings
- you are styling rendered third-party content with limited markup control

Even then, keep the local CSS narrow and component-owned.

## Example: Preferred Pattern

```vue
<template>
  <article
    class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
  >
    <header class="flex items-start justify-between gap-4">
      <div>
        <h2 class="m-0 text-lg tracking-[-0.02em]">Card Title</h2>
        <p class="mt-2 mb-0 text-[var(--fg-muted)]">Small description for the card.</p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-3.5 text-[var(--fg-muted)] transition-[border-color,color,transform,background-color] duration-200 hover:border-[var(--border-strong)] hover:text-[var(--fg)] hover:-translate-y-px"
        aria-pressed="false"
      >
        Action
      </button>
    </header>
  </article>
</template>
```

Why this is preferred:

- the layout is visible in the template
- token-backed colors stay consistent
- focus behavior is explicit

## RTL And Bidirectional Support

When writing styles that involve directional layout, prefer logical CSS properties over physical ones.

This ensures the layout works correctly in both left-to-right and right-to-left contexts without separate overrides.

Prefer logical utilities:

| Physical (avoid) | Logical (prefer) | Meaning              |
| ---------------- | ---------------- | -------------------- |
| `pl-*`           | `ps-*`           | padding-inline-start |
| `pr-*`           | `pe-*`           | padding-inline-end   |
| `ml-*`           | `ms-*`           | margin-inline-start  |
| `mr-*`           | `me-*`           | margin-inline-end    |
| `text-left`      | `text-start`     | text-align: start    |
| `text-right`     | `text-end`       | text-align: end      |

Physical properties are acceptable for layout that is inherently visual and must not flip, such as horizontal scroll positioning or fixed decorative elements.

## Cursor Conventions

Use `cursor: pointer` only for links (`<a>` elements with an `href`).

Buttons, toggles, and other interactive controls should keep the default cursor. The operating system already communicates interactivity for native controls, and overriding the cursor for every clickable element creates false equivalence between actions and navigation.

## Responsive Typography

Use `clamp()` for fluid type scaling instead of breakpoint-based font size overrides.

Prefer:

```css
font-size: clamp(1.25rem, 1rem + 1vw, 2rem);
```

over:

```css
font-size: 1.25rem;
@media (min-width: 768px) {
  font-size: 2rem;
}
```

Reserve explicit breakpoints for layout shifts where the design changes structurally, not just in scale.

## Color Space

This starter uses `oklch()` for color tokens. OKLCH provides perceptually uniform lightness, which means two tokens at the same lightness value will actually appear equally bright to users.

When adding or extending tokens:

- keep the lightness channel consistent across related tokens
- adjust chroma for vibrancy without changing perceived brightness
- use the same hue angle for cohesive palettes
- test in both light and dark mode to verify readability

## Anti-Patterns

Avoid these:

- hardcoded color values in many templates
- large custom class hierarchies for simple layout
- styling that duplicates design tokens instead of consuming them
- local CSS for ordinary spacing and alignment
- physical directional properties when logical equivalents exist
- `cursor: pointer` on buttons and other non-link interactive elements
- hardcoded breakpoint-based font sizes when `clamp()` would be simpler

## Decision Checklist

Before adding new styling, ask:

1. Can existing utilities express this clearly?
2. Is the real problem missing tokens rather than missing classes?
3. Would local CSS make the component easier or harder to maintain?

If you follow that order, the styling system stays small and predictable.
