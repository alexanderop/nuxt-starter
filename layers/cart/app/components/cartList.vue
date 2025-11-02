<script setup lang="ts">
import { UCard, UButton, UEmpty, USeparator } from '#components'
import { useRouter } from 'vue-router'
import { formatCurrency } from '#layers/shared/app/utils/currency'
import { useCartStore } from '../stores/cart/cart'
import CartItem from './cartItem.vue'

const cartStore = useCartStore()
const router = useRouter()

function continueShopping() {
  router.push('/')
}

function checkout() {
  // In a real app, this would navigate to checkout flow
  alert('Checkout functionality would be implemented here!')
}
</script>

<template>
  <div class="w-full">
    <UEmpty
      v-if="cartStore.state.isEmpty"
      icon="i-lucide-shopping-cart"
      title="Your cart is empty"
      description="Add some products to get started"
      class="py-16"
    >
      <template #actions>
        <UButton
          type="button"
          size="lg"
          label="Continue Shopping"
          icon="i-lucide-store"
          @click="continueShopping"
        />
      </template>
    </UEmpty>

    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start"
    >
      <div class="flex flex-col gap-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Shopping Cart ({{ cartStore.state.itemCount }} items)
        </h2>
        <div class="flex flex-col gap-3">
          <CartItem
            v-for="item in cartStore.state.items"
            :key="item.product.id"
            :item="item"
            @increment="cartStore.dispatch({ type: 'INCREMENT_ITEM', productId: item.product.id })"
            @decrement="cartStore.dispatch({ type: 'DECREMENT_ITEM', productId: item.product.id })"
            @remove="cartStore.dispatch({ type: 'REMOVE_ITEM', productId: item.product.id })"
          />
        </div>
      </div>

      <div class="sticky top-24">
        <UCard>
          <template #header>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
              Order Summary
            </h3>
          </template>

          <div class="flex flex-col gap-3">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{{ formatCurrency(cartStore.state.subtotal) }}</span>
            </div>

            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Tax (10%)</span>
              <span>{{ formatCurrency(cartStore.state.tax) }}</span>
            </div>

            <USeparator />

            <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
              <span>Total</span>
              <span>{{ formatCurrency(cartStore.state.total) }}</span>
            </div>

            <UButton
              type="button"
              block
              size="lg"
              label="Proceed to Checkout"
              icon="i-lucide-credit-card"
              class="mt-2"
              @click="checkout"
            />

            <UButton
              type="button"
              block
              variant="ghost"
              color="neutral"
              label="Continue Shopping"
              @click="continueShopping"
            />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
