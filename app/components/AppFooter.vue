<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <footer
    class="border-t border-[var(--border)] backdrop-blur-[18px] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)]"
  >
    <div
      class="mx-auto flex w-[min(1100px,calc(100%-2rem))] flex-col items-start justify-center gap-4 py-4 sm:min-h-[4.5rem] sm:flex-row sm:items-center sm:justify-between sm:py-0"
    >
      <p class="m-0 max-w-[42rem] text-[var(--fg-muted)]">
        {{ t('footer.copy') }}
      </p>

      <nav aria-label="Footer" class="flex flex-wrap gap-4">
        <a
          class="rounded-sm text-[var(--fg-muted)] no-underline transition-colors duration-200 hover:text-[var(--fg)]"
          href="https://nuxt.com/docs/getting-started/introduction"
          >{{ t('footer.guide') }}</a
        >
        <a
          class="rounded-sm text-[var(--fg-muted)] no-underline transition-colors duration-200 hover:text-[var(--fg)]"
          href="https://nuxt.com/docs/guide/directory-structure/app"
          >{{ t('footer.appStructure') }}</a
        >
        <a
          class="rounded-sm text-[var(--fg-muted)] no-underline transition-colors duration-200 hover:text-[var(--fg)]"
          href="https://nuxt.com/docs/guide/going-further/testing"
          >{{ t('footer.testing') }}</a
        >
      </nav>
    </div>
  </footer>
</template>
