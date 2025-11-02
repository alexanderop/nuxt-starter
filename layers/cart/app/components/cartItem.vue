<script setup lang="ts">
import { computed } from 'vue'
import { UCard, UButton } from '#components'
import type { CartItem } from '../schemas/cart'
import { formatCurrency } from '#layers/shared/app/utils/currency'
import { calculateItemSubtotal } from '../utils/calculations'

interface Props {
  item: CartItem
}

interface Emits {
  (e: 'increment'): void
  (e: 'decrement'): void
  (e: 'remove'): void
}

const { item } = defineProps<Props>()

const emit = defineEmits<Emits>()

const itemSubtotal = computed(() => calculateItemSubtotal(item.product.price, item.quantity))
</script>

<template>
  <UCard class="overflow-hidden">
    <div class="flex gap-4 items-center">
      <div class="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <NuxtImg
          :src="item.product.image"
          :alt="item.product.name"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
          {{ item.product.name }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ formatCurrency(item.product.price) }} each
        </p>
      </div>

      <div class="flex items-center gap-3 sm:gap-4 shrink-0">
        <div class="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <UButton
            type="button"
            icon="i-lucide-minus"
            size="sm"
            square
            variant="ghost"
            color="neutral"
            aria-label="Decrease quantity"
            @click="emit('decrement')"
          />
          <span class="min-w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ item.quantity }}
          </span>
          <UButton
            type="button"
            icon="i-lucide-plus"
            size="sm"
            square
            variant="ghost"
            color="neutral"
            aria-label="Increase quantity"
            @click="emit('increment')"
          />
        </div>

        <div class="hidden sm:block min-w-20 text-right text-base font-bold text-gray-900 dark:text-gray-100">
          {{ formatCurrency(itemSubtotal) }}
        </div>

        <UButton
          type="button"
          icon="i-lucide-trash-2"
          size="sm"
          square
          variant="ghost"
          color="error"
          aria-label="Remove item"
          @click="emit('remove')"
        />
      </div>
    </div>

    <div class="sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <span class="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
      <span class="text-base font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(itemSubtotal) }}</span>
    </div>
  </UCard>
</template>
