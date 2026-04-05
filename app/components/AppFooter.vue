<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <footer class="site-footer border-t border-border shell-surface">
    <div
      class="container flex flex-col items-start justify-center gap-4 py-4 sm:min-h-18 sm:flex-row sm:items-center sm:justify-between sm:py-0"
    >
      <p class="text-fg-muted m-0 max-w-[42rem]">
        {{ t('footer.copy') }}
      </p>

      <nav aria-label="Footer" class="flex flex-wrap gap-4">
        <a
          class="text-fg-muted no-underline transition-colors duration-200 hover:text-fg focus-ring rounded-sm"
          href="https://nuxt.com/docs/getting-started/introduction"
          >{{ t('footer.guide') }}</a
        >
        <a
          class="text-fg-muted no-underline transition-colors duration-200 hover:text-fg focus-ring rounded-sm"
          href="https://nuxt.com/docs/guide/directory-structure/app"
          >{{ t('footer.appStructure') }}</a
        >
        <a
          class="text-fg-muted no-underline transition-colors duration-200 hover:text-fg focus-ring rounded-sm"
          href="https://nuxt.com/docs/guide/going-further/testing"
          >{{ t('footer.testing') }}</a
        >
      </nav>
    </div>
  </footer>
</template>
