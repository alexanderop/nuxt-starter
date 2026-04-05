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
  locales.value.map(localeOption => ({
    code: localeOption.code as LocaleCode,
    label: localeOption.name || localeOption.code,
  })),
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
  <header class="site-header sticky top-0 z-10 border-b border-border shell-surface">
    <div
      class="container flex flex-col items-start justify-center gap-4 py-4 sm:min-h-18 sm:flex-row sm:items-center sm:justify-between sm:py-0"
    >
      <NuxtLink
        class="inline-flex items-center gap-3 font-semibold tracking-[-0.02em] no-underline text-fg focus-ring rounded-sm"
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
          class="text-fg-muted no-underline transition-colors duration-200 hover:text-fg focus-ring rounded-sm"
        >
          {{ t('nav.home') }}
        </NuxtLink>
        <a
          class="text-fg-muted no-underline transition-colors duration-200 hover:text-fg focus-ring rounded-sm"
          href="https://nuxt.com/docs/getting-started/introduction"
        >
          {{ t('nav.docs') }}
        </a>
        <a
          class="text-fg-muted no-underline transition-colors duration-200 hover:text-fg focus-ring rounded-sm"
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
            class="site-control focus-ring"
            :to="localeTarget(localeOption.code)"
          >
            {{ localeOption.label }}
          </NuxtLink>
        </nav>

        <ClientOnly>
          <button class="site-control focus-ring cursor-pointer" type="button" @click="cycleTheme">
            {{ t(`theme.${colorMode.preference}`) }}
          </button>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>
