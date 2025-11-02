<script setup lang="ts">
/**
 * Home page
 *
 * Demonstrates layer composition:
 * - Products layer: ProductGrid and ProductFilters
 * - Cart layer: CartSummary
 * - Both layers work together without direct dependencies
 */

import { useHead, useAsyncData } from '#app'
import { UMain, UContainer } from '#components'
import type { Product } from '#layers/products/app/schemas/product'
import { useCartStore } from '#layers/cart/app/stores/cart/cart'
import { useProductsStore } from '#layers/products/app/stores/products/products'
import CartSummary from '#layers/cart/app/components/cartSummary.vue'
import ProductFilters from '#layers/products/app/components/productFilters.vue'
import ProductGrid from '#layers/products/app/components/productGrid.vue'

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

// Fetch products with useAsyncData for SSR
await useAsyncData('products', () => productsStore.fetchProducts())

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
            :categories="(productsStore.state.categories as any)"
            @update:filter="productsStore.setFilter"
            @update:sort="productsStore.setSort"
            @reset="productsStore.resetFilter"
          />
        </aside>

        <!-- Products grid -->
        <main class="min-w-0">
          <ProductGrid
            :products="(productsStore.state.filteredProducts as any)"
            :loading="productsStore.state.loading"
            :in-cart-checker="(productId) => !!cartStore.state.itemInCart(productId)"
            @add-to-cart="handleAddToCart"
          />
        </main>
      </div>

      <!-- Floating cart summary -->
      <CartSummary />
    </UContainer>
  </UMain>
</template>
