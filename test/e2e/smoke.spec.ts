import { expect, test } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('homepage returns 200', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('homepage renders the starter shell', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header.site-header')).toBeVisible()
    await expect(page.locator('main#main-content')).toBeVisible()
    await expect(page.locator('footer.site-footer')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Start with a stronger Nuxt baseline.' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /Theme:/ })).toBeVisible()
  })

  test('homepage publishes the expected title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Build with strong defaults · Nuxt Starter/)
  })

  test('german locale route renders translated content', async ({ page }) => {
    await page.goto('/de')
    await expect(page).toHaveURL(/\/de$/)
    await expect(
      page.getByRole('heading', { name: 'Starte mit einer staerkeren Nuxt-Basis.' }),
    ).toBeVisible()
  })

  test('web manifest is published', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    expect(response?.status()).toBe(200)
  })
})
