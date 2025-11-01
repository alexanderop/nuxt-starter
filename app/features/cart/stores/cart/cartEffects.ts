/**
 * Cart Effects - Side effects (localStorage)
 *
 * This file handles all side effects for the cart feature:
 * - Loading cart from localStorage
 * - Saving cart to localStorage
 *
 * Effects receive a dispatch function and use it to send messages
 * back to the update function. This keeps the update function pure
 * while allowing controlled side effects.
 *
 * Following The Elm Architecture pattern
 */

import { z } from 'zod'
import type { CartMsg } from './cartModel'
import { CartItemSchema, type CartItem } from '../../schemas/cart'
import { getValidatedItem, setItem } from '~/utils/storage'

const STORAGE_KEY = 'shopping-cart'

/**
 * Load cart from localStorage
 *
 * Side effect: Reads from localStorage
 * Dispatches: HYDRATE_FROM_STORAGE message if data exists and is valid
 *
 * @param dispatch - Function to send messages to the update function
 */
export function loadCartFromStorage(dispatch: (msg: CartMsg) => void): void {
  const storedCart = getValidatedItem(
    STORAGE_KEY,
    z.array(CartItemSchema),
    (error) => {
      console.error('Cart data validation failed. Clearing corrupted cart:', error.issues)
    },
  )

  if (storedCart) {
    dispatch({ type: 'HYDRATE_FROM_STORAGE', items: storedCart })
  }
}

/**
 * Save cart to localStorage
 *
 * Side effect: Writes to localStorage
 *
 * @param items - Cart items to save
 */
export function saveCartToStorage(items: CartItem[]): void {
  setItem(STORAGE_KEY, items)
}
