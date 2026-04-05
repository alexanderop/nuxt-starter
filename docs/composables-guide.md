# Composables Guide

This guide defines how composables should be written in this starter.

The standard is:

- one responsibility per composable
- small, explicit APIs
- SSR awareness
- VueUse-first reuse when appropriate
- utilities stay in `utils`, not `composables`

See also [components-guide.md](./components-guide.md) and [testing-guide.md](./testing-guide.md).

## Import Policy

This starter disables local composable and utility scanning with `imports.scan: false` in `nuxt.config.ts`.

That means:

- files in `app/composables` are not injected into scope automatically
- files in `app/utils` are not injected into scope automatically
- Vue APIs should be imported from `vue`
- Nuxt and module composables should be imported explicitly from `#imports`

Prefer:

```ts
import { computed, ref } from 'vue'
import { useRoute, useState } from '#imports'
import { useSearchState } from '~/composables/useSearchState'
import { parseIsoDate } from '~/utils/date'
```

Avoid relying on bare identifiers that only work when Nuxt scanning is enabled.

## Core Rule

A composable should solve one reusable reactive behavior problem.

If a function is only a pure calculation or formatter, it belongs in `utils` instead.

Use a composable for:

- browser state
- route-driven state
- persisted UI preferences
- reusable async orchestration
- shared reactive state

Do not use a composable for:

- date formatting
- string cleanup
- array transforms
- stateless calculations

## Naming

- Start the name with `use`.
- Name the composable by the behavior it exposes.
- Avoid names based on implementation details.

Good names:

- `useThemePreference`
- `useGlobalSearch`
- `useViewportState`
- `useSelectedPackageManager`

Bad names:

- `useHelper`
- `useDataStuff`
- `useStateManager`

## File Shape

Prefer this shape:

```ts
export function useSomething() {
  const state = ref(false)

  const derived = computed(() => state.value)

  function activate() {
    state.value = true
  }

  return {
    state,
    derived,
    activate,
  }
}
```

If the composable naturally returns one value, returning the single ref or computed directly is fine.

## SSR And Client Guards

Composables must be safe in SSR contexts unless they are explicitly client-only.

Rules:

- guard browser-only side effects with `import.meta.client` when needed
- avoid reading from `window`, `document`, or storage at module scope
- use safe defaults that do not cause hydration mismatches
- make DOM synchronization behavior explicit in the code

Prefer this:

```ts
export function useThemePreference() {
  const preference = useState<'light' | 'dark'>('theme-preference', () => 'light')

  if (import.meta.client) {
    watch(
      preference,
      value => {
        document.documentElement.dataset.theme = value
      },
      { immediate: true },
    )
  }

  return preference
}
```

## VueUse First

Before writing custom reactive browser logic, check whether VueUse already provides the primitive.

Prefer building small wrappers around stable utilities such as:

- `useMediaQuery`
- `useLocalStorage`
- `useEventListener`
- `useClipboard`
- `useMounted`

Do not reimplement these from scratch unless the behavior truly differs.

## Shared State

Use shared state deliberately.

- use `useState` for app-level reactive state shared across Nuxt components
- use `createSharedComposable` when multiple consumers should share one browser-side source of truth
- keep the returned API as small as possible

Shared state should feel intentional, not accidental.

## Inputs And Outputs

Prefer narrow inputs and small outputs.

- accept a small number of clear arguments
- return a single ref or a small object
- expose named actions when mutation is part of the API
- avoid returning large bags of unrelated values

A composable should read like a tiny API, not a storage closet.

## Watchers And Side Effects

Use watchers only for synchronization and external effects.

Good uses:

- syncing state to the router
- syncing state to storage
- updating DOM attributes
- responding to explicit external state changes

If a value can be derived from other reactive state, prefer `computed`.

## Comments

Comments are optional and should explain why a composable behaves a certain way, not restate obvious code.

Add comments when:

- SSR behavior is subtle
- a watcher exists for a non-obvious reason
- browser-only synchronization needs context

Do not add comments for trivial assignments or standard Vue patterns.

## Testing Expectations

Composables should be straightforward to test because they isolate behavior.

Test:

- returned reactive values
- important state transitions
- client-only side effects when relevant
- SSR-safe defaults

Avoid over-testing framework internals.

## Example: Simple Composable

```ts
export function usePanelState() {
  const isOpen = shallowRef(false)

  const label = computed(() => (isOpen.value ? 'Close panel' : 'Open panel'))

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    label,
    open,
    close,
    toggle,
  }
}
```

## Example: Browser-Synced Composable

```ts
export const useSelectedMode = createSharedComposable(function useSelectedMode() {
  const mode = useLocalStorage<'grid' | 'list'>('selected-mode', 'grid')

  if (import.meta.client) {
    watch(
      mode,
      value => {
        document.documentElement.dataset.viewMode = value
      },
      { immediate: true },
    )
  }

  return mode
})
```

Why this pattern is preferred:

- the responsibility is clear
- the API is small
- browser-only work is guarded
- shared state is explicit

## Anti-Patterns

Avoid these:

- composables that are really just helpers
- broad catch-all composables with unrelated concerns
- hidden DOM mutation without client guards
- returning too many unrelated refs and methods
- names that do not describe the behavior clearly
