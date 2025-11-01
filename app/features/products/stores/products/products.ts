/**
 * Products Store - Pinia integration
 *
 * This file connects the pure logic with Pinia:
 * - Manages reactive state using Vue's ref
 * - Exposes readonly state to prevent direct mutations
 * - Provides a dispatch function for message-driven updates
 * - Coordinates side effects (API calls)
 * - Provides computed getters for derived state
 *
 * Following The Elm Architecture pattern with Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { initialModel, type ProductsModel, type ProductsMsg } from './productsModel'
import { update } from './productsUpdate'
import { fetchProducts as fetchProductsEffect } from './productsEffects'
import { filterProducts, sortProducts } from '../../utils/filters'

/**
 * Products store using The Elm Architecture pattern
 *
 * Public API:
 * - state: Readonly products state with computed getters
 * - dispatch: Send messages to update the products
 * - fetchProducts: Trigger async product fetch
 */
export const useProductsStore = defineStore('products', () => {
  // Internal mutable model
  const model = ref<ProductsModel>(initialModel)

  // Dispatch function - the only way to update state
  function dispatch(msg: ProductsMsg) {
    model.value = update(model.value, msg)
  }

  // Side effect: Fetch products
  async function fetchProducts() {
    await fetchProductsEffect(dispatch)
  }

  // Computed getters for derived state
  const products = computed(() => model.value.products)
  const loading = computed(() => model.value.loading)
  const error = computed(() => model.value.error)
  const currentFilter = computed(() => model.value.currentFilter)
  const currentSort = computed(() => model.value.currentSort)

  const filteredProducts = computed(() => {
    let result = filterProducts(model.value.products, model.value.currentFilter)
    result = sortProducts(result, model.value.currentSort)
    return result
  })

  const productById = computed(() => (id: string) =>
    model.value.products.find(p => p.id === id),
  )

  const categories = computed(() => {
    const cats = new Set(model.value.products.map(p => p.category))
    return Array.from(cats)
  })

  // Public API - readonly state + dispatch + fetchProducts
  return {
    // Readonly state prevents direct mutations
    state: readonly({
      products,
      loading,
      error,
      currentFilter,
      currentSort,
      filteredProducts,
      productById,
      categories,
    }),

    // Dispatch is the primary way to update state
    dispatch,

    // Convenience methods for common actions
    setFilter: (filter: typeof currentFilter.value) =>
      dispatch({ type: 'SET_FILTER', filter }),
    setSort: (sort: typeof currentSort.value) =>
      dispatch({ type: 'SET_SORT', sort }),
    resetFilter: () => dispatch({ type: 'RESET_FILTER' }),

    // Side effect trigger
    fetchProducts,
  }
})
