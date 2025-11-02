import type { z } from 'zod'

/**
 * Shared localStorage utilities (Design System Layer)
 *
 * Type-safe localStorage access with Zod validation
 * - Handles JSON serialization/deserialization
 * - Works on both client and server (with SSR guards)
 * - Runtime validation with Zod schemas for data integrity
 */

/**
 * Check if localStorage is available (client-side only)
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  }
  catch {
    return false
  }
}

/**
 * Get item from localStorage with JSON parsing
 *
 * @param key - Storage key
 * @returns Parsed value or null if not found or invalid
 *
 * @example
 * const cart = getItem<Cart>('cart')
 *
 * @deprecated Use getValidatedItem with a Zod schema for type-safe validation
 */
export function getItem<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    const item = localStorage.getItem(key)
    if (item === null || item === '') {
      return null
    }
    const parsed: unknown = JSON.parse(item)
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deprecated function, use getValidatedItem instead
    return parsed as T
  }
  catch {
    return null
  }
}

/**
 * Get item from localStorage with Zod schema validation
 *
 * This is the recommended way to retrieve data from localStorage as it:
 * - Validates data structure at runtime
 * - Protects against corrupted/manipulated localStorage
 * - Provides type safety through schema inference
 * - Returns null for invalid data (with optional error logging)
 *
 * @param key - Storage key
 * @param schema - Zod schema for validation
 * @param onError - Optional callback for validation errors
 * @returns Validated value or null if not found/invalid
 *
 * @example
 * import { CartItemSchema } from '~/features/cart/schemas/cart'
 *
 * const items = getValidatedItem('cart', z.array(CartItemSchema), (error) => {
 *   console.error('Cart validation failed:', error)
 * })
 */
export function getValidatedItem<T extends z.ZodTypeAny>(
  key: string,
  schema: T,
  onError?: (error: z.ZodError) => void,
): z.infer<T> | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    const item = localStorage.getItem(key)
    if (item === null || item === '') {
      return null
    }

    const parsed: unknown = JSON.parse(item)
    const result = schema.safeParse(parsed)

    if (result.success) {
      return result.data
    }

    // Validation failed - data is corrupted or invalid
    if (onError) {
      onError(result.error)
    }
    else {
      console.error(`localStorage validation failed for key "${key}":`, result.error.issues)
    }

    // Remove corrupted data
    removeItem(key)
    return null
  }
  catch (error) {
    console.error(`Failed to read from localStorage key "${key}":`, error)
    return null
  }
}

/**
 * Set item in localStorage with JSON serialization
 *
 * @param key - Storage key
 * @param value - Value to store
 *
 * @example
 * setItem('cart', cartData)
 */
export function setItem<T>(key: string, value: T): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  }
  catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

/**
 * Remove item from localStorage
 *
 * @param key - Storage key
 *
 * @example
 * removeItem('cart')
 */
export function removeItem(key: string): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.removeItem(key)
  }
  catch (error) {
    console.error('Failed to remove from localStorage:', error)
  }
}

/**
 * Clear all items from localStorage
 */
export function clear(): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.clear()
  }
  catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
