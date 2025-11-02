<script setup lang="ts">
/**
 * ProductGrid component (Products Layer)
 *
 * Displays a grid of product cards using Nuxt UI components
 * Demonstrates composition of ProductCard components
 */

import { UEmpty, UIcon } from '#components'
import type { Product } from '../schemas/product'
import ProductCard from './productCard.vue'

interface Props {
  products: Product[]
  loading?: boolean
}

type Emits = (eventName: 'add-to-cart', product: Product) => void

const { products, loading = false } = defineProps<Props>()

const emit = defineEmits<Emits>()

function handleAddToCart(product: Product) {
  emit('add-to-cart', product)
}
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
        @add-to-cart="handleAddToCart"
      />
    </div>
  </div>
</template>
