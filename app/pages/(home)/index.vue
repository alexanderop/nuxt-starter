<script setup lang="ts">
/**
 * Home page
 *
 * Demonstrates feature composition:
 * - Products feature: ProductGrid and ProductFilters
 * - Cart feature: CartSummary
 * - Both features work together without direct dependencies
 */

import { onMounted } from 'vue'
import { useHead } from '#app'
import { UMain, UContainer } from '#components'
import type { Product } from '~/types/product'
import { useCartStore } from '~/features/cart/stores/cart/cart'
import { useProductsStore } from '~/features/products/stores/products/products'
import CartSummary from '~/features/cart/components/cartSummary.vue'
import ProductFilters from '~/features/products/components/productFilters.vue'
import ProductGrid from '~/features/products/components/productGrid.vue'

useHead({
  meta: [
    {
      content: 'Modern e-commerce shop with dark mode support',
      name: 'description',
    },
  ],
  title: 'Modern Shop',
})

const productsStore = useProductsStore()
const cartStore = useCartStore()

// Fetch products on mount
onMounted(async () => {
  await productsStore.fetchProducts()
})

function handleAddToCart(product: Product) {
  cartStore.dispatch({ type: 'ADD_ITEM', product })
}
</script>

<template>
  <UMain>
    <UContainer class="py-6 sm:py-8">
      <!-- Header -->
      <header class="text-center mb-8 sm:mb-10">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Product Catalog
        </h1>
        <p class="text-base text-gray-600 dark:text-gray-400">
          Discover our collection of amazing products
        </p>
      </header>

      <!-- Main content -->
      <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <!-- Filters sidebar -->
        <aside class="lg:sticky lg:top-24">
          <ProductFilters
            :filter="productsStore.state.currentFilter"
            :sort="productsStore.state.currentSort"
            :categories="productsStore.state.categories"
            @update:filter="productsStore.setFilter"
            @update:sort="productsStore.setSort"
            @reset="productsStore.resetFilter"
          />
        </aside>

        <!-- Products grid -->
        <main class="min-w-0">
          <ProductGrid
            :products="productsStore.state.filteredProducts"
            :loading="productsStore.state.loading"
            @add-to-cart="handleAddToCart"
          />
        </main>
      </div>

      <!-- Floating cart summary -->
      <CartSummary />
    </UContainer>
  </UMain>
</template>
