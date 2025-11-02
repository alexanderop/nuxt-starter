# Products Layer

This layer provides complete product catalog functionality including listing, filtering, sorting, and detail views.

## Contents

### Pages (`app/pages/`)
- **(home)/index.vue** - Home page with product catalog, filters, and cart summary (uses both products and cart layers)
- **products/[id].vue** - Product detail page with image gallery and product info components

### Components (`app/components/`)
- **productCard.vue** - Individual product card with image, details, and add-to-cart button
- **productGrid.vue** - Responsive grid layout for product cards with loading and empty states
- **productFilters.vue** - Filter UI for search, category, sort, and stock filtering
- **productDetailImage.vue** - Product image display for detail page (40% width on desktop)
- **productDetailInfo.vue** - Product information panel with price, description, stock, rating (60% width on desktop)

### Stores (`app/stores/products/`)
- **products.ts** - Main Pinia store with Elm Architecture pattern (dispatch method, readonly state)
- **productsModel.ts** - State shape, ProductsMsg union types, and initial state
- **productsUpdate.ts** - Pure reducer function for state transitions
- **productsEffects.ts** - Side effects (async product fetching with mock delay)

### Schemas (`app/schemas/`)
- **product.ts** - Product and ProductCategory schemas with Zod validation
  - Validates IDs, names, descriptions, prices (in cents), images (URLs), stock (non-negative), ratings (0-5)
- **filters.ts** - ProductFilter and ProductSort schemas
  - Validates search queries, categories, price ranges (min < max), ratings, stock filters

### Utils (`app/utils/`)
- **filters.ts** - Pure functions for filtering and sorting products by search, category, price range, rating, stock

## Usage

### Importing Components
```vue
<script setup lang="ts">
import ProductGrid from '#layers/products/app/components/productGrid.vue'
import ProductFilters from '#layers/products/app/components/productFilters.vue'
import type { Product } from '#layers/products/app/schemas/product'
</script>

<template>
  <div>
    <ProductFilters />
    <ProductGrid :products="products" @add-to-cart="handleAddToCart" />
  </div>
</template>
```

### Using the Store
```typescript
import { useProductsStore } from '#layers/products/app/stores/products/products'

const productsStore = useProductsStore()

// Fetch products (triggers side effect)
await productsStore.fetchProducts()

// Access computed state (readonly)
const products = productsStore.state.filteredProducts
const loading = productsStore.state.loading
const categories = productsStore.state.categories
const product = productsStore.state.productById('product-1')

// Dispatch messages to update state
productsStore.dispatch({ type: 'SET_FILTER', filter: { category: 'electronics', inStock: true } })
productsStore.dispatch({ type: 'SET_SORT', sort: 'price-asc' })
productsStore.dispatch({ type: 'RESET_FILTER' })

// Or use convenience methods
productsStore.setFilter({ category: 'electronics', inStock: true })
productsStore.setSort('price-asc')
productsStore.resetFilter()
```

## Architecture

This layer follows **The Elm Architecture** pattern for predictable state management:

### Elm Architecture Pattern
- **Model** (`productsModel.ts`): Defines immutable state shape, message types, and initial state
- **Update** (`productsUpdate.ts`): Pure reducer function `(model, msg) => newModel` for all state transitions
- **Effects** (`productsEffects.ts`): Isolated side effects (async API calls, mock data with 500ms delay)
- **Store** (`products.ts`): Pinia integration exposing:
  - `dispatch(msg)` - processes messages through the update function
  - `state` - computed readonly state with derived values (filteredProducts, categories, productById)
  - Convenience methods that wrap dispatch (setFilter, setSort, resetFilter, fetchProducts)

### Store State Flow
1. Component calls `productsStore.dispatch(msg)` or convenience method
2. Message flows to `update(currentModel, msg)` pure function
3. Update returns new immutable model
4. Pinia reactively updates all computed state
5. Components re-render with new data

### Layer Dependencies
- ✅ Extends from: `shared` layer (uses formatCurrency utility from `#layers/shared/app/utils/currency.ts`)
- ✅ Can import from: Vue, Pinia, Zod, Nuxt UI components, vue-router
- ❌ Cannot import from: `cart` layer or main app (maintains unidirectional dependency flow)

## Features

- **Product Catalog**: Display products with images, descriptions, prices, ratings
- **Filtering**: Search, category, price range, rating, stock availability
- **Sorting**: Name (A-Z, Z-A), Price (low-high, high-low), Rating (high-low)
- **Validation**: Runtime validation with Zod for data integrity
- **State Management**: Predictable state updates with Elm Architecture
- **Loading States**: Loading indicators and empty states
- **Mock Data**: 12 sample products across 5 categories

## Mock Data Categories

- Electronics (headphones, smartwatch, laptop backpack)
- Clothing (t-shirt, denim jacket)
- Books (design, JavaScript)
- Home (desk lamp, coffee maker)
- Sports (running shoes, water bottle, yoga mat)

## Component Details

### ProductDetailImage
- Displays product image with responsive sizing
- Rounded corners and shadow styling
- Maintains aspect ratio with object-fit
- 40% width on desktop layouts (lg:grid-cols-[40%_60%])

### ProductDetailInfo
- Shows product name, category badge, price, rating
- Stock indicator with color-coded status
- Add-to-cart button with "in cart" state
- Full product description
- 60% width on desktop with contrasting background

### ProductCard
- Compact card layout for grid display
- Image with hover effects
- Stock badge overlay
- Price and rating display
- Quick add-to-cart button
- Click to navigate to product detail page

## SSR Considerations

Both pages use `useAsyncData` for SSR-friendly data fetching:

```typescript
// Fetch during SSR and hydration
await useAsyncData('products', () => productsStore.fetchProducts())
```

This ensures:
- Products are available on first render
- No loading flicker on page load
- SEO-friendly content delivery

## Extending This Layer

To use this layer in another project:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/shared',    // Required dependency
    './layers/products'
  ]
})
```

Or publish as npm package:

```ts
export default defineNuxtConfig({
  extends: [
    '@your-org/shared',
    '@your-org/products'
  ]
})
```

## Implementation Notes

- **No Auto-Imports**: All imports are explicit per project standards
- **Layer Aliases**: Use `#layers/products/...` for cross-layer imports
- **Zod Validation**: All external data validated at boundaries
- **Pure Reducers**: Update function has no side effects, always returns new objects
- **Computed State**: Filtering and sorting happen in computed properties for reactivity
- **Message Dispatch**: Follows Elm pattern - components dispatch messages, never mutate state directly
