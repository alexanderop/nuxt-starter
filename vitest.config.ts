import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'layers/**/utils/**/*.test.ts',
            'layers/**/stores/**/*Update.test.ts',
            'layers/**/schemas/**/*.test.ts',
          ],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: [
            'layers/**/components/**/*.nuxt.test.ts',
            'layers/**/pages/**/*.nuxt.test.ts',
          ],
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
              mock: {
                intersectionObserver: true,
                indexedDb: false,
              },
            },
          },
        },
      }),
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['layers/**/app/**/*.{ts,vue}'],
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/nuxt.config.ts',
        '**/*.d.ts',
      ],
    },
  },
})
