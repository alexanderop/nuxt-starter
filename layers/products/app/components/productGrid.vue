<script setup lang="ts">
/**
 * ProductGrid component (Products Layer)
 *
 * Displays a grid of product cards using Nuxt UI components
 * Demonstrates composition of ProductCard components
 * Passes cart quantity and events through to child ProductCard components
 */

import { UEmpty, UIcon } from '#components'
import type { Product } from '../schemas/product'
import ProductCard from './productCard.vue'

interface Props {
  products: Product[]
  loading?: boolean
  getCartQuantity?: ((productId: string) => number) | undefined  // Function to get quantity in cart
}

interface Emits {
  (e: 'add-to-cart', product: Product): void
  (e: 'increment', product: Product): void
  (e: 'decrement', product: Product): void
  (e: 'remove', product: Product): void
}

const { products, loading = false, getCartQuantity } = defineProps<Props>()

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="w-full">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-16 text-gray-600 dark:text-gray-400"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="w-10 h-10 animate-spin mb-4"
      />
      <p>Loading products...</p>
    </div>

    <UEmpty
      v-else-if="products.length === 0"
      icon="i-lucide-package-x"
      title="No products found"
      description="Try adjusting your filters to see more results"
      class="py-16"
    />

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    >
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :in-cart-quantity="getCartQuantity ? getCartQuantity(product.id) : 0"
        @add-to-cart="emit('add-to-cart', $event)"
        @increment="emit('increment', $event)"
        @decrement="emit('decrement', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>
