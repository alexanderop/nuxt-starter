/**
 * Cart Update Function - Pure business logic
 *
 * This is a PURE FUNCTION that:
 * - Takes current state and a message
 * - Returns new state
 * - Has NO side effects (no API calls, no localStorage, no mutations)
 * - Is framework-agnostic (no Vue, no Pinia dependencies)
 * - Is trivially testable
 *
 * Following The Elm Architecture pattern
 */

import { z } from 'zod'
import type { Product } from '~/types/product'
import type { CartModel, CartMsg } from './cartModel'
import { ProductSchema } from '~/shared/schemas/product'
import { calculateItemSubtotal } from '../../utils/calculations'

/**
 * Helper: Add or increment product in cart
 */
function addItemToCart(model: CartModel, product: Product): CartModel {
  // Validate product before adding to cart
  const validationResult = ProductSchema.safeParse(product)
  if (!validationResult.success) {
    console.error('Invalid product data:', validationResult.error.issues)
    return model
  }

  const existingItem = model.items.find(item => item.product.id === product.id)

  if (existingItem) {
    // Increment existing item
    return {
      ...model,
      items: model.items.map(item =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: calculateItemSubtotal(item.product.price, item.quantity + 1),
            }
          : item,
      ),
    }
  }

  // Add new item
  return {
    ...model,
    items: [
      ...model.items,
      {
        product: validationResult.data,
        quantity: 1,
        subtotal: validationResult.data.price,
      },
    ],
  }
}

/**
 * Helper: Update item quantity
 */
function updateItemQuantity(model: CartModel, productId: string, quantity: number): CartModel {
  // Validate quantity
  const quantitySchema = z.number().int('Quantity must be an integer')
  const validationResult = quantitySchema.safeParse(quantity)

  if (!validationResult.success) {
    console.error('Invalid quantity:', validationResult.error.issues)
    return model
  }

  // If quantity is 0 or less, remove the item
  if (quantity <= 0) {
    return {
      ...model,
      items: model.items.filter(item => item.product.id !== productId),
    }
  }

  // Update quantity
  return {
    ...model,
    items: model.items.map(item =>
      item.product.id === productId
        ? {
            ...item,
            quantity: validationResult.data,
            subtotal: calculateItemSubtotal(item.product.price, validationResult.data),
          }
        : item,
    ),
  }
}

/**
 * Pure update function
 *
 * Given the same state and message, always returns the same new state.
 * No side effects, no mutations, just pure logic.
 *
 * @param model - Current cart state
 * @param msg - Message describing what should happen
 * @returns New cart state
 */
export function update(model: CartModel, msg: CartMsg): CartModel {
  switch (msg.type) {
    case 'ADD_ITEM':
      return addItemToCart(model, msg.product)

    case 'REMOVE_ITEM': {
      return {
        ...model,
        items: model.items.filter(item => item.product.id !== msg.productId),
      }
    }

    case 'UPDATE_QUANTITY':
      return updateItemQuantity(model, msg.productId, msg.quantity)

    case 'INCREMENT_ITEM': {
      const item = model.items.find(i => i.product.id === msg.productId)
      if (!item) {
        return model
      }
      return updateItemQuantity(model, msg.productId, item.quantity + 1)
    }

    case 'DECREMENT_ITEM': {
      const item = model.items.find(i => i.product.id === msg.productId)
      if (!item) {
        return model
      }
      return updateItemQuantity(model, msg.productId, item.quantity - 1)
    }

    case 'CLEAR_CART': {
      return {
        ...model,
        items: [],
      }
    }

    case 'HYDRATE_FROM_STORAGE': {
      return {
        ...model,
        items: msg.items,
      }
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = msg
      return model
    }
  }
}
