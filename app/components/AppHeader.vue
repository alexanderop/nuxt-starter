<script setup lang="ts">
import { computed } from 'vue'
import { ClientOnly, NuxtLink } from '#components'
import { useColorMode, useI18n, useLocalePath, useSwitchLocalePath } from '#imports'

type LocaleCode = 'en' | 'de'

const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale, locales, t } = useI18n()
const colorMode = useColorMode()

const localeOptions = computed(() =>
  locales.value.map(localeOption => {
    const code: LocaleCode = localeOption.code
    return {
      code,
      label: localeOption.name || localeOption.code,
    }
  }),
)

const homeRoute = { name: 'index' as const }

function localeTarget(code: LocaleCode) {
  if (code === locale.value) {
    return localePath(homeRoute)
  }

  return switchLocalePath(code) || localePath(homeRoute)
}

function cycleTheme() {
  switch (colorMode.preference) {
    case 'system':
      colorMode.preference = 'light'
      break
    case 'light':
      colorMode.preference = 'dark'
      break
    default:
      colorMode.preference = 'system'
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-[var(--border)] backdrop-blur-[18px] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)]"
  >
    <div
      class="mx-auto flex w-[min(1100px,calc(100%-2rem))] flex-col items-start justify-center gap-4 py-4 sm:min-h-[4.5rem] sm:flex-row sm:items-center sm:justify-between sm:py-0"
    >
      <NuxtLink
        class="inline-flex items-center gap-3 rounded-sm font-semibold tracking-tight text-[var(--fg)] no-underline"
        :to="localePath(homeRoute)"
      >
        <span
          aria-hidden="true"
          class="grid size-9 place-items-center rounded-[0.85rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-white shadow-[var(--shadow)]"
          >N</span
        >
        <span>Nuxt Starter</span>
      </NuxtLink>

      <nav aria-label="Primary" class="flex flex-wrap items-center gap-4">
        <NuxtLink
          :to="localePath(homeRoute)"
          class="rounded-sm text-[var(--fg-muted)] no-underline transition-colors duration-200 hover:text-[var(--fg)]"
        >
          {{ t('nav.home') }}
        </NuxtLink>
        <a
          class="rounded-sm text-[var(--fg-muted)] no-underline transition-colors duration-200 hover:text-[var(--fg)]"
          href="https://nuxt.com/docs/getting-started/introduction"
        >
          {{ t('nav.docs') }}
        </a>
        <a
          class="rounded-sm text-[var(--fg-muted)] no-underline transition-colors duration-200 hover:text-[var(--fg)]"
          href="https://github.com/nuxt/nuxt"
        >
          {{ t('nav.nuxt') }}
        </a>
      </nav>

      <div class="flex flex-wrap items-center gap-2 self-stretch sm:self-auto sm:justify-end">
        <nav class="flex flex-wrap items-center gap-2" :aria-label="t('nav.languageLabel')">
          <NuxtLink
            v-for="localeOption in localeOptions"
            :key="localeOption.code"
            :aria-current="locale === localeOption.code ? 'page' : undefined"
            class="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-3.5 text-[var(--fg-muted)] no-underline transition-[border-color,color,transform,background-color] duration-200 hover:border-[var(--border-strong)] hover:text-[var(--fg)] hover:-translate-y-px aria-[current=page]:border-[var(--border-strong)] aria-[current=page]:text-[var(--fg)] aria-[current=page]:-translate-y-px"
            :to="localeTarget(localeOption.code)"
          >
            {{ localeOption.label }}
          </NuxtLink>
        </nav>

        <ClientOnly>
          <button
            class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-3.5 text-[var(--fg-muted)] transition-[border-color,color,transform,background-color] duration-200 hover:border-[var(--border-strong)] hover:text-[var(--fg)] hover:-translate-y-px"
            type="button"
            @click="cycleTheme"
          >
            {{ t(`theme.${colorMode.preference}`) }}
          </button>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>
