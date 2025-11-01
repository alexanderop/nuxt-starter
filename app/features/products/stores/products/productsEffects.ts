/**
 * Products Effects - Side effects (API calls)
 *
 * This file handles all side effects for the products feature:
 * - Fetching products from API (currently mocked)
 *
 * Effects receive a dispatch function and use it to send messages
 * back to the update function. This keeps the update function pure
 * while allowing controlled side effects.
 *
 * Following The Elm Architecture pattern
 */

import { z } from 'zod'
import { MOCK_PRODUCTS, type ProductsMsg } from './productsModel'
import { ProductSchema } from '~/shared/schemas/product'

/** API delay simulation in milliseconds */
const API_DELAY_MS = 500

/**
 * Fetch products from API
 *
 * Side effect: Makes async API call (currently simulated)
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, API_DELAY_MS))

    // In a real app, this would be an API call with validation:
    // const response = await $fetch('/api/products')
    //
    // // Validate API response
    // const validationResult = z.array(ProductSchema).safeParse(response)
    //
    // if (!validationResult.success) {
    //   console.error('API response validation failed:', validationResult.error.errors)
    //   throw new Error('Invalid product data received from API')
    // }
    //
    // dispatch({ type: 'FETCH_SUCCESS', products: validationResult.data })

    // For now, validate mock data to ensure it's correct
    const validationResult = z.array(ProductSchema).safeParse(MOCK_PRODUCTS)
    if (!validationResult.success) {
      console.error('Mock data validation failed:', validationResult.error.issues)
      throw new Error('Invalid product data')
    }

    dispatch({ type: 'FETCH_SUCCESS', products: validationResult.data })
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
    dispatch({ type: 'FETCH_FAILURE', error: errorMessage })
  }
}
