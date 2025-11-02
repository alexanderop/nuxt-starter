<script setup lang="ts">
/**
 * Product Detail Info Component
 *
 * Displays all product information including:
 * - Category badge
 * - Title, rating, description
 * - Price and stock status
 * - Add to cart functionality
 * - Cart confirmation message
 */

import { computed } from 'vue'
import { UButton, UBadge, UCard } from '#components'
import type { Product } from '#layers/products/app/schemas/product'
import { formatCurrency } from '#layers/shared/app/utils/currency'

interface Props {
  product: Product
  inCart: boolean
  class?: string
}

const { product, inCart, class: className = '' } = defineProps<Props>()

const emit = defineEmits<{
  addToCart: []
}>()

const addToCartLabel = computed(() => {
  if (product.stock === 0) {
    return 'Out of Stock'
  }
  return inCart ? 'Add Another to Cart' : 'Add to Cart'
})
</script>

<template>
  <div :class="['flex flex-col gap-4', className]">
    <UBadge
      :label="product.category.charAt(0).toUpperCase() + product.category.slice(1)"
      color="primary"
      variant="subtle"
      size="md"
      class="w-fit"
    />

    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
      {{ product.name }}
    </h1>

    <div
      v-if="product.rating"
      class="flex items-center gap-2 text-gray-600 dark:text-gray-400"
    >
      <span class="text-lg">⭐</span>
      <span class="text-base font-medium">{{ product.rating.toFixed(1) }} / 5.0</span>
    </div>

    <p class="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
      {{ product.description }}
    </p>

    <div class="text-4xl font-extrabold text-gray-900 dark:text-gray-100 my-2">
      {{ formatCurrency(product.price) }}
    </div>

    <div class="flex items-center gap-2">
      <UBadge
        v-if="product.stock > 0"
        :label="`${product.stock} in stock`"
        color="success"
        variant="subtle"
        icon="i-lucide-check"
      />
      <UBadge
        v-else
        label="Out of stock"
        color="error"
        variant="subtle"
        icon="i-lucide-x"
      />
    </div>

    <UButton
      type="button"
      block
      size="lg"
      :disabled="product.stock === 0"
      :label="addToCartLabel"
      icon="i-lucide-shopping-cart"
      @click="emit('addToCart')"
    />

    <UCard
      v-if="inCart"
      class="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
    >
      <div class="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
        <span class="text-lg">✓</span>
        <span>This item is in your cart</span>
      </div>
    </UCard>
  </div>
</template>
