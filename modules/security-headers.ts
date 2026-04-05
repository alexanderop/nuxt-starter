import { defineNuxtModule, useNuxt } from 'nuxt/kit'

/**
 * Adds Content-Security-Policy and other security headers to all pages.
 *
 * CSP is delivered via a <meta http-equiv> tag in <head>, so it naturally
 * only applies to HTML pages. The remaining security headers are set through
 * a catch-all route rule and apply to every response.
 *
 * Current policy keeps 'unsafe-inline' for scripts and styles because Nuxt
 * injects inline scripts for hydration and Vue supports inline style bindings.
 */
export default defineNuxtModule({
  meta: { name: 'security-headers' },
  setup() {
    const nuxt = useNuxt()
    const devtools = nuxt.options.devtools

    const isDevtoolsRuntime =
      nuxt.options.dev &&
      devtools !== false &&
      (devtools == null || typeof devtools !== 'object' || devtools.enabled !== false) &&
      !process.env.TEST

    const csp = [
      "default-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      `connect-src 'self'${isDevtoolsRuntime ? ' ws://localhost:*' : ''}`,
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "manifest-src 'self'",
      'upgrade-insecure-requests',
    ].join('; ')

    nuxt.options.app.head ??= {}
    if (typeof nuxt.options.app.head === 'function') {
      throw new TypeError('security-headers requires nuxt.options.app.head to be an object')
    }

    nuxt.options.app.head.meta ??= []
    nuxt.options.app.head.meta.push({
      'http-equiv': 'Content-Security-Policy',
      'content': csp,
    })

    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }

    nuxt.options.routeRules ??= {}
    const wildcardRules = nuxt.options.routeRules['/**']
    nuxt.options.routeRules['/**'] = {
      ...wildcardRules,
      headers: {
        ...wildcardRules?.headers,
        ...securityHeaders,
      },
    }

    if (!isDevtoolsRuntime) return

    const devtoolsRule = nuxt.options.routeRules['/__nuxt_devtools__/**']
    nuxt.options.routeRules['/__nuxt_devtools__/**'] = {
      ...devtoolsRule,
      headers: {
        ...wildcardRules?.headers,
        ...securityHeaders,
        ...devtoolsRule?.headers,
        'X-Frame-Options': 'SAMEORIGIN',
      },
    }
  },
})
