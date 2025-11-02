import type { CartItem } from '../../schemas/cart'
import type { Product } from '#layers/products/app/schemas/product'


export interface CartModel {
  items: CartItem[]
}


export const initialModel: CartModel = {
  items: [],
}


export type CartMsg =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'INCREMENT_ITEM'; productId: string }
  | { type: 'DECREMENT_ITEM'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE_FROM_STORAGE'; items: CartItem[] }
