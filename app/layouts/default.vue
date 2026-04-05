<script setup lang="ts">
import AppFooter from '~/components/AppFooter.vue'
import AppHeader from '~/components/AppHeader.vue'
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      class="fixed left-4 top-4 z-20 rounded-full bg-[var(--fg)] px-4 py-3 text-[var(--bg)] no-underline shadow-[var(--shadow)] -translate-y-[140%] transition-transform duration-200 focus:translate-y-0"
      href="#main-content"
    >
      {{ t('nav.skipLink') }}
    </a>

    <AppHeader />

    <main
      id="main-content"
      class="mx-auto w-[min(1100px,calc(100%-2rem))] flex-1 py-8 md:pb-16 max-sm:pt-6"
      tabindex="-1"
    >
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
