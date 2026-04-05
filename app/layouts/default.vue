<script setup lang="ts">
import AppFooter from '~/components/AppFooter.vue'
import AppHeader from '~/components/AppHeader.vue'
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a
      class="fixed left-4 top-4 z-20 px-4 py-3 rounded-full bg-fg text-bg no-underline shadow-[var(--shadow)] -translate-y-[140%] transition-transform duration-200 focus-ring focus:translate-y-0"
      href="#main-content"
    >
      {{ t('nav.skipLink') }}
    </a>

    <AppHeader />

    <main id="main-content" class="container flex-1 py-8 md:pb-16 max-sm:pt-6" tabindex="-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
