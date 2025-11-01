/**
 * Cart Model - State shape and messages
 *
 * This file defines:
 * - The shape of the cart state (CartModel)
 * - All possible messages that can update the state (CartMsg)
 * - Initial state
 *
 * Following The Elm Architecture pattern for predictable state management
 */

import type { CartItem } from '../../schemas/cart'
import type { Product } from '~/types/product'

/**
 * Cart state model
 */
export interface CartModel {
  /** Cart items */
  items: CartItem[]
}

/**
 * Initial cart state
 */
export const initialModel: CartModel = {
  items: [],
}

/**
 * Cart messages - all possible actions that can modify cart state
 *
 * These messages are dispatched by components and side effects,
 * and handled by the pure update function
 */
export type CartMsg =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'INCREMENT_ITEM'; productId: string }
  | { type: 'DECREMENT_ITEM'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE_FROM_STORAGE'; items: CartItem[] }
