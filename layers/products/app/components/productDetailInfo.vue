<script setup lang="ts">
/**
 * Product Detail Info Component
 *
 * Displays all product information including:
 * - Category badge
 * - Title, rating, description
 * - Price and stock status
 * - Add to cart functionality with quantity controls
 * - Cart status message
 */

import { UButton, UBadge, UCard } from '#components'
import type { Product } from '#layers/products/app/schemas/product'
import { formatCurrency } from '#layers/shared/app/utils/currency'

interface Props {
  product: Product
  inCartQuantity?: number
  class?: string
}

interface Emits {
  (e: 'add-to-cart'): void
  (e: 'increment'): void
  (e: 'decrement'): void
  (e: 'remove'): void
}

const { product, inCartQuantity = 0, class: className = '' } = defineProps<Props>()

const emit = defineEmits<Emits>()
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

    <!-- Not in cart - show Add to Cart button -->
    <UButton
      v-if="inCartQuantity === 0"
      type="button"
      block
      size="lg"
      :disabled="product.stock === 0"
      :label="product.stock === 0 ? 'Out of Stock' : 'Add to Cart'"
      icon="i-lucide-shopping-cart"
      @click="emit('add-to-cart')"
    />

    <!-- In cart - show quantity controls -->
    <div
      v-else
      class="space-y-4"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg p-2 flex-1">
          <UButton
            type="button"
            icon="i-lucide-minus"
            size="md"
            square
            variant="ghost"
            color="neutral"
            aria-label="Decrease quantity"
            @click="emit('decrement')"
          />
          <span class="flex-1 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
            {{ inCartQuantity }}
          </span>
          <UButton
            type="button"
            icon="i-lucide-plus"
            size="md"
            square
            variant="ghost"
            color="neutral"
            aria-label="Increase quantity"
            @click="emit('increment')"
          />
        </div>
        <UButton
          type="button"
          icon="i-lucide-trash-2"
          size="lg"
          square
          variant="ghost"
          color="error"
          aria-label="Remove from cart"
          @click="emit('remove')"
        />
      </div>

      <UCard class="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <div class="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
          <span class="text-lg">✓</span>
          <span>{{ inCartQuantity }} {{ inCartQuantity === 1 ? 'item' : 'items' }} in your cart</span>
        </div>
      </UCard>
    </div>
  </div>
</template>
