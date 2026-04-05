import { afterEach, describe, expect, it, vi } from 'vitest'

type RouteHeaders = Record<string, string>
type RouteRule = { headers?: RouteHeaders }
type SecurityHeadersTestNuxt = {
  options: {
    dev: boolean
    devtools: boolean | { enabled: boolean }
    app: {
      head: {
        meta?: Array<Record<string, string>>
      }
    }
    routeRules: Record<string, RouteRule>
  }
}

async function loadSecurityHeadersSetup() {
  const securityHeadersModule = (await import('~~/modules/security-headers')).default
  const setup = Reflect.get(securityHeadersModule, 'setup')

  if (typeof setup !== 'function') {
    throw new TypeError('security-headers module did not expose a setup function')
  }

  return setup
}

const useNuxt = vi.fn()

vi.mock('nuxt/kit', () => ({
  defineNuxtModule: (module: unknown) => module,
  useNuxt,
}))

describe('security-headers module', () => {
  afterEach(() => {
    useNuxt.mockReset()
    vi.unstubAllEnvs()
  })

  it('adds a CSP meta tag and merges wildcard headers safely', async () => {
    const nuxt: SecurityHeadersTestNuxt = {
      options: {
        dev: false,
        devtools: { enabled: true },
        app: {
          head: {
            meta: [{ name: 'description', content: 'existing' }],
          },
        },
        routeRules: {
          '/**': {
            headers: {
              'Cache-Control': 'public, max-age=0',
            },
          },
        },
      },
    }

    useNuxt.mockReturnValue(nuxt)

    const setup = await loadSecurityHeadersSetup()
    setup()

    expect(nuxt.options.app.head.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          'http-equiv': 'Content-Security-Policy',
        }),
      ]),
    )

    expect(nuxt.options.routeRules['/**']).toEqual({
      headers: {
        'Cache-Control': 'public, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
  })

  it('relaxes the devtools iframe header only for the devtools route in development', async () => {
    vi.stubEnv('TEST', '')

    const nuxt: SecurityHeadersTestNuxt = {
      options: {
        dev: true,
        devtools: { enabled: true },
        app: {
          head: {},
        },
        routeRules: {},
      },
    }

    useNuxt.mockReturnValue(nuxt)

    const setup = await loadSecurityHeadersSetup()
    setup()

    expect(nuxt.options.routeRules['/__nuxt_devtools__/**']).toEqual({
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
  })
})
