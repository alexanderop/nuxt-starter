# Cart Layer

**CRITICAL: Auto-imports disabled** - ALL imports (components, composables, utils) must be explicit

Complete shopping cart functionality with add/remove items, quantity management, localStorage persistence, Elm Architecture state management, and Nuxt UI components.

## Directory Structure

```
layers/cart/
├── nuxt.config.ts              # Layer config (auto-imports disabled)
├── claude.md                   # This file
└── app/
    ├── pages/
    │   └── shoppingCart.vue    # Cart page route
    ├── components/
    │   ├── cartItem.vue        # Single cart item row
    │   ├── cartList.vue        # Full cart display
    │   └── cartSummary.vue     # Floating cart button
    ├── stores/cart/
    │   ├── cart.ts             # Pinia store
    │   ├── cartModel.ts        # State + messages
    │   ├── cartUpdate.ts       # Pure reducer
    │   └── cartEffects.ts      # LocalStorage side effects
    ├── schemas/
    │   └── cart.ts             # Zod schemas
    └── utils/
        └── calculations.ts     # Cart math
```

## File Descriptions

### Pages (`app/pages/`)
- **shoppingCart.vue** (48 lines)
  - Cart page at `/shoppingCart` route
  - Imports: `useHead`, `useRouter`, `UMain`, `UContainer`, `UButton`, `CartList`
  - Features: Back button, page title, meta tags, responsive layout

### Components (`app/components/`)
- **cartItem.vue** (95 lines)
  - Single cart item row with product image, name, price, quantity controls
  - Props: `item: CartItem`
  - Emits: `increment`, `decrement`, `remove`
  - Imports: `UCard`, `UButton`, `NuxtImg`, `computed`, utils
  - Mobile-responsive (hides subtotal on mobile, shows below)

- **cartList.vue** (111 lines)
  - Main cart display with items list and order summary sidebar
  - Imports: `UCard`, `UButton`, `UEmpty`, `USeparator`, `useRouter`, `CartItem`, store
  - Features: Empty state, sticky summary, checkout/continue shopping buttons
  - Grid layout: single column mobile, 2-column desktop

- **cartSummary.vue** (35 lines)
  - Fixed floating cart button (bottom-right)
  - Shows: Total price, item count badge
  - Imports: `UButton`, `UBadge`, `useRouter`, store, utils
  - Only visible when cart has items

### Stores (`app/stores/cart/`)
- **cart.ts** (54 lines)
  - Main Pinia store with Elm Architecture
  - Exports: `useCartStore`
  - State (readonly): `items`, `itemCount`, `subtotal`, `tax`, `total`, `isEmpty`, `itemInCart(productId)`
  - Methods: `dispatch(msg: CartMsg)`
  - Side effects: Auto-load from localStorage, auto-save on change (deep watch)

- **cartModel.ts** (23 lines)
  - Type: `CartModel = { items: CartItem[] }`
  - Const: `initialModel`
  - Messages: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `INCREMENT_ITEM`, `DECREMENT_ITEM`, `CLEAR_CART`, `HYDRATE_FROM_STORAGE`

- **cartUpdate.ts** (109 lines)
  - Pure reducer: `update(model: CartModel, msg: CartMsg): CartModel`
  - Helpers: `addItemToCart`, `updateItemQuantity`
  - Logic: Increment existing items, remove when quantity <= 0, exhaustiveness check

- **cartEffects.ts** (28 lines)
  - `loadCartFromStorage(dispatch)` - Validates with Zod, hydrates store
  - `saveCartToStorage(items)` - Persists to localStorage
  - Storage key: `'shopping-cart'`
  - Error handling: Clears corrupted data, logs validation errors

### Schemas (`app/schemas/`)
- **cart.ts** (11 lines)
  - `CartItemSchema` - Validates `{ product: ProductSchema, quantity: int > 0 }`
  - Type: `CartItem` (inferred from schema)
  - Imports: `ProductSchema` from products layer

### Utils (`app/utils/`)
- **calculations.ts** (61 lines)
  - `calculateItemSubtotal(price, quantity)` - price × quantity
  - `calculateSubtotal(items)` - Sum all item subtotals
  - `calculateTax(subtotal)` - 10% of subtotal (rounded)
  - `calculateTotal(subtotal, tax)` - subtotal + tax
  - `calculateItemCount(items)` - Sum all quantities
  - Const: `TAX_RATE = 0.1`

## Usage Examples

### Import Paths (Layer Aliases)
**ALWAYS use `#layers/cart/` prefix for cross-layer imports:**

```typescript
// Components
import CartItem from '#layers/cart/app/components/cartItem.vue'
import CartList from '#layers/cart/app/components/cartList.vue'
import CartSummary from '#layers/cart/app/components/cartSummary.vue'

// Store
import { useCartStore } from '#layers/cart/app/stores/cart/cart'

// Types & Schemas
import { CartItemSchema, type CartItem } from '#layers/cart/app/schemas/cart'
import type { CartModel, CartMsg } from '#layers/cart/app/stores/cart/cartModel'

// Utils
import { calculateSubtotal, calculateTax } from '#layers/cart/app/utils/calculations'
```

### Using Components
```vue
<script setup lang="ts">
import { UMain, UContainer } from '#components'
import CartList from '#layers/cart/app/components/cartList.vue'
import CartSummary from '#layers/cart/app/components/cartSummary.vue'
</script>

<template>
  <UMain>
    <UContainer>
      <CartList />
      <CartSummary />
    </UContainer>
  </UMain>
</template>
```

### Using the Store
```typescript
import { useCartStore } from '#layers/cart/app/stores/cart/cart'
import type { Product } from '#layers/products/app/schemas/product'

const cartStore = useCartStore()

// Add product to cart (auto-increments if exists)
const product: Product = { id: '1', name: 'Widget', price: 1999, ... }
cartStore.dispatch({ type: 'ADD_ITEM', product })

// Increment/decrement quantity
cartStore.dispatch({ type: 'INCREMENT_ITEM', productId: '1' })
cartStore.dispatch({ type: 'DECREMENT_ITEM', productId: '1' })  // Removes if qty = 0

// Update quantity directly
cartStore.dispatch({ type: 'UPDATE_QUANTITY', productId: '1', quantity: 5 })

// Remove item completely
cartStore.dispatch({ type: 'REMOVE_ITEM', productId: '1' })

// Clear entire cart
cartStore.dispatch({ type: 'CLEAR_CART' })

// Access state (all readonly computed)
cartStore.state.items         // CartItem[]
cartStore.state.itemCount     // number (total qty)
cartStore.state.subtotal      // number (cents)
cartStore.state.tax           // number (cents)
cartStore.state.total         // number (cents)
cartStore.state.isEmpty       // boolean
cartStore.state.itemInCart('1')  // CartItem | undefined
```

### Using Cart Components in Product Pages
```vue
<script setup lang="ts">
import { UButton } from '#components'
import { useCartStore } from '#layers/cart/app/stores/cart/cart'
import type { Product } from '#layers/products/app/schemas/product'

const props = defineProps<{ product: Product }>()
const cartStore = useCartStore()

function addToCart() {
  cartStore.dispatch({ type: 'ADD_ITEM', product: props.product })
}

const itemInCart = computed(() =>
  cartStore.state.itemInCart(props.product.id)
)
</script>

<template>
  <div>
    <UButton
      v-if="!itemInCart"
      type="button"
      @click="addToCart"
      label="Add to Cart"
    />
    <div v-else>
      In cart: {{ itemInCart.quantity }}
      <UButton
        type="button"
        @click="cartStore.dispatch({ type: 'INCREMENT_ITEM', productId: product.id })"
        icon="i-lucide-plus"
      />
    </div>
  </div>
</template>
```

### Using Calculations
```typescript
import {
  calculateItemSubtotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateItemCount,
  TAX_RATE
} from '#layers/cart/app/utils/calculations'
import type { CartItem } from '#layers/cart/app/schemas/cart'

const items: CartItem[] = [
  { product: { id: '1', price: 1999, ... }, quantity: 2 },
  { product: { id: '2', price: 2999, ... }, quantity: 1 }
]

const itemSubtotal = calculateItemSubtotal(1999, 2)  // 3998
const subtotal = calculateSubtotal(items)            // 6997
const tax = calculateTax(subtotal)                   // 700 (rounded)
const total = calculateTotal(subtotal, tax)          // 7697
const count = calculateItemCount(items)              // 3
```

### Validating Cart Data
```typescript
import { CartItemSchema } from '#layers/cart/app/schemas/cart'
import { z } from 'zod'

// Validate single item
const result = CartItemSchema.safeParse({
  product: { id: '1', name: 'Widget', price: 1999, ... },
  quantity: 2
})

if (result.success) {
  const validItem = result.data
} else {
  console.error(result.error.issues)
}

// Validate array of items
const cartData = z.array(CartItemSchema).safeParse(items)
```

## Architecture & Design Patterns

### Elm Architecture (Store Pattern)
This layer implements **The Elm Architecture** for predictable, testable state management:

```
┌──────────────────┐
│   View (Vue)     │ ──dispatch(msg)──> ┌────────────┐
│  - Components    │                     │   Store    │
│  - Pages         │ <──state (readonly) │  cart.ts   │
└──────────────────┘                     └─────┬──────┘
                                               │
                    ┌──────────────────────────┼────────────────────┐
                    │                          │                    │
              ┌─────▼──────┐          ┌───────▼────────┐  ┌────────▼────────┐
              │   Model    │          │     Update     │  │    Effects      │
              │ cartModel  │          │  cartUpdate    │  │  cartEffects    │
              └────────────┘          └────────────────┘  └─────────────────┘
              - CartModel             - Pure reducer      - loadFromStorage
              - CartMsg types         - No side effects   - saveToStorage
              - initialModel          - Exhaustive        - Zod validation
                                      - Returns new model
```

**Files:**
- **cart.ts** - Pinia store glue, watchers, computed state
- **cartModel.ts** - State shape + message types (single source of truth)
- **cartUpdate.ts** - Pure reducer function `(model, msg) => newModel`
- **cartEffects.ts** - Side effects (localStorage I/O, validation)

**Benefits:**
- Pure functions (easy to test, no surprises)
- Single source of truth (one model, one update function)
- Type-safe messages (exhaustiveness checking)
- Side effects isolated (localStorage separate from logic)
- Time-travel debugging possible (all state transitions explicit)

### Layer Dependencies & Boundaries

**Dependency Graph:**
```
shared (currency, storage utils)
  ↓
products (Product type, ProductSchema)
  ↓
cart (this layer)
```

**Import Rules:**
- ✅ **CAN import**: `shared`, `products`, Vue, Pinia, Zod, Nuxt UI (`#components`)
- ❌ **CANNOT import**: Main app code, other feature layers
- ✅ **Exports**: Components, store, schemas, utils (via `#layers/cart/`)
- ⚠️ **Auto-imports disabled**: ALL imports must be explicit

**Cross-layer Import Examples:**
```typescript
// From shared layer
import { formatCurrency } from '#layers/shared/app/utils/currency'
import { getValidatedItem, setItem } from '#layers/shared/app/utils/storage'

// From products layer
import type { Product } from '#layers/products/app/schemas/product'
import { ProductSchema } from '#layers/products/app/schemas/product'

// Nuxt UI components (framework-level)
import { UButton, UCard, UBadge } from '#components'
```

### Zod Validation Strategy

**All external data validated:**
- ✅ localStorage reads (`CartItemSchema` array)
- ✅ Product additions to cart (`ProductSchema` via import)
- ✅ Quantity updates (positive integers only)

**Validation points:**
1. **cartEffects.ts:loadCartFromStorage** - Validates localStorage data, logs errors, clears if corrupted
2. **cart.ts (schema)** - CartItemSchema ensures quantity > 0, product valid
3. **cartUpdate.ts** - Business logic (e.g., remove if quantity <= 0)

## Features

### Core Functionality
- ✅ **Add to cart** - Auto-increment if exists, create new item if not
- ✅ **Remove items** - Completely remove item from cart
- ✅ **Increment/decrement** - Adjust quantity, auto-remove at 0
- ✅ **Direct quantity update** - Set exact quantity
- ✅ **Clear cart** - Empty all items
- ✅ **Check if in cart** - Helper to find item by product ID

### Persistence
- ✅ **Auto-save** - Deep watch on items, saves to localStorage on every change
- ✅ **Auto-load** - Hydrates from localStorage on store init
- ✅ **Validation** - Zod validation prevents corrupted data
- ✅ **Error handling** - Logs validation errors, clears bad data

### Calculations (Pure Functions)
- ✅ **Item subtotal** - price × quantity
- ✅ **Cart subtotal** - Sum of all item subtotals
- ✅ **Tax** - 10% of subtotal (rounded to cents)
- ✅ **Total** - Subtotal + tax
- ✅ **Item count** - Sum of all quantities

### UI Components
- ✅ **CartItem** - Single row with image, name, price, qty controls, remove button
- ✅ **CartList** - Full cart display, empty state, order summary, checkout
- ✅ **CartSummary** - Floating button (bottom-right) with total + badge
- ✅ **Responsive** - Mobile-optimized layouts
- ✅ **Dark mode** - Full Nuxt UI theming support
- ✅ **Accessibility** - ARIA labels, semantic HTML

## Configuration

### Tax Rate
Edit `layers/cart/app/utils/calculations.ts`:
```typescript
export const TAX_RATE = 0.1  // Change to 0.08 for 8%, etc.
```

### Storage Key
Edit `layers/cart/app/stores/cart/cartEffects.ts`:
```typescript
const STORAGE_KEY = 'shopping-cart'  // Change key if needed
```

### Auto-imports
Currently disabled in `nuxt.config.ts` for explicit imports. To enable:
```typescript
export default defineNuxtConfig({
  components: { dirs: ['app/components'] },  // Auto-import components
  imports: { autoImport: true }              // Auto-import composables
})
```

## Extending This Layer

### Local Layer (Same Project)
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/shared',    // Required: currency, storage utils
    './layers/products',  // Required: Product type, ProductSchema
    './layers/cart'       // This layer
  ]
})
```

### Published npm Package
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    '@your-org/shared',
    '@your-org/products',
    '@your-org/cart'
  ]
})
```

**IMPORTANT:** Layer order matters! Dependencies must come first.

## Common Tasks for Claude Code

### Adding New Cart Message/Action
1. **Add message type** to `cartModel.ts`:
   ```typescript
   export type CartMsg =
     | { type: 'ADD_ITEM'; product: Product }
     | { type: 'APPLY_COUPON'; code: string }  // New
   ```

2. **Handle in reducer** `cartUpdate.ts`:
   ```typescript
   case 'APPLY_COUPON': {
     return {
       ...model,
       couponCode: msg.code
     }
   }
   ```

3. **Update model shape** if needed in `cartModel.ts`:
   ```typescript
   export interface CartModel {
     items: CartItem[]
     couponCode?: string  // New
   }
   ```

4. **Call from components**:
   ```typescript
   cartStore.dispatch({ type: 'APPLY_COUPON', code: 'SAVE10' })
   ```

### Adding New Calculation
Add to `calculations.ts`:
```typescript
export function calculateDiscount(subtotal: number, couponCode: string): number {
  if (couponCode === 'SAVE10') return Math.round(subtotal * 0.1)
  return 0
}
```

Then use in `cart.ts`:
```typescript
const discount = computed(() => calculateDiscount(subtotal.value, model.value.couponCode))
```

### Adding New Component
1. Create in `app/components/` (e.g., `cartCheckout.vue`)
2. Import explicitly where needed:
   ```typescript
   import CartCheckout from '#layers/cart/app/components/cartCheckout.vue'
   ```
3. Use Nuxt UI components from `#components`
4. Access store via `useCartStore()`

### Modifying Schema
Edit `schemas/cart.ts`:
```typescript
export const CartItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int().positive(),
  notes: z.string().optional(),  // New field
})
```

**CRITICAL:** Schema changes break localStorage! Clear it manually:
```typescript
localStorage.removeItem('shopping-cart')
```

### Testing Store Logic
Pure functions = easy to test:
```typescript
import { update } from './cartUpdate'
import { initialModel } from './cartModel'

const model = update(initialModel, {
  type: 'ADD_ITEM',
  product: mockProduct
})

expect(model.items).toHaveLength(1)
expect(model.items[0].quantity).toBe(1)
```

## Troubleshooting

### Cart not persisting
- Check browser localStorage: `shopping-cart` key
- Check console for Zod validation errors
- Verify `cartEffects.ts` is calling `saveCartToStorage`
- Check Vue watcher in `cart.ts` is triggering

### Type errors on import
- Ensure using `#layers/cart/` prefix
- Check `nuxt.config.ts` extends cart layer
- Verify TypeScript includes layer in `tsconfig.json`
- Restart TypeScript server

### Component not found
- Auto-imports disabled - must import explicitly
- Use full path: `#layers/cart/app/components/cartItem.vue`
- Check component export (`export default` or `<script setup>`)

### State not updating
- Ensure dispatching correct message type
- Check `cartUpdate.ts` handles the message
- Verify returning new object (immutability)
- Use Vue DevTools to inspect Pinia store

### Calculations wrong
- All prices in **cents** (not dollars)
- Tax rounded to nearest cent (`Math.round`)
- Check `TAX_RATE` constant in `calculations.ts`
- Verify reduce initial value is 0

## Related Documentation

- Main project docs: `/CLAUDE.md`, `/ARCHITECTURE.md`
- Products layer: `/layers/products/claude.md`
- Shared layer: `/layers/shared/claude.md`
- Nuxt Layers: https://nuxt.com/docs/guide/going-further/layers
- Pinia: https://pinia.vuejs.org
- Zod: https://zod.dev
- Elm Architecture: https://guide.elm-lang.org/architecture/
