/**
 * Zod-Driven Mock Generation
 *
 * This module provides mock data generation functions driven by Zod schemas.
 * All mocks are guaranteed to match their corresponding schemas, preventing schema drift.
 *
 * Benefits:
 * - Mocks always valid against Zod schemas
 * - Schema changes auto-update mocks
 * - Reduces manual mock maintenance
 * - Type-safe with proper TypeScript inference
 *
 * Usage:
 *   import { generateProduct, generateProducts, generateCartItem } from '#layers/shared/app/test/mocks'
 *
 *   const product = generateProduct() // Random valid product
 *   const products = generateProducts(10) // Array of 10 products
 *   const customProduct = generateProduct({ name: 'Custom Widget', price: 1999 })
 */

import { generateMock } from '@anatine/zod-mock'
import { ProductSchema, ProductCategorySchema } from '#layers/products/app/schemas/product'
import { ProductFilterSchema, ProductSortSchema } from '#layers/products/app/schemas/filters'
import { CartItemSchema } from '#layers/cart/app/schemas/cart'
import type { Product, ProductCategory } from '#layers/products/app/schemas/product'
import type { ProductFilter, ProductSort } from '#layers/products/app/schemas/filters'
import type { CartItem } from '#layers/cart/app/schemas/cart'

/**
 * Generate a single Product with optional overrides
 *
 * @param overrides - Partial product object to override generated values
 * @returns Valid Product matching ProductSchema
 *
 * @example
 *   const product = generateProduct()
 *   const expensiveProduct = generateProduct({ price: 999900, category: 'electronics' })
 */
export function generateProduct(overrides: Partial<Product> = {}): Product {
  const mock = generateMock(ProductSchema)
  return { ...mock, ...overrides }
}

/**
 * Generate an array of Products
 *
 * @param count - Number of products to generate
 * @returns Array of valid Products
 *
 * @example
 *   const products = generateProducts(5)
 *   const twoProducts = generateProducts(2)
 */
export function generateProducts(count: number): Product[] {
  return Array.from({ length: count }, () => generateProduct())
}

/**
 * Generate a ProductCategory enum value
 *
 * @returns Valid ProductCategory
 *
 * @example
 *   const category = generateCategory() // 'electronics' | 'clothing' | etc.
 */
export function generateCategory(): ProductCategory {
  return generateMock(ProductCategorySchema)
}

/**
 * Generate a ProductFilter with optional overrides
 *
 * @param overrides - Partial filter object to override generated values
 * @returns Valid ProductFilter matching ProductFilterSchema
 *
 * @example
 *   const filter = generateFilter()
 *   const electronicsFilter = generateFilter({ category: 'electronics', inStock: true })
 */
export function generateFilter(overrides: Partial<ProductFilter> = {}): ProductFilter {
  const mock = generateMock(ProductFilterSchema)
  return { ...mock, ...overrides }
}

/**
 * Generate a ProductSort enum value
 *
 * @returns Valid ProductSort
 *
 * @example
 *   const sort = generateSort() // 'name-asc' | 'price-desc' | etc.
 */
export function generateSort(): ProductSort {
  return generateMock(ProductSortSchema)
}

/**
 * Generate a CartItem with optional overrides
 *
 * @param overrides - Partial cart item object to override generated values
 * @returns Valid CartItem matching CartItemSchema
 *
 * @example
 *   const item = generateCartItem()
 *   const customItem = generateCartItem({
 *     product: generateProduct({ name: 'Widget' }),
 *     quantity: 3
 *   })
 */
export function generateCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const mock = generateMock(CartItemSchema)
  return { ...mock, ...overrides }
}

/**
 * Generate an array of CartItems
 *
 * @param count - Number of cart items to generate
 * @returns Array of valid CartItems
 *
 * @example
 *   const items = generateCartItems(3)
 */
export function generateCartItems(count: number): CartItem[] {
  return Array.from({ length: count }, () => generateCartItem())
}

/**
 * Generate a CartItem with specific price and quantity for calculations tests
 *
 * This is a convenience function for tests that need to verify exact calculations
 * with known values.
 *
 * @param price - Price in cents
 * @param quantity - Item quantity
 * @returns CartItem with specified price and quantity
 *
 * @example
 *   const item = generateCartItemWithPrice(1999, 2) // $19.99 × 2
 */
export function generateCartItemWithPrice(price: number, quantity: number): CartItem {
  return generateCartItem({
    product: generateProduct({ price }),
    quantity,
  })
}
