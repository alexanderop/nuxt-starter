import type { CartItem } from '../schemas/cart'


export const TAX_RATE = 0.1


const INITIAL_SUM = 0

/**
 * Calculate item subtotal from price and quantity
 *
 * @param price - Product price in cents
 * @param quantity - Item quantity
 * @returns Subtotal in cents
 */
export function calculateItemSubtotal(price: number, quantity: number): number {
  return price * quantity
}

/**
 * Calculate cart subtotal (sum of all item subtotals)
 * Computes subtotal from price × quantity for each item
 *
 * @param items - Cart items
 * @returns Subtotal in cents
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemSubtotal(item.product.price, item.quantity), INITIAL_SUM)
}

/**
 * Calculate tax amount
 *
 * @param subtotal - Subtotal in cents
 * @returns Tax amount in cents (rounded)
 */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE)
}

/**
 * Calculate cart total
 *
 * @param subtotal - Subtotal in cents
 * @param tax - Tax amount in cents
 * @returns Total in cents
 */
export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax
}

/**
 * Calculate total item count
 *
 * @param items - Cart items
 * @returns Total number of items
 */
export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, INITIAL_SUM)
}
