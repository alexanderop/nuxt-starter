import { defineConfig } from 'vite-plus'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from 'vite-plus/test/browser-playwright'

const rootDir = import.meta.dirname
const nuxtFixtureRoot = `${rootDir}/test/nuxt/fixture`
const nuxtTestOverrides = {
  vue: {
    runtimeCompiler: true,
  },
  experimental: {
    payloadExtraction: false,
    viteEnvironmentApi: false,
  },
  pwa: {
    pwaAssets: { disabled: true },
  },
  ogImage: { enabled: false },
}

export default defineConfig({
  run: {
    tasks: {
      'check:lint': {
        command: 'vp lint && eslint . && vp fmt --check',
      },
      'check:typecheck': {
        command: 'nuxt prepare && vue-tsc --noEmit',
      },
      'check:knip': {
        command: 'knip',
      },
      'browser:server': {
        command: 'NODE_ENV=test vp run preview --port=4173 --host=127.0.0.1',
      },
      'browser:test': {
        command: 'vp run build:test && vp exec playwright test',
      },
      'browser:test:ui': {
        command: 'vp run build:test && vp exec playwright test --ui',
      },
      'audit:a11y': {
        command: 'vp run build:test && ./scripts/lighthouse.sh',
      },
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ['unicorn', 'typescript', 'oxc', 'vue', 'vitest'],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      perf: 'warn',
    },
    rules: {
      'no-console': 'warn',
      'typescript/consistent-type-imports': 'error',

      // Limit cyclomatic complexity per function
      'complexity': ['warn', { max: 10 }],
      // Ban nested ternaries for readability
      'no-nested-ternary': 'error',
      // Prefer early returns over else blocks
      'no-else-return': 'warn',

      // Ban `as Type` assertions — use type guards or proper typing
      'typescript/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      // Ban `any` — use `unknown` and narrow instead
      'typescript/no-explicit-any': 'error',

      // Vue 3.5+ destructured props
      'vue/define-props-destructuring': 'error',

      // Better vitest assertions
      'vitest/prefer-to-be-falsy': 'warn',
      'vitest/prefer-to-be-truthy': 'warn',
      'vitest/prefer-to-be-object': 'warn',
    },
    overrides: [
      {
        files: ['server/**/*', 'scripts/**/*', 'modules/**/*'],
        rules: {
          'no-console': 'off',
        },
      },
    ],
    ignorePatterns: [
      '.data/**',
      '.nuxt/**',
      '.output/**',
      '.nitro/**',
      '.cache/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.lighthouseci/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    arrowParens: 'avoid',
    quoteProps: 'consistent',
  },
  staged: {
    '*.{js,ts,mjs,cjs,vue}': 'vp lint --fix && eslint --fix',
    '*.{js,ts,mjs,cjs,vue,json,yml,md,html,css}': 'vp fmt',
  },
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '~': `${rootDir}/app`,
            '@': `${rootDir}/app`,
            '~~': rootDir,
            '#shared': `${rootDir}/shared`,
            '#server': `${rootDir}/server`,
          },
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      () =>
        defineVitestProject({
          test: {
            name: 'nuxt',
            include: ['test/nuxt/**/*.{test,spec}.ts'],
            environment: 'nuxt',
            environmentOptions: {
              nuxt: {
                rootDir: nuxtFixtureRoot,
                overrides: nuxtTestOverrides,
              },
            },
            browser: {
              enabled: true,
              provider: playwright(),
              instances: [{ browser: 'chromium', headless: true }],
            },
          },
        }),
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      exclude: ['**/node_modules/**', '**/*.json'],
    },
  },
})
