<script setup lang="ts">
import { NuxtRouteAnnouncer, NuxtPage, UApp, UHeader, UButton, UColorModeButton, UBadge, UTooltip } from '#components'
import { useCartStore } from '~/features/cart/stores/cart/cart'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

const cartItemCount = computed(() => cartStore.state.itemCount)

function goToCart() {
  router.push('/shoppingCart')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <button
          type="button"
          class="text-xl font-bold hover:opacity-80 transition-opacity"
          @click="goHome"
        >
          Modern Shop
        </button>
      </template>

      <template #right>
        <UTooltip text="Shopping Cart">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-shopping-cart"
            aria-label="Shopping Cart"
            @click="goToCart"
          >
            <UBadge
              v-if="cartItemCount > 0"
              :label="cartItemCount.toString()"
              color="primary"
              size="xs"
              class="absolute -top-1 -right-1"
            />
          </UButton>
        </UTooltip>

        <UColorModeButton />
      </template>
    </UHeader>

    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
