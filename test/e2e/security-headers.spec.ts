import { expect, test } from '@playwright/test'

test.describe('Security headers', () => {
  test('pages include CSP meta tag', async ({ page, baseURL }) => {
    await page.goto(baseURL!)

    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content')

    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("default-src 'none'")
  })

  test('pages include security response headers', async ({ page, baseURL }) => {
    const response = await page.goto(baseURL!)
    const headers = response!.headers()

    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })
})
