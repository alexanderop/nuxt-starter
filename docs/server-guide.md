# Server Guide

This guide defines how server-side code should be written in this starter.

The standard is:

- thin route handlers
- validated inputs
- consistent error responses
- cacheable where appropriate
- business logic extracted into utilities

See also [typescript-guide.md](./typescript-guide.md) and [testing-guide.md](./testing-guide.md).

## Core Rule

Keep route handlers thin. A handler should validate input, call a utility, and return a response.

If the handler is growing beyond 20–30 lines, extract the logic into `server/utils/` so it can be tested in isolation.

## File Structure

```
server/
  api/
    search.get.ts        # GET /api/search
    packages/
      [name].get.ts      # GET /api/packages/:name
  middleware/
    cors.ts              # Server middleware
  plugins/
    timing.ts            # Nitro plugins
  utils/
    search.ts            # Business logic for search
    packages.ts          # Business logic for packages
```

Naming conventions:

- API routes: `kebab-case` + HTTP method suffix (`.get.ts`, `.post.ts`, `.delete.ts`)
- Middleware: `kebab-case.ts`
- Plugins: `kebab-case.ts`
- Utilities: `kebab-case.ts`

## Input Validation

Validate all external input at the handler boundary using Zod schemas from `shared/schemas/`.

Prefer:

```ts
import { SearchParamsSchema } from '#shared/schemas/search'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const params = SearchParamsSchema.parse(query)

  const results = await searchPackages(params)
  return results
})
```

Do not scatter validation across multiple utilities. Validate once at the boundary, then pass typed data through.

## Error Handling

Use `createError` from H3 for all error responses. Define error message constants in `shared/utils/constants.ts` to keep messages consistent.

Prefer:

```ts
import { ERROR_PACKAGE_NOT_FOUND } from '#shared/utils/constants'

export default defineEventHandler(async event => {
  const name = getRouterParam(event, 'name')
  const pkg = await findPackage(name)

  if (!pkg) {
    throw createError({
      statusCode: 404,
      message: ERROR_PACKAGE_NOT_FOUND,
    })
  }

  return pkg
})
```

For upstream failures, catch and re-throw with a meaningful status code:

```ts
try {
  const data = await fetchFromRegistry(name)
  return data
} catch (error: unknown) {
  throw createError({
    statusCode: 502,
    message: 'Registry request failed',
  })
}
```

Do not let raw upstream errors leak to the client.

## Caching

Use `defineCachedEventHandler` for responses that can be cached.

```ts
export default defineCachedEventHandler(
  async event => {
    const name = getRouterParam(event, 'name')
    return await fetchPackageMetadata(name)
  },
  {
    maxAge: 60 * 5, // 5 minutes
    shouldBypassCache: () => import.meta.dev,
  },
)
```

Guidelines:

- bypass cache in development to avoid stale data during iteration
- set `maxAge` based on how often the upstream data changes
- use ISR route rules in `nuxt.config.ts` for page-level caching

Cache location: `.nuxt/cache/nitro/handlers/`. Clear with `rm -rf .nuxt/cache/nitro/handlers/` when debugging stale responses.

## URL Parameter Parsing

For routes with complex parameter patterns (scoped packages, optional versions), extract parsing into a utility.

```ts
// server/utils/params.ts
export function parsePackageParams(segments: string[]) {
  const isScoped = segments[0]?.startsWith('@')
  const rawName = isScoped ? `${segments[0]}/${segments[1]}` : segments[0]
  const rawVersion = segments.find((_, i) => segments[i - 1] === 'v')

  return { rawName, rawVersion }
}
```

This keeps the handler clean and the parsing testable.

## Response Shape

Return plain objects from handlers. Nitro serializes them as JSON automatically.

For consistency, prefer flat response shapes:

```ts
return {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
}
```

Avoid wrapping responses in `{ data: ... }` or `{ result: ... }` unless the API contract requires pagination metadata or similar envelope fields.

## Server Utilities

Place reusable server logic in `server/utils/`. These are auto-imported by Nitro.

Good candidates for server utilities:

- data fetching and transformation
- authentication helpers
- rate limiting logic
- response formatting

Keep utilities pure where possible. Accept data as arguments and return results. Avoid reaching for the event object inside utilities unless they genuinely need request context.

## Middleware

Server middleware runs on every request before the route handler.

Use middleware for:

- logging and timing
- authentication checks
- CORS headers
- request normalization

Keep middleware focused. One middleware file should do one thing.

## Testing Server Code

Test server logic in `test/unit/` by testing the extracted utilities directly.

```ts
import { describe, expect, it } from 'vitest'
import { parsePackageParams } from '#server/utils/params'

describe('parsePackageParams', () => {
  it('parses a simple package name', () => {
    expect(parsePackageParams(['vue'])).toEqual({
      rawName: 'vue',
      rawVersion: undefined,
    })
  })

  it('parses a scoped package with version', () => {
    expect(parsePackageParams(['@nuxt', 'kit', 'v', '3.0.0'])).toEqual({
      rawName: '@nuxt/kit',
      rawVersion: '3.0.0',
    })
  })
})
```

Reserve browser tests for verifying that the built app actually serves the expected responses and headers.

## Anti-Patterns

Avoid these:

- business logic inside route handlers that should be in utilities
- raw upstream errors leaking to the client
- validation scattered across multiple layers
- inline error messages instead of shared constants
- skipping cache bypass in development
- large handler files that do fetching, transforming, and formatting in one function
- middleware that silently swallows errors
