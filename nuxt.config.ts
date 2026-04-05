import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  components: [],

  imports: {
    scan: false,
  },

  modules: [
    './modules/security-headers',
    '@nuxtjs/html-validator',
    '@nuxt/scripts',
    '@nuxt/a11y',
    '@nuxt/test-utils',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@vueuse/nuxt',
    'nuxt-og-image',
  ],

  $test: {
    debug: { hydration: true },
  },

  css: ['~/assets/main.css'],

  app: {
    head: {
      title: 'Nuxt Starter',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'theme-color',
          content: '#4f6df5',
        },
      ],
    },
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    dataValue: 'theme',
    storageKey: 'nuxt-starter-color-mode',
  },

  i18n: {
    baseUrl: 'https://starter.example',
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    langDir: 'locales',
    detectBrowserLanguage: false,
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.ts' },
    ],
  },

  site: {
    url: 'https://starter.example',
    name: 'Nuxt Starter',
    description: 'A minimal Nuxt starter shaped by patterns proven in production.',
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/api/**': { isr: 300 },
    '/__og-image__/**': { isr: 3600 },
  },

  experimental: {
    typedPages: true,
    typescriptPlugin: true,
  },

  compatibilityDate: '2026-01-31',
  devtools: { enabled: true },

  nitro: {
    typescript: {
      tsConfig: {
        include: ['../test/unit/server/**/*.ts'],
      },
    },
  },

  htmlValidator: {
    enabled: !process.env.TEST,
    failOnError: true,
  },

  ogImage: {
    defaults: {
      component: 'Default',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    devOptions: {
      enabled: !process.env.CI,
      type: 'module',
    },
    manifest: {
      name: 'Nuxt Starter',
      short_name: 'Starter',
      description: 'A minimal Nuxt starter shaped by patterns proven in production.',
      theme_color: '#4f6df5',
      background_color: '#f6f7fb',
      display: 'standalone',
      start_url: '/',
      lang: 'en-US',
      icons: [
        {
          src: '/pwa-icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/pwa-maskable.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        noUnusedLocals: true,
      },
      include: ['../test/unit/**/*.ts'],
    },
  },
})
