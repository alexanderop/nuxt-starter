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


export const useCartStore = defineStore('cart', () => {
  const model = ref<CartModel>(initialModel)

  loadCartFromStorage(dispatch)

  watch(
    () => model.value.items,
    (newItems) => {
      saveCartToStorage(newItems)
    },
    { deep: true },
  )

  function dispatch(msg: CartMsg) {
    model.value = update(model.value, msg)
  }

  const items = computed(() => model.value.items)
  const itemCount = computed(() => calculateItemCount(model.value.items))
  const subtotal = computed(() => calculateSubtotal(model.value.items))
  const tax = computed(() => calculateTax(subtotal.value))
  const total = computed(() => calculateTotal(subtotal.value, tax.value))
  const isEmpty = computed(() => model.value.items.length === 0)
  const itemInCart = computed(() => (productId: string) =>
    model.value.items.find(item => item.product.id === productId),
  )

  return {
    state: readonly({
      items,
      itemCount,
      subtotal,
      tax,
      total,
      isEmpty,
      itemInCart,
    }),
    dispatch,
  }
})
