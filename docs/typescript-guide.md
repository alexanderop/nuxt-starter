# TypeScript Guide

This guide defines TypeScript conventions for this starter.

The standard is:

- strict types everywhere
- no escape hatches
- explicit imports with consistent ordering
- semantic naming conventions across the codebase

See also [components-guide.md](./components-guide.md) and [composables-guide.md](./composables-guide.md).

## Core Rule

Write strictly typed code. Do not use `any`.

If a type is truly unknown at a boundary, use `unknown` and narrow it before use.

Prefer:

```ts
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

over:

```ts
function handleError(error: any) {
  console.error(error.message)
}
```

## Import Order

Organize imports in this order:

1. Type imports
2. External packages
3. Internal aliases (`#shared/`, `#server/`, `#imports`)
4. Local paths (`~/`)

No blank lines between groups.

Prefer:

```ts
import type { PackageInfo } from '#shared/types'
import type { RouteLocationRaw } from 'vue-router'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { formatDate } from '~/utils/date'
```

Separate type imports from value imports using `import type` consistently.

## Naming Conventions

| Type                | Convention           | Example                   |
| ------------------- | -------------------- | ------------------------- |
| Vue components      | PascalCase           | `AppHeader.vue`           |
| Pages               | kebab-case           | `search-results.vue`      |
| Composables         | camelCase + `use`    | `useThemePreference.ts`   |
| Utilities           | camelCase            | `formatDate.ts`           |
| Server routes       | kebab-case + method  | `search.get.ts`           |
| Functions           | camelCase            | `parsePackageName`        |
| Constants           | SCREAMING_SNAKE_CASE | `MAX_RESULTS`             |
| Types / Interfaces  | PascalCase           | `SearchResponse`          |
| Enums               | PascalCase           | `SortOrder`               |

## Type Definitions

Place types where they are used:

- Types shared between app and server go in `shared/types/`
- Types used only in the app go in `app/types/`
- Types used only on the server go in `server/types/`
- Component-local types stay in the component file

Prefer interfaces for object shapes and type aliases for unions and computed types:

```ts
interface PackageInfo {
  name: string
  version: string
  description?: string
}

type SortDirection = 'asc' | 'desc'
type PackageList = PackageInfo[]
```

## Generics

Use generics when the function genuinely works across types. Avoid generics when a concrete type is sufficient.

Prefer:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}
```

over adding generics to functions that only ever receive one type.

## Enums And Constants

Prefer string literal unions over enums for simple sets:

```ts
type Theme = 'light' | 'dark' | 'system'
```

Use `as const` objects for values that need both runtime access and type narrowing:

```ts
const SORT_OPTIONS = {
  relevance: 'relevance',
  downloads: 'downloads',
  updated: 'updated',
} as const

type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]
```

Reserve enums for larger sets where the enum abstraction genuinely helps readability.

## Error Handling

Handle errors at boundaries, not deep inside utilities.

Prefer:

```ts
// In the API handler or composable that calls the utility
try {
  const result = parseInput(raw)
  return result
} catch (error: unknown) {
  throw createError({
    statusCode: 400,
    message: 'Invalid input format',
  })
}
```

Utilities should throw descriptive errors or return result types. Callers should decide how to surface them.

## Null And Undefined

Prefer `undefined` over `null` for absent values. Use `null` only when it is part of an external API contract.

Use optional chaining and nullish coalescing:

```ts
const name = response?.data?.name ?? 'Unknown'
```

Avoid non-null assertions (`!`) unless you can prove the value exists and a comment explains why.

## Shared Schemas

Use Zod for runtime validation at system boundaries (API inputs, external data, form submissions).

Place shared schemas in `shared/schemas/`:

```ts
import { z } from 'zod'

export const SearchParamsSchema = z.object({
  query: z.string().trim().min(1),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type SearchParams = z.infer<typeof SearchParamsSchema>
```

Do not duplicate validation logic. Define the schema once and infer the type from it.

## Comments

Add comments only when the code is not self-explanatory.

Good reasons for comments:

- non-obvious type narrowing
- workarounds for upstream issues
- SSR-specific behavior
- performance-motivated choices

Bad reasons for comments:

- restating what the code does
- documenting obvious function signatures
- adding JSDoc to every export

## Anti-Patterns

Avoid these:

- `any` casts or type assertions to silence errors
- `@ts-ignore` without a linked issue or explanation
- barrel files that re-export everything from a directory
- circular imports between `app/` and `server/`
- runtime type checks that duplicate a Zod schema
- deeply nested generics that make signatures unreadable
- non-null assertions without justification
