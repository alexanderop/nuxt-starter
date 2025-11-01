<script setup lang="ts">
/**
 * CartSummary component
 *
 * Mini cart widget showing total (cart button moved to header)
 */

import { UButton, UBadge } from '#components'
import { useRouter } from 'vue-router'
import { formatCurrency } from '~/utils/currency'
import { useCartStore } from '../stores/cart/cart'

const cartStore = useCartStore()
const router = useRouter()

function goToCart() {
  router.push('/shoppingCart')
}
</script>

<template>
  <UButton
    v-if="cartStore.state.itemCount > 0"
    type="button"
    color="neutral"
    variant="solid"
    size="lg"
    icon="i-lucide-shopping-cart"
    class="fixed bottom-6 right-6 z-50 shadow-xl hover:shadow-2xl transition-shadow"
    @click="goToCart"
  >
    <span class="hidden sm:inline">{{ formatCurrency(cartStore.state.total) }}</span>
    <UBadge
      :label="cartStore.state.itemCount.toString()"
      color="primary"
      size="sm"
      class="ml-2"
    />
  </UButton>
</template>
