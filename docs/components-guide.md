# Components Guide

This guide defines how Vue components should be written in this starter.

The default standard is:

- `script setup` with TypeScript
- small public APIs
- accessible markup
- utility-first templates
- minimal hidden behavior

See also [style-guide.md](./style-guide.md), [composables-guide.md](./composables-guide.md), and [testing-guide.md](./testing-guide.md).

## Component Shape

Prefer this structure:

```vue
<script setup lang="ts">
// imports
// props and emits
// composables
// refs
// computed values
// watchers
// event handlers
</script>

<template>
  <!-- semantic, readable markup -->
</template>
```

Keep the order stable so another agent can scan the file quickly.

## Function Size

Keep functions inside components under 50 lines.

If a function grows beyond that, it usually means the component is absorbing logic that belongs in a composable or utility. Extract the logic so that the component stays focused on presentation and local interaction.

This is a guideline, not a hard rule. A 55-line function that reads clearly is better than three fragmented helpers. But if a function routinely exceeds 50 lines, treat it as a signal to look for extraction opportunities.

## Single Responsibility

Each component should have one clear UI responsibility.

Good responsibilities:

- site header
- locale switcher
- card list item
- search input
- theme toggle

Bad responsibilities:

- an all-purpose shell that also fetches data, manages forms, and renders unrelated sections

If a component starts doing multiple jobs, split it at the responsibility boundary rather than waiting for it to become unmaintainable.

## Component Naming

Component naming should be boring, explicit, and predictable.

Rules:

- use PascalCase for component file names
- name the component after its UI responsibility
- prefer specific names over short generic names
- use a domain or shell prefix when the component belongs to a broader area
- keep directory names meaningful because they affect readability and import paths

Good names:

- `AppHeader.vue`
- `AppFooter.vue`
- `SearchInput.vue`
- `ThemeToggle.vue`
- `PackageCard.vue`
- `UserMenu.vue`
- `InputBase.vue`

Bad names:

- `Header.vue`
- `Item.vue`
- `Card.vue`
- `Thing.vue`
- `BaseThing.vue` when `Base` is being used as a prefix instead of a clear component boundary

Good naming should answer: what is this component for, and where does it belong?

For reusable primitives, prefer a domain folder with `Base.vue` instead of a root-level `BaseThing.vue` file.

Prefer:

- `components/Input/Base.vue`
- `components/Button/Base.vue`

This keeps the reusable part explicit without relying on generated component names.

## Explicit Component Imports

This starter does not rely on Nuxt component auto-import.

In `nuxt.config.ts`, local component scanning is disabled with `components: []`.

That means every local component used in a template must be imported explicitly in the `<script setup>` block.

Prefer imports like:

```vue
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import SearchInput from '~/components/Search/Input.vue'
</script>
```

Best practices:

- import every local component at the top of the file that uses it
- prefer `~/components/...` imports for app-level components
- keep file and folder names specific so imports stay readable
- avoid vague leaf names like `Card.vue` or `Modal.vue` unless the folder already gives them domain context
- keep component file names stable because renames change explicit imports across the codebase

Prefer this structure:

```text
components/
  App/
    Header.vue
    Footer.vue
  Input/
    Base.vue
  Search/
    Input.vue
    Results.vue
  User/
    Menu.vue
```

which produces predictable imports:

- `~/components/App/Header.vue`
- `~/components/App/Footer.vue`
- `~/components/Input/Base.vue`
- `~/components/Search/Input.vue`
- `~/components/Search/Results.vue`
- `~/components/User/Menu.vue`

Avoid structures that create weak or ambiguous names:

```text
components/
  Common/
    Card.vue
  Shared/
    Card.vue
```

That forces the codebase to live with imports like `~/components/Common/Card.vue` and `~/components/Shared/Card.vue`, which usually means the components are too generic or the directory structure is not expressing a real UI boundary.

## Naming Strategy With Explicit Imports

The practical pattern is:

1. choose the UI domain first
2. choose the component responsibility second
3. keep the path readable when imported directly

For example, if the component is a navigation menu for authenticated users, prefer:

- `components/User/Menu.vue`

over:

- `components/Menu.vue`

The first scales. The second becomes ambiguous as the app grows and imports start to pile up.

The same rule applies to reusable building blocks. If the component is the shared base for text inputs, prefer:

- `components/Input/Base.vue`

over:

- `components/BaseInput.vue`
- `components/Base.vue`

The folder-first version scales better because the domain stays explicit and related input components can live beside it.

## Props And Emits

Rules:

- Type props explicitly with `defineProps`.
- Type emitted events explicitly with `defineEmits`.
- Use `defineModel` only when the component clearly represents a single bound value.
- Prefer semantic prop names over visual prop names.
- Avoid boolean prop explosions.

Prefer this:

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()
</script>
```

Avoid APIs like:

- `compact`
- `dense`
- `tiny`
- `blue`
- `rounded`

when they only expose implementation details and create too many combinations.

## Template Rules

Templates should be easy to review without jumping between files.

- Use semantic elements first.
- Keep major sections visually grouped.
- Break attributes onto multiple lines when readability improves.
- Keep class lists purposeful rather than random.
- Avoid long inline expressions when a computed value or helper function would be clearer.
- use explicitly imported components consistently instead of relying on template magic

Prefer this:

```vue
<template>
  <nav aria-label="Primary" class="flex items-center gap-4">
    <NuxtLink class="link-subtle focus-ring" to="/">Home</NuxtLink>
    <NuxtLink class="link-subtle focus-ring" to="/docs">Docs</NuxtLink>
  </nav>
</template>
```

over a template where navigation logic, class conditions, and large string expressions are all mixed together.

For local components, prefer this shape:

```vue
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <AppHeader />
</template>
```

## Accessibility Standard

Accessibility is a default requirement, not a follow-up task.

For interactive components:

- prefer native elements such as `button`, `a`, `input`, and `label`
- use visible focus states
- add ARIA only when native semantics are insufficient
- provide screen-reader labels for icon-only controls
- implement keyboard behavior for custom widgets
- respect reduced-motion preferences when motion is non-essential

If a control behaves like a button, use a button.

## Variant And State Patterns

When a component has multiple visual variants or maps props to ARIA roles, prefer a `Record` lookup over chains of conditionals.

Prefer:

```vue
<script setup lang="ts">
const ROLES: Record<string, 'status' | 'alert'> = {
  warning: 'status',
  error: 'alert',
}

const CLASSES: Record<string, string> = {
  warning: 'border-amber-400/20 bg-amber-500/8',
  error: 'border-red-400/20 bg-red-500/8',
  info: 'border-blue-400/20 bg-blue-500/8',
}
</script>

<template>
  <div :role="ROLES[variant]" :class="CLASSES[variant]">
    <slot />
  </div>
</template>
```

over:

```vue
<template>
  <div
    :role="variant === 'error' ? 'alert' : variant === 'warning' ? 'status' : undefined"
    :class="{
      'border-amber-400/20 bg-amber-500/8': variant === 'warning',
      'border-red-400/20 bg-red-500/8': variant === 'error',
      'border-blue-400/20 bg-blue-500/8': variant === 'info',
    }"
  >
    <slot />
  </div>
</template>
```

The Record approach is easier to extend, test in isolation, and review at a glance.

## Navigation And Routing

Use object syntax with named routes for internal navigation. This keeps links resilient to URL restructuring and enables type safety when `typedPages` is enabled.

Prefer:

```vue
<NuxtLink :to="{ name: 'index' }">Home</NuxtLink>
<NuxtLink :to="{ name: 'search', query: { q: term } }">Search</NuxtLink>
```

over:

```vue
<NuxtLink to="/">Home</NuxtLink>
<NuxtLink :to="`/search?q=${term}`">Search</NuxtLink>
```

String paths are acceptable for external links and simple static paths. For anything route-aware, prefer the named form.

## State Inside Components

Keep local state small and explicit.

Prefer:

- `shallowRef` or `ref` for local state
- `computed` for derived values
- named handlers such as `handleSubmit` or `handleBlur`
- `watch` only for synchronization or side effects

Avoid:

- large mutable reactive objects when a few focused refs are clearer
- anonymous logic-heavy event handlers in the template
- watchers that could be replaced by computed values

## Styling Inside Components

Follow [style-guide.md](./style-guide.md).

In practice that means:

- use utilities first
- use shortcuts for repeated UI roles
- keep color usage token-backed
- use local CSS only when necessary

Component files should not hide ordinary layout and spacing inside large `<style>` blocks.

## Data And Side Effects

Components should not accumulate reusable business logic.

Move logic into a composable when:

- the same behavior may be needed elsewhere
- the script section is growing around state orchestration
- the logic mixes routing, storage, fetch state, or browser APIs

Keep the component responsible for presentation and local interaction, not for becoming a dumping ground.

## When To Split A Component

Split when one of these happens:

- a subsection has its own state and interactions
- the template becomes hard to scan
- a chunk of markup is likely to repeat
- testing would be clearer with smaller units

Do not split only to reduce file length. Split when the responsibilities are genuinely separate.

## Testing Expectations

Component tests should focus on user-visible behavior.

Test:

- rendered text
- roles and accessible names
- important state changes
- emitted events
- interaction behavior that matters to users

Do not over-test implementation details like the exact internal ref names or private computed structure.

## Example Component Template

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  action: []
}>()

const isInteractive = computed(() => !props.disabled)

function handleClick() {
  if (!isInteractive.value) return
  emit('action')
}
</script>

<template>
  <article class="surface-card">
    <h2 class="m-0 text-lg tracking-[-0.02em]">{{ title }}</h2>
    <p v-if="description" class="mt-2 mb-0 text-fg-muted">{{ description }}</p>

    <button
      type="button"
      class="button-primary focus-ring mt-4"
      :disabled="disabled"
      @click="handleClick"
    >
      Continue
    </button>
  </article>
</template>
```

Why this is the preferred pattern:

- props and emits are explicit
- derived state is named
- template logic stays light
- semantics are correct
- styling remains utility-first

## Reference: Organizing A Complex Component By Feature

When a component grows to manage several distinct concerns, organize the script by feature rather than by Vue primitive. Define local composable-style functions inside the component file, each owning one concern, and wire them together at the top.

```vue
<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useNetworkState } from '~/composables/useNetworkState'
import { usePathUtils } from '~/composables/usePathUtils'
import { resetCwdOnLeave, useCwdUtils } from '~/composables/useCwd'
import { isValidMultiName } from '~/utils/folders'

const SHOW_HIDDEN = 'vue-ui.show-hidden-folders'

// ── wire features together at the top ──────────────────────────

const { networkState } = useNetworkState()
const { folders, currentFolderData } = useCurrentFolderData(networkState)
const folderNavigation = useFolderNavigation({ networkState, currentFolderData })
const { favoriteFolders, toggleFavorite } = useFavoriteFolders(currentFolderData)
const { showHiddenFolders } = useHiddenFolders()
const createFolder = useCreateFolder(folderNavigation.openFolder)

resetCwdOnLeave()
const { updateOnCwdChanged } = useCwdUtils()
const { slicePath } = usePathUtils()

// ── feature: current folder data ───────────────────────────────

function useCurrentFolderData(networkState) {
  const folders = ref(null)
  const currentFolderData = useQuery(
    {
      query: FOLDER_CURRENT,
      fetchPolicy: 'network-only',
      networkState,
      async result() {
        await nextTick()
        folders.scrollTop = 0
      },
    },
    {},
  )

  return { folders, currentFolderData }
}

// ── feature: folder navigation ─────────────────────────────────

function useFolderNavigation({ networkState, currentFolderData }) {
  const pathEditing = reactive({
    editingPath: false,
    editedPath: '',
  })
  const pathInput = ref(null)

  async function openPathEdit() {
    pathEditing.editedPath = currentFolderData.path
    pathEditing.editingPath = true
    await nextTick()
    pathInput.value?.focus()
  }

  function submitPathEdit() {
    openFolder(pathEditing.editedPath)
  }

  async function openFolder(path) {
    pathEditing.editingPath = false
    networkState.error = null
    networkState.loading++
    try {
      await mutate({ mutation: FOLDER_OPEN, variables: { path } })
    } catch (e) {
      networkState.error = e
    }
    networkState.loading--
  }

  async function openParentFolder() {
    pathEditing.editingPath = false
    networkState.error = null
    networkState.loading++
    try {
      await mutate({ mutation: FOLDER_OPEN_PARENT })
    } catch (e) {
      networkState.error = e
    }
    networkState.loading--
  }

  function refreshFolder() {
    openFolder(currentFolderData.path)
  }

  return {
    pathInput,
    pathEditing,
    openPathEdit,
    submitPathEdit,
    openFolder,
    openParentFolder,
    refreshFolder,
  }
}

// ── feature: favorite folders ──────────────────────────────────

function useFavoriteFolders(currentFolderData) {
  const favoriteFolders = useQuery(FOLDERS_FAVORITE, [])

  async function toggleFavorite() {
    await mutate({
      mutation: FOLDER_SET_FAVORITE,
      variables: {
        path: currentFolderData.path,
        favorite: !currentFolderData.favorite,
      },
    })
  }

  return { favoriteFolders, toggleFavorite }
}

// ── feature: hidden folders ────────────────────────────────────

function useHiddenFolders() {
  const showHiddenFolders = ref(localStorage.getItem(SHOW_HIDDEN) === 'true')
  watch(showHiddenFolders, value => {
    if (value) {
      localStorage.setItem(SHOW_HIDDEN, 'true')
    } else {
      localStorage.removeItem(SHOW_HIDDEN)
    }
  })

  return { showHiddenFolders }
}

// ── feature: create folder ─────────────────────────────────────

function useCreateFolder(openFolder) {
  const showNewFolder = ref(false)
  const newFolderName = ref('')
  const newFolderValid = computed(() => isValidMultiName(newFolderName.value))

  async function createFolder() {
    if (!newFolderValid.value) return
    const result = await mutate({
      mutation: FOLDER_CREATE,
      variables: { name: newFolderName.value },
    })
    openFolder(result.data.folderCreate.path)
    newFolderName.value = ''
    showNewFolder.value = false
  }

  return { showNewFolder, newFolderName, newFolderValid, createFolder }
}
</script>

<template>
  <!-- template omitted for brevity -->
</template>
```

Why this structure works:

- **The top of the script reads like a table of contents.** You can see every feature the component manages and how they connect without scrolling.
- **Each `use*` function owns one concern.** State, derived values, watchers, and actions for that concern are co-located, not scattered across the file by Vue primitive.
- **Dependencies flow through arguments.** `useFolderNavigation` receives `networkState` and `currentFolderData` explicitly, making data flow visible and testable.
- **Extraction is cheap.** If `useFavoriteFolders` is needed elsewhere later, move it to `composables/` without restructuring — the shape is already correct.
- **Functions stay short.** Each feature function stays well under the 50-line guideline because it only handles one slice of behavior.

When to use this pattern:

- the component manages three or more distinct concerns
- the script block would otherwise exceed 100–150 lines of interleaved state and logic
- features depend on each other and the wiring should be explicit

When not to use it:

- the component is small enough that a flat script is already clear
- the concern is reusable across components — extract to `composables/` directly instead of keeping it inline

## Anti-Patterns

Avoid these:

- business logic buried in template expressions
- generic wrapper components with unclear purpose
- components with too many visual toggle props
- inaccessible custom controls
- large local CSS blocks for simple layout
- components that own reusable orchestration logic that belongs in composables
- functions longer than 50 lines that should be extracted
- deeply nested ternaries for variant logic when a Record lookup is clearer
- hardcoded URL paths for internal navigation when named routes are available
