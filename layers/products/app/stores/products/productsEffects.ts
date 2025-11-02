/**
 * Products Effects - Side effects (API calls) (Products Layer)
 *
 * This file handles all side effects for the products feature:
 * - Fetching products from API
 *
 * Effects receive a dispatch function and use it to send messages
 * back to the update function. This keeps the update function pure
 * while allowing controlled side effects.
 *
 * Following The Elm Architecture pattern
 */

import { z } from 'zod'
import type { ProductsMsg } from './productsModel'
import { ProductSchema } from '../../schemas/product'

/**
 * Fetch products from API
 *
 * Side effect: Makes async API call to /api/products
 * Dispatches:
 * - FETCH_REQUEST when starting
 * - FETCH_SUCCESS when data is loaded successfully
 * - FETCH_FAILURE when an error occurs
 *
 * @param dispatch - Function to send messages to the update function
 */
export async function fetchProducts(dispatch: (msg: ProductsMsg) => void): Promise<void> {
  // Dispatch request message to set loading state
  dispatch({ type: 'FETCH_REQUEST' })

  try {
    // Fetch products from server API
    const response = await $fetch('/api/products')

    // Validate API response with Zod schema
    const validationResult = z.array(ProductSchema).safeParse(response)

    if (!validationResult.success) {
      // eslint-disable-next-line no-console
      console.error('API response validation failed:', validationResult.error.issues)
      throw new Error('Invalid product data received from API')
    }

    // Dispatch success with validated products
    dispatch({ type: 'FETCH_SUCCESS', products: validationResult.data })
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
    dispatch({ type: 'FETCH_FAILURE', error: errorMessage })
  }
}
