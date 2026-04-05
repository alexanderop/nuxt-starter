import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppHeader from '../../../app/components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders the brand and primary navigation', async () => {
    const component = await mountSuspended(AppHeader)

    expect(component.text()).toContain('Nuxt Starter')
    expect(component.text()).toContain('Docs')
    expect(component.text()).toContain('Nuxt')
    expect(component.text()).toContain('English')
    expect(component.text()).toContain('Deutsch')
  })
})
