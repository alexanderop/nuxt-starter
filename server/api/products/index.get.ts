/**
 * GET /api/products - Fetch all products with optional filters
 *
 * Query parameters:
 * - search: string (filter by name/description)
 * - category: string (filter by category, 'all' for no filter)
 * - minPrice: number (minimum price in cents)
 * - maxPrice: number (maximum price in cents)
 * - minRating: number (minimum rating 0-5)
 * - inStock: boolean (only show items in stock)
 */

import { defineEventHandler, getQuery, createError } from 'h3'
import { z } from 'zod'
import type { Product } from '../../types/product'

/**
 * Mock product data - server-side only
 * Replace with database queries in production
 */
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
    price: 19999,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    stock: 15,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
    price: 24999,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    stock: 8,
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Laptop Backpack',
    description: 'Durable backpack with padded laptop compartment, fits up to 15" laptops',
    price: 5999,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    stock: 22,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Classic Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt, available in multiple colors',
    price: 1999,
    category: 'clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    stock: 50,
    rating: 4.0,
  },
  {
    id: '5',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning',
    price: 8999,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    stock: 12,
    rating: 4.6,
  },
  {
    id: '6',
    name: 'The Design of Everyday Things',
    description: 'Classic book on design principles by Don Norman',
    price: 1899,
    category: 'books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    stock: 30,
    rating: 4.8,
  },
  {
    id: '7',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle keeps drinks cold for 24 hours',
    price: 2999,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    stock: 40,
    rating: 4.4,
  },
  {
    id: '8',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature',
    price: 3999,
    category: 'home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    stock: 18,
    rating: 4.3,
  },
  {
    id: '9',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with carrying strap, 6mm thick',
    price: 3499,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    stock: 25,
    rating: 4.5,
  },
  {
    id: '10',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe, brews 12 cups',
    price: 7999,
    category: 'home',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
    stock: 10,
    rating: 4.1,
  },
  {
    id: '11',
    name: 'Denim Jacket',
    description: 'Classic denim jacket with a modern fit',
    price: 6999,
    category: 'clothing',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
    stock: 14,
    rating: 4.2,
  },
  {
    id: '12',
    name: 'JavaScript: The Good Parts',
    description: 'Essential guide to JavaScript programming by Douglas Crockford',
    price: 2499,
    category: 'books',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    stock: 20,
    rating: 4.7,
  },
]

/**
 * Query parameters validation schema
 */
const QuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
})

export default defineEventHandler((event) => {
  // Parse and validate query parameters
  const queryResult = QuerySchema.safeParse(getQuery(event))

  if (!queryResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query parameters',
      data: queryResult.error.issues,
    })
  }

  const { search, category, minPrice, maxPrice, minRating, inStock } = queryResult.data

  // Filter products based on query parameters
  let filteredProducts = MOCK_PRODUCTS

  // Filter by search term (name or description)
  if (search !== undefined && search !== null && search !== '') {
    const searchLower = search.toLowerCase()
    filteredProducts = filteredProducts.filter(
      product =>
        product.name.toLowerCase().includes(searchLower)
        || product.description.toLowerCase().includes(searchLower),
    )
  }

  // Filter by category
  if (category !== undefined && category !== null && category !== '' && category !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.category === category)
  }

  // Filter by price range
  if (minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.price >= minPrice)
  }
  if (maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice)
  }

  // Filter by minimum rating
  if (minRating !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.rating >= minRating)
  }

  // Filter by stock availability
  if (inStock) {
    filteredProducts = filteredProducts.filter(product => product.stock > 0)
  }

  return filteredProducts
})
