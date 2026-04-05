# Nuxt Starter

A minimal Nuxt starter with strong defaults for styling, accessibility, testing, and application structure.

It keeps the surface area small while giving you a stronger baseline:

- an accessible app shell
- a token-driven UnoCSS styling foundation
- sensible route rules and metadata defaults
- a reusable security headers module
- Vite Plus-driven named test projects
- unit, Nuxt runtime, and browser coverage out of the box

## Import Policy

This starter disables local Nuxt auto-import scanning on purpose.

- `components: []` disables automatic registration for files in `app/components`
- `imports.scan: false` disables automatic scanning for files in `app/composables` and `app/utils`
- Nuxt and module helpers can still be imported explicitly from `#imports`

In practice that means:

- import local components yourself in each SFC
- import Vue APIs from `vue`
- import Nuxt and module composables explicitly from `#imports`

Example:

```vue
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import { useI18n, useSeoMeta } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('home.seoTitle'),
})
</script>
```

## Styling

The starter uses a token-first styling system:

- semantic theme tokens live in `app/assets/main.css`
- UnoCSS provides the utility layer and shared shortcuts
- component templates compose layout and state with utilities
- global CSS is reserved for resets, root variables, and browser-specific behavior

## Setup

Install dependencies with Vite+:

```bash
vp install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

This starter keeps Nuxt runtime lifecycle commands as package scripts and uses Vite+ directly for linting, formatting, testing, and repo tasks.

## Quality Checks

```bash
pnpm check
pnpm lint:fix
pnpm typecheck
pnpm test
pnpm test:unit
pnpm test:nuxt
pnpm test:browser
pnpm test:a11y
pnpm knip
```

If you prefer to bypass package scripts for repo tooling, the direct Vite+ equivalents are:

```bash
vp lint
vp fmt
vp test --project unit
vp test --project nuxt
vp run browser:test
vp run audit:a11y
```

## Project Guides

Repository-specific authoring guides for humans and AI agents live in:

- [docs/style-guide.md](./docs/style-guide.md) — styling tokens, utilities, RTL, dark mode
- [docs/components-guide.md](./docs/components-guide.md) — component structure, naming, accessibility
- [docs/composables-guide.md](./docs/composables-guide.md) — reactive behavior, SSR, shared state
- [docs/typescript-guide.md](./docs/typescript-guide.md) — strict typing, import order, naming conventions
- [docs/server-guide.md](./docs/server-guide.md) — API routes, validation, error handling, caching
- [docs/i18n-guide.md](./docs/i18n-guide.md) — locale files, key naming, formatters, SEO
- [docs/testing-guide.md](./docs/testing-guide.md) — testing pyramid, selectors, fixtures, accessibility

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
