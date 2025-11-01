/**
 * Cart Store - Pinia integration
 *
 * This file connects the pure logic with Pinia:
 * - Manages reactive state using Vue's ref
 * - Exposes readonly state to prevent direct mutations
 * - Provides a dispatch function for message-driven updates
 * - Coordinates side effects (localStorage)
 * - Provides computed getters for derived state
 *
 * Following The Elm Architecture pattern with Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { initialModel, type CartModel, type CartMsg } from './cartModel'
import { update } from './cartUpdate'
import { loadCartFromStorage, saveCartToStorage } from './cartEffects'
import {
  calculateItemCount,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from '../../utils/calculations'

/**
 * Cart store using The Elm Architecture pattern
 *
 * Public API:
 * - state: Readonly cart state with computed getters
 * - dispatch: Send messages to update the cart
 */
export const useCartStore = defineStore('cart', () => {
  // Internal mutable model
  const model = ref<CartModel>(initialModel)

  // Initialize: Load cart from localStorage
  loadCartFromStorage(dispatch)

  // Side effect: Persist to localStorage when items change
  watch(
    () => model.value.items,
    (newItems) => {
      saveCartToStorage(newItems)
    },
    { deep: true },
  )

  // Dispatch function - the only way to update state
  function dispatch(msg: CartMsg) {
    model.value = update(model.value, msg)
  }

  // Computed getters for derived state
  const items = computed(() => model.value.items)
  const itemCount = computed(() => calculateItemCount(model.value.items))
  const subtotal = computed(() => calculateSubtotal(model.value.items))
  const tax = computed(() => calculateTax(subtotal.value))
  const total = computed(() => calculateTotal(subtotal.value, tax.value))
  const isEmpty = computed(() => model.value.items.length === 0)
  const itemInCart = computed(() => (productId: string) =>
    model.value.items.find(item => item.product.id === productId),
  )

  // Public API - readonly state + dispatch
  return {
    // Readonly state prevents direct mutations
    state: readonly({
      items,
      itemCount,
      subtotal,
      tax,
      total,
      isEmpty,
      itemInCart,
    }),

    // Dispatch is the only way to update state
    dispatch,
  }
})
