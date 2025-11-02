<script setup lang="ts">
/**
 * ProductCard component (Products Layer)
 *
 * Displays a single product in a card format using Nuxt UI components
 * Uses shared utilities (formatCurrency) from shared layer
 * Entire card is clickable to navigate to product detail page
 * Emits cart-related events for parent to handle (maintains layer independence)
 */

import { NuxtLink, UCard, UButton, UBadge } from '#components'
import type { Product } from '../schemas/product'
import { formatCurrency } from '#layers/shared/app/utils/currency'

interface Props {
  product: Product
  inCartQuantity?: number  // Quantity in cart (0 or undefined = not in cart)
}

interface Emits {
  (e: 'add-to-cart', product: Product): void
  (e: 'increment', product: Product): void
  (e: 'decrement', product: Product): void
  (e: 'remove', product: Product): void
}

const { product, inCartQuantity = 0 } = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleAction(event: MouseEvent, action: 'add' | 'increment' | 'decrement' | 'remove') {
  // Prevent navigation when clicking action buttons
  event.preventDefault()
  event.stopPropagation()

  switch (action) {
    case 'add':
      emit('add-to-cart', product)
      break
    case 'increment':
      emit('increment', product)
      break
    case 'decrement':
      emit('decrement', product)
      break
    case 'remove':
      emit('remove', product)
      break
  }
}
</script>

<template>
  <NuxtLink
    :to="`/products/${product.id}`"
    class="block cursor-pointer"
  >
    <UCard class="hover:shadow-lg transition-shadow duration-200 h-full">
    <template #header>
      <div class="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <NuxtImg
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <UBadge
          v-if="product.stock === 0"
          label="Out of Stock"
          color="error"
          class="absolute top-2 right-2"
        />
        <UBadge
          v-else-if="inCartQuantity > 0"
          :label="`In Cart: ${inCartQuantity}`"
          color="success"
          icon="i-lucide-shopping-cart"
          class="absolute top-2 right-2"
        />
      </div>
    </template>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
        {{ product.name }}
      </h3>

      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow">
        {{ product.description }}
      </p>

      <div class="flex justify-between items-center">
        <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
          {{ formatCurrency(product.price) }}
        </span>
        <span
          v-if="product.rating"
          class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"
        >
          <span>⭐</span>
          <span>{{ product.rating.toFixed(1) }}</span>
        </span>
      </div>
    </div>

    <template #footer>
      <!-- Not in cart - show Add to Cart button -->
      <UButton
        v-if="inCartQuantity === 0"
        type="button"
        block
        :disabled="product.stock === 0"
        :label="product.stock === 0 ? 'Out of Stock' : 'Add to Cart'"
        icon="i-lucide-shopping-cart"
        color="primary"
        @click="handleAction($event, 'add')"
      />

      <!-- In cart - show quantity controls -->
      <div
        v-else
        class="flex items-center gap-2"
      >
        <div class="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 flex-1">
          <UButton
            type="button"
            icon="i-lucide-minus"
            size="sm"
            square
            variant="ghost"
            color="neutral"
            aria-label="Decrease quantity"
            @click="handleAction($event, 'decrement')"
          />
          <span class="flex-1 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ inCartQuantity }}
          </span>
          <UButton
            type="button"
            icon="i-lucide-plus"
            size="sm"
            square
            variant="ghost"
            color="neutral"
            aria-label="Increase quantity"
            @click="handleAction($event, 'increment')"
          />
        </div>
        <UButton
          type="button"
          icon="i-lucide-trash-2"
          size="sm"
          square
          variant="ghost"
          color="error"
          aria-label="Remove from cart"
          @click="handleAction($event, 'remove')"
        />
      </div>
    </template>
  </UCard>
  </NuxtLink>
</template>
