import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppFooter from '../../../app/components/AppFooter.vue'

describe('AppFooter', () => {
  it('renders the supporting copy and links', async () => {
    const component = await mountSuspended(AppFooter)

    expect(component.text()).toContain('production-minded starting point')
    expect(component.text()).toContain('Guide')
    expect(component.text()).toContain('Testing')
  })
})
