import { z } from 'zod'
import type { CartMsg } from './cartModel'
import { CartItemSchema, type CartItem } from '../../schemas/cart'
import { getValidatedItem, setItem } from '#layers/shared/app/utils/storage'

const STORAGE_KEY = 'shopping-cart'


export function loadCartFromStorage(dispatch: (msg: CartMsg) => void): void {
  const storedCart = getValidatedItem(
    STORAGE_KEY,
    z.array(CartItemSchema),
    (error) => {
      // eslint-disable-next-line no-console
      console.error('Cart data validation failed. Clearing corrupted cart:', error.issues)
    },
  )

  if (storedCart) {
    dispatch({ type: 'HYDRATE_FROM_STORAGE', items: storedCart })
  }
}


export function saveCartToStorage(items: CartItem[]): void {
  setItem(STORAGE_KEY, items)
}
