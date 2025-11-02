<script setup lang="ts">
/**
 * Product detail page
 *
 * Demonstrates:
 * - Dynamic routing with [id] parameter
 * - Composition of products and cart layers
 * - Component-based architecture for better maintainability
 * - 40/60 desktop layout split
 */

import { computed } from 'vue'
import { useHead, useAsyncData } from '#app'
import { useRoute, useRouter } from 'vue-router'
import { UButton, UEmpty } from '#components'
import { useProductsStore } from '#layers/products/app/stores/products/products'
import { useCartStore } from '#layers/cart/app/stores/cart/cart'
import ProductDetailImage from '#layers/products/app/components/productDetailImage.vue'
import ProductDetailInfo from '#layers/products/app/components/productDetailInfo.vue'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

// Fetch products on SSR to ensure product data is available
await useAsyncData('products', () => productsStore.fetchProducts())

const productId = computed(() => route.params.id as string)
const product = computed(() => productsStore.state.productById(productId.value))

const pageTitle = computed(() => {
  if (product.value) {
    return `${product.value.name} - Nuxt 4 Demo`
  }
  return 'Product Not Found'
})

useHead({
  title: pageTitle,
})

function goBack() {
  router.push('/')
}

// Cart event handlers
function handleAddToCart() {
  if (product.value) {
    cartStore.dispatch({ type: 'ADD_ITEM', product: product.value })
  }
}

function handleIncrement() {
  if (product.value) {
    cartStore.dispatch({ type: 'INCREMENT_ITEM', productId: product.value.id })
  }
}

function handleDecrement() {
  if (product.value) {
    cartStore.dispatch({ type: 'DECREMENT_ITEM', productId: product.value.id })
  }
}

function handleRemove() {
  if (product.value) {
    cartStore.dispatch({ type: 'REMOVE_ITEM', productId: product.value.id })
  }
}

const cartQuantity = computed(() => {
  if (!product.value) {
    return 0
  }
  return cartStore.state.itemInCart(product.value.id)?.quantity ?? 0
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 lg:p-12">
    <div class="max-w-7xl mx-auto">
      <!-- Header with back button -->
      <header class="mb-6 sm:mb-8">
        <UButton
          type="button"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="Back to Shop"
          @click="goBack"
        />
      </header>

      <!-- Product not found -->
      <UEmpty
        v-if="!product"
        title="Product Not Found"
        description="The product you're looking for doesn't exist."
        icon="i-lucide-package-x"
      >
        <template #footer>
          <UButton
            type="button"
            label="Back to Shop"
            @click="goBack"
          />
        </template>
      </UEmpty>

      <!-- Product details container -->
      <div
        v-else
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div class="grid sm:grid-cols-2 lg:grid-cols-[40%_60%] gap-6 sm:gap-8">
          <!-- Left: Product Image -->
          <div class="sm:p-8 lg:p-10 max-w-full">
            <ProductDetailImage
:product="product"
class="max-w-full" />
          </div>

          <!-- Right: Product Info -->
          <div class="p-6 sm:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900/50">
            <ProductDetailInfo
              :product="product"
              :in-cart-quantity="cartQuantity"
              @add-to-cart="handleAddToCart"
              @increment="handleIncrement"
              @decrement="handleDecrement"
              @remove="handleRemove"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
