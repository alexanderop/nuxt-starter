<script setup lang="ts">
/**
 * Product detail page
 *
 * Demonstrates:
 * - Dynamic routing with [id] parameter
 * - Composition of products and cart features
 * - Shared data access through stores
 */

import { computed } from 'vue'
import { useHead } from '#app'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '~/features/products/stores/products/products'
import { useCartStore } from '~/features/cart/stores/cart/cart'
import { formatCurrency } from '~/utils/currency'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

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

function addToCart() {
  if (product.value) {
    cartStore.dispatch({ type: 'ADD_ITEM', product: product.value })
  }
}

const inCart = computed(() => {
  if (!product.value) {
    return false
  }
  return !!cartStore.state.itemInCart(product.value.id)
})
</script>

<template>
  <div class="product-page">
    <div class="container">
      <!-- Header with back button -->
      <header class="header">
        <button
          type="button"
          class="back-btn"
          @click="goBack"
        >
          ← Back to Shop
        </button>
      </header>

      <!-- Product not found -->
      <div
        v-if="!product"
        class="not-found"
      >
        <h1 class="not-found-title">
          Product Not Found
        </h1>
        <p class="not-found-text">
          The product you're looking for doesn't exist.
        </p>
        <button
          type="button"
          class="back-to-shop-btn"
          @click="goBack"
        >
          Back to Shop
        </button>
      </div>

      <!-- Product details -->
      <main
        v-else
        class="product-detail"
      >
        <div class="product-image-container">
          <NuxtImg
            :src="product.image"
            :alt="product.name"
            class="product-image"
          />
        </div>

        <div class="product-info">
          <div class="product-category">
            {{ product.category.charAt(0).toUpperCase() + product.category.slice(1) }}
          </div>

          <h1 class="product-name">
            {{ product.name }}
          </h1>

          <div
            v-if="product.rating"
            class="product-rating"
          >
            ⭐ {{ product.rating.toFixed(1) }} / 5.0
          </div>

          <p class="product-description">
            {{ product.description }}
          </p>

          <div class="product-price">
            {{ formatCurrency(product.price) }}
          </div>

          <div class="product-stock">
            <span
              v-if="product.stock > 0"
              class="in-stock"
            >
              ✓ {{ product.stock }} in stock
            </span>
            <span
              v-else
              class="out-of-stock"
            >
              ✕ Out of stock
            </span>
          </div>

          <button
            type="button"
            class="add-to-cart-btn"
            :disabled="product.stock === 0"
            @click="addToCart"
          >
            {{ product.stock === 0 ? 'Out of Stock' : inCart ? 'Add Another to Cart' : 'Add to Cart' }}
          </button>

          <div
            v-if="inCart"
            class="in-cart-notice"
          >
            ✓ This item is in your cart
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 16px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
}

.back-btn {
  padding: 8px 16px;
  background: transparent;
  color: #3b82f6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #eff6ff;
}

.not-found {
  text-align: center;
  padding: 64px 24px;
}

.not-found-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

.not-found-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.back-to-shop-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.back-to-shop-btn:hover {
  background: #2563eb;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 48px;
}

.product-image-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-category {
  display: inline-block;
  width: fit-content;
  padding: 6px 12px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-name {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.product-rating {
  font-size: 16px;
  color: #6b7280;
}

.product-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.product-price {
  font-size: 36px;
  font-weight: 800;
  color: #111827;
  margin: 8px 0;
}

.product-stock {
  font-size: 14px;
  font-weight: 500;
}

.in-stock {
  color: #059669;
}

.out-of-stock {
  color: #dc2626;
}

.add-to-cart-btn {
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #2563eb;
}

.add-to-cart-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.in-cart-notice {
  padding: 12px 16px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 1024px) {
  .product-detail {
    grid-template-columns: 1fr;
    padding: 32px;
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .product-page {
    padding: 16px 12px;
  }

  .product-detail {
    padding: 24px;
    gap: 24px;
  }

  .product-name {
    font-size: 24px;
  }

  .product-price {
    font-size: 28px;
  }
}
</style>
