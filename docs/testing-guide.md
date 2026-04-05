# Testing Guide

This guide defines how testing should be written in this starter.

The standard is:

- most confidence should come from fast tests
- assertions should focus on behavior, not implementation detail
- each test layer should cover the risks it is best at catching
- browser tests should be reserved for flows that need a real browser
- property-based testing should be used for invariants, not as a default

See also [components-guide.md](./components-guide.md) and [composables-guide.md](./composables-guide.md).

## Core Rule

Test the smallest surface that can prove the behavior.

Prefer this order:

1. Write a unit test for pure logic.
2. Write a Nuxt runtime test for component, composable, or page behavior that needs Vue or Nuxt.
3. Write a browser test for routing, hydration, headers, and full user flows.
4. Run accessibility audits for page-level regressions.

Do not start with a browser test if a faster test can prove the same behavior.

## Behavioral Testing Standard

This project prefers behavioral tests in the same spirit as Kent C. Dodds' guidance: the more a test resembles how software is used, the more confidence it gives.

That means tests should prefer observable outcomes such as:

- rendered text
- accessible roles and names
- emitted events
- state changes visible in the DOM or returned API
- navigation outcomes
- response headers and document metadata
- side effects that consuming code or users can observe

Avoid assertions about:

- private refs
- computed implementation details
- internal helper names
- brittle DOM structure checks that do not matter to users
- CSS selectors when a role, name, text, or stable test contract is available

## Testing Pyramid

The testing pyramid here is about feedback speed and failure precision, not about a fixed ratio.

### Base: Unit Tests

Unit tests should hold most of the coverage.

Use them for:

- pure utilities
- parsers and formatters
- merge logic
- schema transforms
- small server utilities
- module setup logic

Why they sit at the base:

- they run fastest
- they isolate failures well
- they are cheap to maintain when the public contract is clear

### Middle: Nuxt Runtime Tests

Nuxt runtime tests prove behavior that needs Vue rendering, Nuxt context, plugins, routing helpers, or reactivity.

Use them for:

- components
- composables
- pages that need Nuxt context
- behavior tied to i18n, color mode, or injected Nuxt helpers

Why they sit in the middle:

- they are slower than pure unit tests
- they still fail closer to the root cause than browser tests
- they are the right place to verify most UI behavior without paying full browser cost

### Top: Browser Tests

Browser tests should cover the smallest set of high-value behaviors that need a real browser and a production-like app build.

Use them for:

- end-to-end flows
- route changes
- hydration regressions
- response headers
- document metadata that matters after full rendering
- manifest, asset, and page availability checks

Why they stay at the top:

- they are the slowest tests
- they are the most expensive to debug
- they are still essential for catching integration failures that lower layers cannot see

### Accessibility Layer

Accessibility is not a substitute for functional testing, but it is not optional either.

Use accessibility checks to catch:

- missing semantics
- weak contrast and page-level audit failures
- landmark and metadata regressions

In this starter, page-level accessibility audits run through `pnpm test:a11y`.

### Component Accessibility Tests

In addition to page-level Lighthouse audits, test individual components for accessibility violations using `axe-core` through Nuxt test utils.

Concrete example:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppHeader from '~/components/AppHeader.vue'

describe('AppHeader accessibility', () => {
  it('has no axe-core violations', async () => {
    const component = await mountSuspended(AppHeader)
    // @ts-expect-error axe-core integration
    const results = await axe(component.element)
    expect(results.violations).toEqual([])
  })
})
```

This catches violations that are invisible in page-level audits, such as missing labels inside nested components, incorrect ARIA attributes on custom widgets, and invalid role combinations.

For high-traffic components like headers, footers, and form controls, consider maintaining a coverage file that ensures every exported component has an accessibility test.

## What To Test Where

Choose the lowest layer that can prove the behavior with confidence.

### Pure Utilities

Test pure utilities in `test/unit`.

Good candidates:

- string cleanup
- date logic
- parsing and formatting
- sort and filter logic
- configuration merging

Preferred assertions:

- input to output behavior
- edge cases
- roundtrips
- immutability when it matters

Concrete example:

```ts
import { describe, expect, it } from 'vitest'
import { parseIsoDate, toIsoDate } from '~/utils/date'

describe('date helpers', () => {
  it('parses an ISO date at UTC midnight', () => {
    expect(parseIsoDate('2026-04-05').toISOString()).toBe('2026-04-05T00:00:00.000Z')
  })

  it('roundtrips valid dates', () => {
    const iso = '2026-12-31'
    expect(toIsoDate(parseIsoDate(iso))).toBe(iso)
  })
})
```

This is good because it checks the public contract directly and avoids testing how the helper is implemented internally.

### Nuxt Modules

Test module setup logic in `test/unit` unless a real browser is required.

Good candidates:

- route-rule merging
- injected metadata
- environment-dependent configuration
- safe defaults in development vs production

Preferred assertions:

- the resulting Nuxt options
- merge behavior
- environment branching
- safe handling of existing user config

Concrete example:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

const useNuxt = vi.fn()

vi.mock('nuxt/kit', () => ({
  defineNuxtModule: (module: unknown) => module,
  useNuxt,
}))

describe('security module', () => {
  afterEach(() => {
    useNuxt.mockReset()
    vi.unstubAllEnvs()
  })

  it('merges security headers into existing route rules', async () => {
    const nuxt = {
      options: {
        dev: false,
        devtools: { enabled: true },
        app: { head: { meta: [] } },
        routeRules: {
          '/**': { headers: { 'Cache-Control': 'public, max-age=0' } },
        },
      },
    }

    useNuxt.mockReturnValue(nuxt)

    const securityHeadersModule = (await import('~~/modules/security-headers')).default
    const setup = Reflect.get(securityHeadersModule, 'setup') as () => void
    setup()

    expect(nuxt.options.routeRules['/**']).toEqual({
      headers: {
        'Cache-Control': 'public, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
  })
})
```

This is good because it mocks the framework seam and asserts only the public result of setup.

### Server Utilities And API Handlers

Keep business logic in `server/utils` or shared utilities so it can be tested in `test/unit`.

Prefer this split:

- test parsing, validation, branching, and transforms in unit tests
- keep route handlers thin
- cover one or two high-value request and response behaviors in browser tests when needed

Concrete example:

```ts
import { describe, expect, it } from 'vitest'
import { normalizeSearchQuery } from '#server/utils/search'

describe('normalizeSearchQuery', () => {
  it('trims whitespace and lowercases the query', () => {
    expect(normalizeSearchQuery('  VueUse  ')).toBe('vueuse')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeSearchQuery('   ')).toBe('')
  })
})
```

If a server route becomes complex, extract the logic first. That makes the test faster and the code easier to maintain.

### Composables

Test composables in `test/nuxt/composables` when they depend on Nuxt context, browser guards, storage, or shared reactive state.

Test:

- returned refs and computed values
- important state transitions
- SSR-safe defaults
- client-only side effects when they are part of the contract

Do not test Vue internals. Test the composable API.

Concrete example:

```ts
import { describe, expect, it } from 'vitest'
import { usePanelState } from '~/composables/usePanelState'

describe('usePanelState', () => {
  it('starts closed and exposes the correct label', () => {
    const panel = usePanelState()

    expect(panel.isOpen.value).toBe(false)
    expect(panel.label.value).toBe('Open panel')
  })

  it('updates state through its public actions', () => {
    const panel = usePanelState()

    panel.open()
    expect(panel.isOpen.value).toBe(true)
    expect(panel.label.value).toBe('Close panel')
  })
})
```

If a composable only wraps pure calculations, move that logic into a utility and test the utility instead.

### Components

Test components in `test/nuxt/components`.

Test:

- visible copy
- roles and accessible names
- emitted events
- important interaction behavior
- state that changes what the user can perceive

Do not test:

- exact ref names
- private computed structure
- implementation-only class toggles unless they are the public contract

Concrete example:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

const PackageCard = defineComponent({
  props: {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  template: `
    <article>
      <h2>{{ name }}</h2>
      <p>{{ description }}</p>
    </article>
  `,
})

describe('PackageCard', () => {
  it('renders visible package details', async () => {
    const component = await mountSuspended(PackageCard, {
      props: {
        name: 'vite-plus',
        description: 'Unified tooling for the web',
      },
    })

    expect(component.text()).toContain('vite-plus')
    expect(component.text()).toContain('Unified tooling for the web')
  })
})
```

For interactive components, add assertions for click, keyboard, or emitted-event behavior through the public UI.

### Pages

Page tests belong in `test/nuxt/pages` when the question is mostly about rendered content, SEO metadata, or route-aware state inside Nuxt.

Test pages at the Nuxt runtime layer when you need to verify:

- page-specific rendering
- localized content
- route params or query-driven behavior
- page metadata driven by state

Escalate the same page behavior to browser tests only when you need:

- real navigation
- hydration confidence
- network and asset behavior
- interaction across multiple pages

Concrete example:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

const SearchPage = defineComponent({
  template: `
    <main>
      <h1>Search packages</h1>
      <p>Start typing to see results</p>
    </main>
  `,
})

describe('search page', () => {
  it('renders the empty state when no query is present', async () => {
    const component = await mountSuspended(SearchPage)

    expect(component.text()).toContain('Search packages')
    expect(component.text()).toContain('Start typing to see results')
  })
})
```

The same pattern applies when the thing under test is a real page SFC. The example is declared inline here only to keep the guide self-contained.

### Routing And Hydration

Test routing and hydration in `test/e2e`.

These are browser concerns because they depend on the built app, real navigation, and browser reconciliation.

Concrete example:

```ts
import { expect, test } from '@playwright/test'

test('homepage has no hydration errors', async ({ page }) => {
  const errors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().toLowerCase().includes('hydration')) {
      errors.push(msg.text())
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(errors).toEqual([])
})
```

This belongs in the browser layer because a unit or runtime test cannot prove production hydration behavior.

### Security Headers And Metadata

Split these checks by responsibility.

- Use unit tests to prove config and merge logic.
- Use browser tests to prove the built app actually serves the expected headers and tags.

Concrete browser example:

```ts
import { expect, test } from '@playwright/test'

test('pages include security response headers', async ({ page, baseURL }) => {
  const response = await page.goto(baseURL!)
  const headers = response!.headers()

  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
})
```

### Full User Flows

Put full flows in `test/e2e`.

Good candidates:

- locale switching
- search and navigation flows
- auth handoff flows in future features
- flows that cross multiple components or pages

Concrete example:

```ts
import { expect, test } from '@playwright/test'

test('switching locale updates the page content', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Deutsch' }).click()

  await expect(page).toHaveURL(/\/de$/)
  await expect(page.getByRole('heading', { name: /staerkeren Nuxt-Basis/i })).toBeVisible()
})
```

### Test Fixtures And Mock Data

For tests that depend on external API responses, use fixture files instead of inline mock objects.

Store fixtures in `test/fixtures/` organized by data source:

```
test/fixtures/
  api/
    packages/
      vue.json
      nuxt.json
    search/
      basic-query.json
  responses/
    error-404.json
    error-500.json
```

Benefits:

- fixtures can be regenerated from real APIs to stay current
- multiple tests can share the same fixture without duplication
- fixture files are easy to diff in code review

When using fixtures, import them as JSON modules:

```ts
import vuePackage from '~/test/fixtures/api/packages/vue.json'

describe('package display', () => {
  it('renders package metadata', async () => {
    // use vuePackage as mock data
  })
})
```

Avoid hand-crafting large response objects inside test files when a shared fixture would be more maintainable.

## Decision Checklist

Before writing a test, ask:

1. Is the behavior pure logic with no Vue or Nuxt dependency?
2. Is the behavior mostly inside a component, composable, or page contract?
3. Does this need a real browser to be trustworthy?
4. Can a lower layer prove the same thing faster?
5. What observable behavior would fail if this feature broke?

If you follow that order, most tests will land in the right place.

## Mocking And Determinism

Mock at boundaries, not in the middle of the behavior you are trying to prove.

Good things to mock:

- external network requests
- Nuxt kit APIs in module tests
- environment variables
- time and randomness when they affect determinism

Good things to keep real:

- pure functions
- rendered output
- emitted events
- route and locale behavior inside Nuxt runtime tests when the fixture can support it

Rules:

- prefer real collaborators until they make the test flaky or too broad
- mock external I/O before mocking your own code
- fail quickly on hidden environment coupling when practical
- keep test data intentional and easy to read

Concrete example:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('release window', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens during the configured date range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00.000Z'))

    expect(isReleaseWindowOpen()).toBe(true)
  })
})
```

The point is to control unstable boundaries without mocking the behavior under test.

## Selectors And Assertions

In UI and browser tests, prefer selectors that reflect how users and assistive technology find the interface.

Prefer:

- `getByRole`
- visible text
- accessible names
- stable attributes when there is no better user-facing contract

Avoid:

- brittle class selectors
- deep DOM traversal
- selectors tied to markup that can change without affecting behavior

Prefer this:

```ts
await page.getByRole('button', { name: 'Load more' }).click()
await expect(page.getByText('20 results')).toBeVisible()
```

Over this:

```ts
await page.locator('.results-toolbar > button:nth-child(2)').click()
await expect(page.locator('.results-count')).toHaveText('20 results')
```

If a test needs a stable non-accessibility hook, add a clear contract for it. Do not rely on presentational classes becoming accidental test APIs.

## When To Use Fast-Check

Use `fast-check` when the important behavior is an invariant across many inputs, not a small list of examples.

Good reasons to use it:

- parser and formatter roundtrips
- merge behavior that must preserve invariants
- ordering guarantees
- async queue or concurrency guarantees
- state machines with many edge combinations

Concrete example:

```ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { parseIsoDate, toIsoDate } from '~/utils/date'

describe('date helpers', () => {
  it('roundtrip valid ISO dates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
        async date => {
          const iso = toIsoDate(date)
          const roundtrip = toIsoDate(parseIsoDate(iso))
          return roundtrip === iso
        },
      ),
    )
  })
})
```

This is a good fit because the invariant matters more than any single example.

Do not use `fast-check` for:

- simple rendering tests
- basic component interactions
- one-off examples with a few obvious cases
- situations where three explicit examples already explain the behavior better

Start with example-based tests. Reach for property-based testing only when the space of valid inputs is large enough that examples will miss important edge cases.

## Commands And Workflow

Use the repo-facing scripts first:

- `pnpm test` runs the full Vitest suite
- `pnpm test:unit` runs the unit project
- `pnpm test:nuxt` runs the Nuxt runtime project
- `pnpm test:e2e` runs browser tests against a built app
- `pnpm test:coverage` runs coverage
- `pnpm test:a11y` runs the page-level accessibility audit

Under the hood, the test projects are split like this:

- `unit` uses a Node test environment
- `nuxt` uses a Nuxt test environment

Workflow rules:

1. Run the narrowest relevant test command while working.
2. Run broader coverage only when the change crosses boundaries.
3. After code changes, run `pnpm lint:fix && pnpm typecheck`.
4. If you touched browser behavior, run `pnpm test:e2e`.
5. If you touched accessibility-sensitive page behavior, run `pnpm test:a11y`.

## Recommended Starter Layout

These folders are a good default, but the guidance in this document still applies if you rename or restructure them later.

- `test/unit` for pure logic and module setup tests
- `test/nuxt/components` for component tests
- `test/nuxt/composables` for composable tests
- `test/nuxt/pages` for page tests
- `test/e2e` for browser tests

## Anti-Patterns

Avoid these:

- browser tests for logic that should live in unit tests
- asserting internal state instead of public behavior
- over-mocking your own code
- testing every tiny detail at every layer
- relying on presentational classes as the main UI contract
- adding property-based tests where a few clear examples are enough
- keeping complex business logic inside route handlers or components where it becomes harder to test
- skipping component-level accessibility tests for interactive components
- hand-crafting large mock objects inline when a shared fixture file would be more maintainable
- duplicating fixture data across multiple test files

If you follow these rules, tests stay fast, trustworthy, and easier for the next developer to extend.
