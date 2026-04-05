import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const appRoot = fileURLToPath(new URL('../../../app', import.meta.url))
const sharedRoot = fileURLToPath(new URL('../../../shared', import.meta.url))
const serverRoot = fileURLToPath(new URL('../../../server', import.meta.url))
const mainCss = fileURLToPath(new URL('../../../app/assets/main.css', import.meta.url))

export default defineNuxtConfig({
  components: [],
  imports: {
    scan: false,
  },
  modules: ['@nuxtjs/color-mode', '@nuxtjs/i18n'],
  alias: {
    '~': appRoot,
    '@': appRoot,
    '#shared': sharedRoot,
    '#server': serverRoot,
  },
  css: [mainCss],
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    langDir: 'locales',
    detectBrowserLanguage: false,
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.ts' },
    ],
  },
})
