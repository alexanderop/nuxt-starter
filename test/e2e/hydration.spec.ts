import { expect, test } from '@playwright/test'

const PAGES = ['/'] as const

test.describe('Hydration', () => {
  for (const path of PAGES) {
    test(`no hydration errors on ${path}`, async ({ page }) => {
      const errors: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().toLowerCase().includes('hydration')) {
          errors.push(msg.text())
        }
      })

      await page.goto(path)
      await page.waitForLoadState('networkidle')

      expect(errors).toEqual([])
    })
  }
})
