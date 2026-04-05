<script setup lang="ts">
import { useI18n, useSeoMeta } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('home.seoTitle'),
  description: () => t('home.seoDescription'),
  ogTitle: () => t('home.seoTitle'),
  ogDescription: () => t('home.seoDescription'),
  twitterTitle: () => t('home.seoTitle'),
  twitterDescription: () => t('home.seoDescription'),
})
</script>

<template>
  <div>
    <section class="grid gap-6 py-10 sm:gap-8 sm:py-16">
      <p
        class="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_80%,transparent)] px-3 py-1.5 text-[0.925rem] text-[var(--fg-muted)]"
      >
        {{ t('home.eyebrow') }}
      </p>

      <h1
        class="m-0 max-w-[13ch] text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.05em]"
      >
        {{ t('home.title') }}
      </h1>

      <p class="m-0 max-w-[62ch] text-[1.075rem] text-[var(--fg-muted)]">
        {{ t('home.intro') }}
      </p>

      <div class="flex flex-wrap gap-4">
        <a
          class="inline-flex min-h-[2.875rem] items-center justify-center gap-2 rounded-full border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-4 text-white no-underline shadow-[var(--shadow)] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px"
          href="https://nuxt.com/docs/getting-started/introduction"
        >
          {{ t('home.actions.docs') }}
        </a>
        <a
          class="inline-flex min-h-[2.875rem] items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg-elevated)_86%,transparent)] px-4 text-[var(--fg)] no-underline transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px hover:border-[var(--border-strong)]"
          href="https://nuxt.com/docs/guide/going-further/testing"
        >
          {{ t('home.actions.testing') }}
        </a>
      </div>

      <div class="flex flex-wrap gap-3">
        <span
          class="inline-flex min-h-[2.2rem] items-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-[0.85rem] text-[0.95rem] text-[var(--fg-muted)]"
          >{{ t('home.pills.i18n') }}</span
        >
        <span
          class="inline-flex min-h-[2.2rem] items-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-[0.85rem] text-[0.95rem] text-[var(--fg-muted)]"
          >{{ t('home.pills.colorMode') }}</span
        >
        <span
          class="inline-flex min-h-[2.2rem] items-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-[0.85rem] text-[0.95rem] text-[var(--fg-muted)]"
          >{{ t('home.pills.pwa') }}</span
        >
        <span
          class="inline-flex min-h-[2.2rem] items-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-[0.85rem] text-[0.95rem] text-[var(--fg-muted)]"
          >{{ t('home.pills.routeRules') }}</span
        >
      </div>
    </section>

    <section aria-labelledby="starter-highlights" class="mt-8 grid gap-4 md:grid-cols-3">
      <article
        class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
      >
        <h2 id="starter-highlights" class="m-0 mb-2 text-[1.1rem] tracking-[-0.02em]">
          {{ t('home.highlights.shell.title') }}
        </h2>
        <p class="m-0 text-[var(--fg-muted)]">{{ t('home.highlights.shell.body') }}</p>
      </article>

      <article
        class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
      >
        <h2 class="m-0 mb-2 text-[1.1rem] tracking-[-0.02em]">
          {{ t('home.highlights.defaults.title') }}
        </h2>
        <p class="m-0 text-[var(--fg-muted)]">{{ t('home.highlights.defaults.body') }}</p>
      </article>

      <article
        class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
      >
        <h2 class="m-0 mb-2 text-[1.1rem] tracking-[-0.02em]">
          {{ t('home.highlights.tests.title') }}
        </h2>
        <p class="m-0 text-[var(--fg-muted)]">{{ t('home.highlights.tests.body') }}</p>
      </article>
    </section>

    <section
      class="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      aria-labelledby="implementation-notes"
    >
      <article
        class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
      >
        <h2
          id="implementation-notes"
          class="m-0 mb-4 text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.04em]"
        >
          {{ t('home.includes.title') }}
        </h2>
        <ul class="m-0 ps-[1.1rem] text-[var(--fg-muted)]">
          <li>{{ t('home.includes.items.testing') }}</li>
          <li>{{ t('home.includes.items.security') }}</li>
          <li>{{ t('home.includes.items.foundations') }}</li>
        </ul>
      </article>

      <article
        class="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]"
      >
        <h2 class="m-0 mb-4 text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.04em]">
          {{ t('home.excludes.title') }}
        </h2>
        <ul class="m-0 ps-[1.1rem] text-[var(--fg-muted)]">
          <li>{{ t('home.excludes.items.product') }}</li>
          <li>{{ t('home.excludes.items.components') }}</li>
          <li>{{ t('home.excludes.items.cleanup') }}</li>
        </ul>
      </article>
    </section>
  </div>
</template>
