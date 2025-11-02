# Spec: Cross-Layer Cart State Display

**Status:** Not Implemented
**Priority:** Medium
**Complexity:** Low (~15 lines of code)
**Estimated Time:** 15-30 minutes

## Problem Statement

Product components in the products layer need to show when an item is already in the cart, but they cannot import from the cart layer due to architectural boundaries.

**Current State:**
- `productDetailInfo.vue` already implements this pattern correctly (receives `inCart` prop)
- `productCard.vue` does NOT show cart state (inconsistent UX)
- `productGrid.vue` doesn't pass cart state through
- Home page doesn't compute/pass cart state to grid

**Architectural Constraint:**
```
shared ← products ← cart ← app
```
Products layer cannot import from cart layer (violates unidirectional flow).

## Solution: Props Down, Events Up Pattern

### Pattern Overview

```
App Layer (orchestrator)
  ├─ Imports both products & cart stores
  ├─ Computes: (productId) => !!cartStore.state.itemInCart(productId)
  ├─ Passes down: inCartChecker function prop
  └─ Handles events: @add-to-cart → cartStore.dispatch()
                ↓
ProductGrid (products layer)
  ├─ Receives: inCartChecker function
  └─ For each product: calls inCartChecker(product.id)
                ↓
ProductCard (products layer)
  ├─ Receives: inCart boolean prop
  ├─ Renders: "In Cart" badge + "Add Another" button
  └─ Emits: add-to-cart event (no cart knowledge)
```

### Why This Pattern?

✅ **Preserves layer boundaries** - Products never imports cart
✅ **Type safe** - Function prop fully typed
✅ **Testable** - Products tests don't need cart store mock
✅ **Reusable** - Products works with ANY checker (wishlist, purchases, etc.)
✅ **Consistent** - Matches existing `productDetailInfo.vue` implementation
✅ **Scalable** - Same pattern for all cross-layer state checks

## Implementation Tasks

### Task 1: Update ProductCard Component

**File:** `layers/products/app/components/productCard.vue`

#### 1.1 Update Props Interface

**Location:** Lines 14-16

**Current:**
```typescript
interface Props {
  product: Product
}
```

**Change to:**
```typescript
interface Props {
  product: Product
  inCart?: boolean  // NEW: indicates if product is in cart
}

const { product, inCart = false } = defineProps<Props>()
```

#### 1.2 Add "In Cart" Badge to Image

**Location:** After line 32 (after "Out of Stock" badge)

**Add:**
```vue
<UBadge
  v-else-if="inCart"
  label="In Cart"
  color="success"
  icon="i-lucide-check"
  class="absolute top-2 right-2"
/>
```

**Visual hierarchy:**
- If out of stock → Show "Out of Stock" badge (red)
- Else if in cart → Show "In Cart" badge (green)
- Else → No badge

#### 1.3 Update Add to Cart Button

**Location:** Lines 78-84 (footer template)

**Current:**
```vue
<UButton
  type="button"
  block
  :disabled="product.stock === 0"
  :label="product.stock === 0 ? 'Out of Stock' : 'Add to Cart'"
  icon="i-lucide-shopping-cart"
  @click="handleAddToCart"
/>
```

**Change to:**
```vue
<UButton
  type="button"
  block
  :disabled="product.stock === 0"
  :label="product.stock === 0 ? 'Out of Stock' : inCart ? 'Add Another' : 'Add to Cart'"
  :icon="inCart ? 'i-lucide-check' : 'i-lucide-shopping-cart'"
  :color="inCart ? 'success' : 'primary'"
  @click="handleAddToCart"
/>
```

**Button states:**
| Condition | Label | Icon | Color |
|-----------|-------|------|-------|
| Out of stock | "Out of Stock" | shopping-cart | primary (disabled) |
| In cart | "Add Another" | check | success (green) |
| Normal | "Add to Cart" | shopping-cart | primary (blue) |

---

### Task 2: Update ProductGrid Component

**File:** `layers/products/app/components/productGrid.vue`

#### 2.1 Update Props Interface

**Location:** Lines 13-16

**Current:**
```typescript
interface Props {
  products: Product[]
  loading?: boolean
}
```

**Change to:**
```typescript
interface Props {
  products: Product[]
  loading?: boolean
  inCartChecker?: (productId: string) => boolean  // NEW: function to check cart state
}

const { products, loading = false, inCartChecker } = defineProps<Props>()
```

**Why function prop?**
- ✅ Avoids passing entire cart state (performance)
- ✅ Products layer doesn't know HOW to check cart (separation of concerns)
- ✅ Reusable for other checkers (wishlist, purchases, etc.)

#### 2.2 Pass inCart Prop to ProductCard

**Location:** Lines 54-59

**Current:**
```vue
<ProductCard
  v-for="product in products"
  :key="product.id"
  :product="product"
  @add-to-cart="handleAddToCart"
/>
```

**Change to:**
```vue
<ProductCard
  v-for="product in products"
  :key="product.id"
  :product="product"
  :in-cart="inCartChecker ? inCartChecker(product.id) : false"
  @add-to-cart="handleAddToCart"
/>
```

**Logic:**
- If `inCartChecker` prop exists → Call it for each product
- Else → Default to `false` (backwards compatible)

---

### Task 3: Update Home Page

**File:** `layers/products/app/pages/(home)/index.vue`

#### 3.1 Pass inCartChecker to ProductGrid

**Location:** Lines 70-75

**Current:**
```vue
<ProductGrid
  :products="(productsStore.state.filteredProducts as any)"
  :loading="productsStore.state.loading"
  @add-to-cart="handleAddToCart"
/>
```

**Change to:**
```vue
<ProductGrid
  :products="(productsStore.state.filteredProducts as any)"
  :loading="productsStore.state.loading"
  :in-cart-checker="(productId) => !!cartStore.state.itemInCart(productId)"
  @add-to-cart="handleAddToCart"
/>
```

**How it works:**
1. Arrow function: `(productId) => ...`
2. Calls cart store: `cartStore.state.itemInCart(productId)`
3. Returns: `CartItem | undefined`
4. Converts to boolean: `!!` (double negation)
5. Result: `true` if in cart, `false` if not

**Note:** No new imports needed - `cartStore` already imported at line 20.

---

## Testing Checklist

### Unit Tests (Products Layer)

Test `ProductCard` without any cart dependencies:

```typescript
// layers/products/app/components/__tests__/productCard.test.ts

describe('ProductCard - Cart State', () => {
  it('shows "Add to Cart" when not in cart', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        inCart: false
      }
    })
    expect(wrapper.find('button').text()).toContain('Add to Cart')
    expect(wrapper.find('.i-lucide-shopping-cart')).toExist()
  })

  it('shows "Add Another" with check icon when in cart', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        inCart: true
      }
    })
    expect(wrapper.find('button').text()).toContain('Add Another')
    expect(wrapper.find('.i-lucide-check')).toExist()
  })

  it('shows "In Cart" badge when in cart', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        inCart: true
      }
    })
    expect(wrapper.text()).toContain('In Cart')
  })

  it('works without inCart prop (backwards compatible)', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })
    expect(wrapper.find('button').text()).toContain('Add to Cart')
  })
})
```

### Integration Tests (App Layer)

Test the full flow with cart store:

```typescript
// app/pages/__tests__/index.test.ts

describe('Home Page - Cart Integration', () => {
  it('shows in-cart state for products in cart', async () => {
    const cartStore = useCartStore()
    const product = mockProducts[0]

    // Add product to cart
    cartStore.dispatch({
      type: 'ADD_ITEM',
      product,
      quantity: 1
    })

    const wrapper = mount(HomePage)
    const productCards = wrapper.findAllComponents(ProductCard)

    // Find card for product in cart
    const cardInCart = productCards.find(
      card => card.props('product').id === product.id
    )

    expect(cardInCart.props('inCart')).toBe(true)
    expect(cardInCart.text()).toContain('Add Another')
  })

  it('shows normal state for products not in cart', async () => {
    const wrapper = mount(HomePage)
    const productCards = wrapper.findAllComponents(ProductCard)

    // Cart is empty, all cards should show "Add to Cart"
    productCards.forEach(card => {
      expect(card.props('inCart')).toBe(false)
      expect(card.text()).toContain('Add to Cart')
    })
  })
})
```

### Manual Testing

1. **Initial State:**
   - [ ] All product cards show "Add to Cart" button (blue)
   - [ ] No "In Cart" badges visible

2. **Add Product:**
   - [ ] Click "Add to Cart" on any product card
   - [ ] Card immediately shows "In Cart" badge (green)
   - [ ] Button changes to "Add Another" with checkmark icon
   - [ ] Button color changes to green/success

3. **Add Another:**
   - [ ] Click "Add Another" on product already in cart
   - [ ] Cart quantity increments
   - [ ] UI state remains consistent (still shows "In Cart")

4. **Remove Product:**
   - [ ] Remove product from cart (via cart page)
   - [ ] Navigate back to home page
   - [ ] Product card shows "Add to Cart" again (blue)
   - [ ] "In Cart" badge removed

5. **Filter Products:**
   - [ ] Apply filters (category, price, etc.)
   - [ ] Cart state persists on filtered products
   - [ ] Products in cart still show "In Cart" badge

6. **Refresh Page:**
   - [ ] Add products to cart
   - [ ] Refresh browser
   - [ ] Cart state restored from localStorage
   - [ ] "In Cart" badges appear correctly

---

## Architecture Validation

### ✅ Layer Boundaries Maintained

```
shared ← products ← cart ← app
```

| Layer | Imports | Knowledge |
|-------|---------|-----------|
| **products** | shared only | Product schema, boolean props |
| **cart** | products schemas, shared | Cart logic, itemInCart() method |
| **app** | products, cart, shared | Orchestrates both stores |

**No violations:**
- Products NEVER imports cart ✅
- Products receives plain boolean/function props ✅
- App orchestrates cross-layer communication ✅

### ✅ ESLint Rules Pass

The following ESLint boundary rules will still pass:

```javascript
// eslint.config.mjs:160-196
'import/no-restricted-paths': ['error', {
  zones: [
    // Products cannot import from cart ✅
    {
      target: './layers/products/**/*',
      from: './layers/cart/**/*',
    },
    // ... other rules
  ]
}]
```

**Why?** Products layer changes only add:
- Props (no imports)
- Template logic (no imports)
- Function calls on props (no imports)

### ✅ Type Safety

All props are fully typed:

```typescript
// ProductGrid receives typed function
inCartChecker?: (productId: string) => boolean

// ProductCard receives typed boolean
inCart?: boolean

// App passes typed implementation
(productId: string) => !!cartStore.state.itemInCart(productId)
//        ^^^^^^                                     ^^^^^^
//        string                                     CartItem | undefined
```

TypeScript will catch:
- Wrong function signature
- Missing return type
- Undefined cart store access

---

## Rollout Plan

### Phase 1: Implementation (15-30 minutes)
1. Update `ProductCard` component (Task 1)
2. Update `ProductGrid` component (Task 2)
3. Update home page (Task 3)

### Phase 2: Testing (15 minutes)
1. Run unit tests: `pnpm test:unit`
2. Run linting: `pnpm lint`
3. Manual testing checklist (see above)

### Phase 3: Verification (5 minutes)
1. Build succeeds: `pnpm build`
2. Type check passes: `pnpm typecheck`
3. No console errors in dev: `pnpm dev`

### Phase 4: Documentation (10 minutes)
1. Update `layers/products/CLAUDE.md` with `inCart` prop docs
2. Update `ARCHITECTURE.md` with cross-layer pattern example
3. Consider adding to slash commands (optional)

**Total estimated time:** 45-60 minutes

---

## Future Enhancements

### Optional Improvements (Not Required)

1. **Wishlist Pattern:**
   ```typescript
   // Same pattern for wishlist
   :in-wishlist-checker="(id) => !!wishlistStore.hasItem(id)"
   ```

2. **Multi-State Display:**
   ```typescript
   interface Props {
     product: Product
     state?: {
       inCart?: boolean
       inWishlist?: boolean
       isPurchased?: boolean
     }
   }
   ```

3. **Quantity Display:**
   ```vue
   <UBadge
     v-if="cartQuantity > 0"
     :label="`${cartQuantity} in cart`"
   />
   ```

4. **Composable Pattern (Advanced):**
   ```typescript
   // layers/shared/app/composables/useItemChecker.ts
   export type ItemChecker = (itemId: string) => boolean
   ```

---

## References

- **Existing Implementation:** `layers/products/app/components/productDetailInfo.vue` (lines 85-93)
- **Cart Store API:** `layers/cart/app/stores/cart/cart.ts` (itemInCart method)
- **Architecture Doc:** `ARCHITECTURE.md` (Layer Communication Patterns)
- **ESLint Rules:** `eslint.config.mjs:152-198` (boundary enforcement)

---

## Success Criteria

**Implementation is complete when:**

- [ ] ProductCard shows "In Cart" badge when product is in cart
- [ ] ProductCard button shows "Add Another" when product is in cart
- [ ] Button color changes to green/success when in cart
- [ ] ProductGrid accepts and uses `inCartChecker` function prop
- [ ] Home page passes cart checker to ProductGrid
- [ ] All tests pass (`pnpm test:unit`)
- [ ] All linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Manual testing checklist complete
- [ ] No layer boundary violations (products doesn't import cart)
- [ ] Pattern is consistent across all product displays

---

## Questions / Considerations

### Q: Why function prop instead of passing cart items array?

**A:** Performance and separation of concerns.

```typescript
// ❌ Bad: Products layer has to search array
cartItems: CartItem[]  // Grid filters for each product = O(n²)

// ✅ Good: App layer provides optimized checker
inCartChecker: (id) => boolean  // Cart store has O(1) lookup
```

### Q: Why not use provide/inject?

**A:** Breaks layer boundaries.

```typescript
// ❌ Violates architecture
// Products layer would depend on cart providing state
const cartItems = inject('cartItems')
```

### Q: Why not move button to cart layer?

**A:** Products layer can't import from cart layer (violates dependency flow).

### Q: What if we add more features (wishlist, purchases)?

**A:** Same pattern scales perfectly:

```vue
<ProductGrid
  :in-cart-checker="(id) => !!cartStore.itemInCart(id)"
  :in-wishlist-checker="(id) => !!wishlistStore.hasItem(id)"
  :is-purchased-checker="(id) => !!ordersStore.isPurchased(id)"
/>
```

---

**End of Spec**
