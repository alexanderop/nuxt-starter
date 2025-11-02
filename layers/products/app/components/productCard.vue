<script setup lang="ts">
/**
 * ProductCard component (Products Layer)
 *
 * Displays a single product in a card format using Nuxt UI components
 * Uses shared utilities (formatCurrency) from shared layer
 * Entire card is clickable to navigate to product detail page
 */

import { NuxtLink, UCard, UButton, UBadge } from '#components'
import type { Product } from '../schemas/product'
import { formatCurrency } from '#layers/shared/app/utils/currency'

interface Props {
  product: Product
}

type Emits = (e: 'add-to-cart', product: Product) => void

const { product } = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleAddToCart(event: MouseEvent) {
  // Prevent navigation when clicking "Add to Cart" button
  event.preventDefault()
  event.stopPropagation()
  emit('add-to-cart', product)
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
      <UButton
        type="button"
        block
        :disabled="product.stock === 0"
        :label="product.stock === 0 ? 'Out of Stock' : 'Add to Cart'"
        icon="i-lucide-shopping-cart"
        @click="handleAddToCart"
      />
    </template>
  </UCard>
  </NuxtLink>
</template>
