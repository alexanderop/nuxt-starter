import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

const baseURL = 'http://127.0.0.1:4173'

export default defineConfig<ConfigOptions>({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  timeout: 120_000,
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',

  webServer: {
    command: 'vp run start:playwright:webserver',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    nuxt: {
      rootDir: import.meta.dirname,
      host: baseURL,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
