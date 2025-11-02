/**
 * Product types for server-side use
 * Duplicated from layers to avoid circular dependencies
 */

export type ProductCategory = 'electronics' | 'clothing' | 'books' | 'home' | 'sports'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  image: string
  stock: number
  rating?: number
}
