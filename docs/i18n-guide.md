# Internationalization Guide

This guide defines how internationalization should be handled in this starter.

The standard is:

- all user-facing text lives in locale files
- static keys only
- consistent key naming
- built-in formatters for numbers and dates
- translations are explicit and auditable

See also [components-guide.md](./components-guide.md) and [typescript-guide.md](./typescript-guide.md).

## Core Rule

Never hardcode user-facing text in templates or script blocks. Every visible string should come from a locale file through `$t()`, `t()`, or the `i18n-t` component.

## Locale Files

Locale files live in `i18n/locales/` and are registered in the Nuxt config.

The default locale is the source of truth. Other locales follow its structure.

## Key Naming

Use dot notation to express hierarchy:

```json
{
  "common.loading": "Loading…",
  "common.error": "Something went wrong",
  "nav.home": "Home",
  "nav.docs": "Docs",
  "home.title": "Start with a stronger Nuxt base",
  "home.intro": "A minimal starter with strong defaults.",
  "settings.theme.label": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System"
}
```

Rules:

- use underscores for multi-word keys: `privacy_policy`, not `privacy-policy`
- group by feature or page, then by element
- keep keys short but descriptive
- do not nest deeper than three levels

## Static Keys Only

Use only static, literal keys in code. Never construct keys dynamically.

Prefer:

```vue
<template>
  <span>{{ $t('home.title') }}</span>
</template>
```

over:

```vue
<template>
  <span>{{ $t(`${section}.title`) }}</span>
</template>
```

Dynamic keys break static analysis tools like `i18n:report` and make it impossible to verify that every key is used and every used key exists.

## Using Translations

In templates:

```vue
<template>
  <h1>{{ $t('home.title') }}</h1>
  <p>{{ $t('home.intro') }}</p>
</template>
```

In script setup:

```vue
<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('home.seoTitle'),
  description: () => t('home.seoDescription'),
})
</script>
```

For complex HTML content, use the `i18n-t` component instead of `v-html`:

```vue
<template>
  <i18n-t keypath="home.richIntro" tag="p">
    <template #link>
      <NuxtLink to="/docs">{{ $t('home.docsLink') }}</NuxtLink>
    </template>
  </i18n-t>
</template>
```

## Formatters

Use built-in formatters instead of custom formatting logic:

- `$n(12345)` for numbers (renders locale-aware separators)
- `$d(date)` for dates (renders locale-aware formatting)
- `$n(0.75, { style: 'percent' })` for percentages

These adapt automatically to the active locale.

## Pluralization

Use pipe-separated forms in the locale file:

```json
{
  "results.count": "No results | 1 result | {count} results"
}
```

In the template:

```vue
<template>
  <span>{{ $t('results.count', resultCount) }}</span>
</template>
```

## SEO And Metadata

Use reactive translations for SEO metadata so the values update when the locale changes:

```vue
<script setup lang="ts">
import { useI18n, useSeoMeta } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('page.seoTitle'),
  ogTitle: () => t('page.seoTitle'),
  description: () => t('page.seoDescription'),
  ogDescription: () => t('page.seoDescription'),
})
</script>
```

Pass a function (not a value) to `useSeoMeta` for fields that should react to locale changes.

## Adding A New Locale

1. Create the locale file in `i18n/locales/` following the structure of the default locale.
2. Register it in the i18n configuration in `nuxt.config.ts`.
3. Add a locale switcher entry if the UI does not enumerate locales dynamically.
4. Test the locale by switching to it and verifying key pages render correctly.

## Testing Localized Content

When testing components or pages that use i18n:

- test that translated text appears, not that a specific English string appears
- if the test needs a specific locale, configure it in the test fixture
- for behavioral tests, prefer checking that text changes when the locale changes

## Anti-Patterns

Avoid these:

- hardcoded user-facing strings in templates
- dynamic or computed translation keys
- duplicating translation logic instead of using `$t()`
- custom number or date formatting when built-in formatters work
- deep key nesting beyond three levels
- dashes in key names (use underscores)
- HTML strings in locale files when `i18n-t` can express the structure safely
