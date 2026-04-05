<script setup lang="ts">
import { NuxtLayout, NuxtLoadingIndicator, NuxtPage, NuxtRouteAnnouncer } from '#components'
import { useHead, useLocaleHead } from '#imports'

const localeHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
  identifierAttribute: 'id',
})

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: [
    ...(localeHead.value.meta || []),
    {
      name: 'color-scheme',
      content: 'light dark',
    },
  ],
  titleTemplate: titleChunk => {
    return titleChunk ? `${titleChunk} · Nuxt Starter` : 'Nuxt Starter'
  },
}))
</script>

<template>
  <NuxtLoadingIndicator color="var(--accent)" />

  <a class="skip-link" href="#main-content">Skip to content</a>
  <NuxtRouteAnnouncer />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
