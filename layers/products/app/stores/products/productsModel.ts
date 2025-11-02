/**
 * Products Model - State shape and messages (Products Layer)
 *
 * This file defines:
 * - The shape of the products state (ProductsModel)
 * - All possible messages that can update the state (ProductsMsg)
 * - Initial state
 *
 * Following The Elm Architecture pattern for predictable state management
 */

import type { Product } from '../../schemas/product'
import type { ProductFilter, ProductSort } from '../../schemas/filters'

/**
 * Products state model
 */
export interface ProductsModel {
  /** All products */
  products: Product[]
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Current filter criteria */
  currentFilter: ProductFilter
  /** Current sort option */
  currentSort: ProductSort
}

/**
 * Initial products state
 */
export const initialModel: ProductsModel = {
  products: [],
  loading: false,
  error: null,
  currentFilter: {
    search: undefined,
    category: 'all',
    inStock: false,
  },
  currentSort: 'name-asc',
}

/**
 * Products messages - all possible actions that can modify products state
 *
 * These messages are dispatched by components and side effects,
 * and handled by the pure update function
 */
export type ProductsMsg =
  | { type: 'SET_FILTER'; filter: ProductFilter }
  | { type: 'SET_SORT'; sort: ProductSort }
  | { type: 'RESET_FILTER' }
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; products: Product[] }
  | { type: 'FETCH_FAILURE'; error: string }
