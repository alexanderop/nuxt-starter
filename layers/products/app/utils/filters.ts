/**
 * Product filtering and sorting utilities (Products Layer)
 *
 * Pure functions for filtering and sorting products
 */

import type { Product } from '../schemas/product'
import type { ProductFilter, ProductSort } from '../schemas/filters'

/**
 * Constants for filtering and sorting
 */
const DEFAULT_RATING = 0
const MIN_STOCK_AVAILABLE = 0

/**
 * Filter products based on criteria
 *
 * @param products - Array of products to filter
 * @param filter - Filter criteria
 * @returns Filtered products
 */
export function filterProducts(products: Product[], filter: ProductFilter): Product[] {
  let result = products

  // Filter by search query
  if (filter.search !== undefined && filter.search !== null && filter.search.trim() !== '') {
    const query = filter.search.toLowerCase()
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(query)
        || p.description.toLowerCase().includes(query),
    )
  }

  // Filter by category
  if (filter.category && filter.category !== 'all') {
    result = result.filter(p => p.category === filter.category)
  }

  // Filter by price range
  if (filter.priceRange) {
    const { min, max } = filter.priceRange
    result = result.filter(p => p.price >= min && p.price <= max)
  }

  // Filter by minimum rating
  if (filter.minRating !== undefined) {
    result = result.filter(p => (p.rating ?? DEFAULT_RATING) >= filter.minRating!)
  }

  // Filter by stock availability
  if (filter.inStock === true) {
    result = result.filter(p => p.stock > MIN_STOCK_AVAILABLE)
  }

  return result
}

/**
 * Sort products based on sort option
 *
 * @param products - Array of products to sort
 * @param sort - Sort option
 * @returns Sorted products
 */
export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const sorted = [...products]

  switch (sort) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'rating-desc':
      sorted.sort((a, b) => (b.rating ?? DEFAULT_RATING) - (a.rating ?? DEFAULT_RATING))
      break
  }

  return sorted
}
