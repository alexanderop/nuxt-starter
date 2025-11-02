# 🧪 Testing Strategy Specification for Nuxt 4 Layer Based E Commerce App

## 1. Purpose

This document defines how we test the Nuxt 4 layer based e commerce application.
It explains what we test, where we put tests, what tools we use and how we run tests in CI.
The goal is to get fast feedback, high confidence and low test maintenance.

This strategy follows the testing pyramid (mostly integration, some unit, a few end to end) and is tailored to our architecture (Nuxt layers, Elm pattern stores, explicit imports, Zod at the boundaries).

> **"Write tests. Not too many. Mostly integration."** (Guillermo Rauch)

---

## 2. Testing Principles

1. Prefer integration tests (because they test Nuxt runtime, stores, templates, validation and imports together).
2. Keep unit tests for pure logic (reducers, utils, schema rules, calculations).
3. Keep end to end tests for business critical flows only.
4. Test behavior, not internals (query UI like a user, not like a framework).
5. Co locate tests next to the code.
6. Mock only what is outside the current layer (API, external services).
7. Nuxt has first class test utilities, so we use them.

---

## 3. Testing Levels

We split test effort like this:

* **70 percent Integration tests** (components with Nuxt, pages, stores through UI)
* **20 percent Unit tests** (pure functions, reducers, utils, Zod rules)
* **10 percent E2E tests** (critical journeys only)

### 3.1 Unit Tests (20 percent)

**Test these**

* Pure reducer functions in Elm pattern stores (for example `cartUpdate.ts`)
* Shared utility functions (for example `currency.ts`, `storage.ts`)
* Zod schemas and validation rules
* Pure business logic (cart totals, discounts, shipping rules)

**Do not test these with unit tests**

* Vue components (test them with integration tests)
* Pinia store wiring (test it through the component that uses the store)
* API calls (mock at integration level)

**Good unit test targets**

```text
layers/cart/app/stores/cart/cartUpdate.ts
layers/shared/app/utils/currency.ts
layers/products/app/utils/filters.ts
layers/cart/app/utils/calculations.ts
```

**Skip here, test via integration**

```text
layers/cart/app/components/cartItem.vue
layers/cart/app/stores/cart/cart.ts
```

### 3.2 Integration Tests (70 percent)

Integration tests run Vue components inside the Nuxt runtime (with `mountSuspended`).
They test templates, composables, stores, schema usage and cross layer contracts.

**Test these**

1. Components that use Nuxt runtime or auto imports
2. Components that talk to a store
3. Cross layer usage (cart using product schema)
4. Composables that need Nuxt context
5. Workflows (form submit, add to cart, filter products, show summary)

**Coverage priorities**

1. Critical paths (add to cart, checkout, product filtering)
2. Store interactions (message dispatch, state updates, persistence)
3. Cross layer contracts (cart uses product schema, cart item uses product structure)
4. UI that contains logic (forms, lists, summaries)

**Examples**

```text
High priority
- layers/cart/app/components/cartSummary.vue
- layers/products/app/components/productFilters.vue
- layers/cart/app/pages/shoppingCart.vue

Medium priority
- layers/products/app/components/productCard.vue
- layers/cart/app/components/cartItem.vue

Low priority
- layers/shared/app/components/baseBadge.vue
```

### 3.3 E2E Tests (10 percent)

We use Playwright. We only test that the real app works for a user.

**Test these**

1. App starts and renders main pages
2. Browse products, filter, open detail
3. Add to cart and see correct totals
4. Cart survives reload (localStorage)
5. Checkout journey (happy path)

**Do not test here**

* Edge cases (do that in integration tests)
* All validation errors (do that in unit or integration)
* Big test matrices (too slow)

**Key scenarios**

1. Homepage shows products
2. User can filter or search
3. User can add product to cart from list and from detail
4. Cart page shows item and totals
5. Refresh does not lose cart

---

## 4. Tooling

### 4.1 Core Stack

| Tool                     | Purpose                | Reason                              |
| ------------------------ | ---------------------- | ----------------------------------- |
| **Vitest**               | Test runner            | Fast, Vite native, easy Nuxt setup  |
| **@nuxt/test-utils**     | Nuxt testing utilities | Official Nuxt support, layers aware |
| **@vue/test-utils**      | Vue component mounting | Works with `mountSuspended`         |
| **@testing-library/vue** | User style queries     | Tests behavior and accessibility    |
| **Playwright**           | E2E tests              | Stable, fast, network mocking       |
| **happy-dom**            | DOM environment        | Faster than jsdom for our use case  |
| **fast-check**           | Property based tests   | Finds edge cases in pure logic      |
| **@anatine/zod-mock**    | Zod-driven mock data   | Generates valid mocks from schemas  |

### 4.2 API Mocking

**Unit tests**

* No mocking (we test pure logic)

**Integration tests**

* Use `registerEndpoint` from `@nuxt/test-utils` for Nitro endpoints
* Use `mockNuxtImport` for Nuxt composables or `$fetch`
* Use `mockComponent` for very heavy components

**E2E tests**

* Prefer real Nitro test data
* Or use Playwright `page.route(...)` for selective mocking
* MSW is not recommended here (Nuxt SSR creates problems, native Nuxt and Playwright options are enough)

### 4.3 Test Utilities and Mock Generation

**Zod-Driven Mock Generation**

This project uses `@anatine/zod-mock` to generate test data automatically from Zod schemas. This ensures mocks always match runtime validation and prevents schema drift.

**Location:** `layers/shared/app/test/mocks.ts`

**Available Functions:**

| Function | Purpose | Example |
|----------|---------|---------|
| `generateProduct(overrides?)` | Generate a valid Product | `generateProduct({ price: 1999 })` |
| `generateProducts(count)` | Generate array of Products | `generateProducts(10)` |
| `generateCartItem(overrides?)` | Generate a valid CartItem | `generateCartItem({ quantity: 3 })` |
| `generateCartItems(count)` | Generate array of CartItems | `generateCartItems(5)` |
| `generateCartItemWithPrice(price, qty)` | For exact calculations tests | `generateCartItemWithPrice(1999, 2)` |
| `generateFilter(overrides?)` | Generate ProductFilter | `generateFilter({ category: 'electronics' })` |
| `generateCategory()` | Generate ProductCategory enum | `generateCategory()` |
| `generateSort()` | Generate ProductSort enum | `generateSort()` |

**Usage in Tests:**

```typescript
import { generateProduct, generateCartItem } from '~/test/mocks.js'

// Unit test example
it('calculates subtotal correctly', () => {
  const item = generateCartItemWithPrice(1999, 2)
  expect(calculateSubtotal([item])).toBe(3998)
})

// With overrides for specific test cases
it('filters expensive products', () => {
  const products = [
    generateProduct({ price: 999 }),    // cheap
    generateProduct({ price: 99999 })   // expensive
  ]
  const result = filterProducts(products, { priceRange: { min: 10000, max: 100000 } })
  expect(result).toHaveLength(1)
})
```

**Benefits:**

✅ Mocks always valid against Zod schemas
✅ Schema changes auto-update mocks
✅ No manual mock maintenance
✅ Type-safe with proper TypeScript inference
✅ Eliminates ~200 lines of manual mock code

**Import Alias:**

Tests use the `~/test/mocks.js` alias (configured in `vitest.config.ts`) to import test utilities from any layer.

---

## 5. Project Layout

```text
layers/
├── shared/
│   └── app/
│       ├── components/
│       │   └── __tests__/
│       │       └── baseBadge.nuxt.test.ts
│       └── utils/
│           └── __tests__/
│               ├── currency.test.ts
│               └── storage.test.ts
├── products/
│   └── app/
│       ├── components/
│       │   └── __tests__/
│       │       ├── productCard.nuxt.test.ts
│       │       ├── productFilters.nuxt.test.ts
│       │       └── productGrid.nuxt.test.ts
│       ├── stores/
│       │   └── products/
│       │       └── __tests__/
│       │           └── productsUpdate.test.ts
│       └── utils/
│           └── __tests__/
│               └── filters.test.ts
└── cart/
    └── app/
        ├── components/
        │   └── __tests__/
        │       ├── cartItem.nuxt.test.ts
        │       ├── cartList.nuxt.test.ts
        │       └── cartSummary.nuxt.test.ts
        ├── pages/
        │   └── __tests__/
        │       └── shoppingCart.nuxt.test.ts
        ├── stores/
        │   └── cart/
        │       └── __tests__/
        │           ├── cartUpdate.test.ts
        │           └── cartEffects.test.ts
        └── utils/
            └── __tests__/
                └── calculations.test.ts

test/
└── e2e/
    ├── smoke.spec.ts
    ├── product-browsing.spec.ts
    └── cart-flow.spec.ts

vitest.config.ts
playwright.config.ts
```

**Naming**

* Unit tests: `*.test.ts` (node environment)
* Integration tests: `*.nuxt.test.ts` (Nuxt environment)
* E2E tests: `*.spec.ts` (Playwright)

---

## 6. Configuration

### 6.1 Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'layers/**/utils/**/*.test.ts',
            'layers/**/stores/**/*Update.test.ts'
          ]
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: [
            'layers/**/components/**/*.nuxt.test.ts',
            'layers/**/pages/**/*.nuxt.test.ts'
          ],
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
              mock: {
                intersectionObserver: true,
                indexedDB: false
              }
            }
          }
        }
      })
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['layers/**/app/**/*.{ts,vue}'],
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/nuxt.config.ts',
        '**/*.d.ts'
      ]
    }
  }
})
```

### 6.2 Playwright (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

### 6.3 Scripts (`package.json`)

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --project unit",
    "test:integration": "vitest --project nuxt",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 7. Coverage Targets

| Area                             | Target            | Comment                 |
| -------------------------------- | ----------------- | ----------------------- |
| Pure functions (utils, reducers) | 90 to 100 percent | Small and easy          |
| Components on critical paths     | 70 to 80 percent  | Integration tests       |
| Store effects                    | 60 to 70 percent  | Test through components |
| Pages                            | 60 to 70 percent  | Major pages only        |
| Shared utilities                 | 80 to 90 percent  | Many consumers          |

We do not chase 100 percent for everything.
We cover business critical code first.

---

## 8. Best Practices

### 8.1 Test Behavior

```typescript
// avoid
expect(store.state.value.items).toHaveLength(1)

// prefer
expect(screen.getByText('1 item in cart')).toBeInTheDocument()
```

### 8.2 Use Accessibility Queries

In component and integration tests use Testing Library queries:

1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByAltText`
6. `getByTitle`
7. `getByTestId` only if nothing else works

In Playwright do the same with `page.getByRole(...)`, `page.getByLabel(...)`, `page.getByText(...)`.

### 8.3 Use `userEvent`

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.type(screen.getByLabelText(/email/i), 'test@example.com')
await user.click(screen.getByRole('button', { name: /submit/i }))
```

### 8.4 Keep Tests Isolated

```typescript
import { beforeEach } from 'vitest'

beforeEach(() => {
  localStorage.clear()
})
```

### 8.5 Mock Nuxt Correctly

```typescript
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('$fetch', () => {
  return vi.fn().mockResolvedValue({ products: [] })
})
```

Call mocks at top level, not inside `describe`. Nuxt needs them early.

---

## 9. CI Integration

**File** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 10. Property Based Testing (with fast check)

We use property based tests for code that is pure and rule driven.
This fits our Elm pattern reducers, currency utilities, calculations, Zod schemas and filtering.

**Use fast check when**

* The function is pure
* There is an invariant (for example total is never negative)
* There is a round trip (for example format then parse)
* There is a monotonic property (for example more items means higher subtotal)

**Do not use fast check when**

* Testing components
* Testing E2E flows
* Testing SSR or network effects

**Name files like this**

```text
cartUpdate.test.ts       // regular unit tests
cartUpdate.pbt.test.ts   // property based tests
```

---

## 11. Implementation Plan

### Phase 1 (setup)

* Install all test dependencies
* Add `vitest.config.ts` (unit and Nuxt projects)
* Add `playwright.config.ts`
* Add test scripts
* Create `test/e2e/` folder
* Update `.gitignore`

### Phase 2 (unit)

* Utilities in shared
* Reducers in cart and products
* Calculations
* Zod schemas

### Phase 3 (integration)

* Shared components
* Product components
* Cart components
* Cart page

### Phase 4 (e2e)

* Smoke tests
* Product browsing
* Cart flow

### Phase 5 (ci and docs)

* GitHub Actions
* Coverage upload
* Add test commands to project docs
* Review coverage and fill gaps

---

## 12. Quick Commands

```bash
# All tests
pnpm test

# Only unit
pnpm test:unit

# Only integration
pnpm test:integration

# Only e2e
pnpm test:e2e

# Watch
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E with UI
pnpm test:e2e:ui

# Single file
pnpm vitest layers/cart/app/stores/cart/__tests__/cartUpdate.test.ts

# Grep
pnpm vitest --grep "cart"
```

---

## 13. Notes for This Project

* Architecture is layer based (shared, products, cart)
* Stores follow Elm pattern (so reducers are perfect for unit and property based tests)
* We use explicit imports (so mocking is simple)
* We use Zod at boundaries (so we test boundaries as unit tests)
* We prefer tests without dashes in prose (use parentheses instead)

This is the testing strategy document. You can drop it into the repo as `TESTING.md` and keep it in sync with the Nuxt version.
