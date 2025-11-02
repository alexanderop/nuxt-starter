import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  TAX_RATE,
  calculateItemSubtotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateItemCount,
} from '../calculations'
import type { CartItem } from '../../schemas/cart'

// Helper function to create cart items from test data
function createCartItems(
  items: { price: number; quantity: number }[]
): CartItem[] {
  return items.map((item, i) => ({
    product: {
      id: String(i),
      name: 'Product',
      description: 'Description',
      price: item.price,
      category: 'electronics' as const,
      image: 'https://example.com/image.jpg',
      stock: 10,
    },
    quantity: item.quantity,
  }))
}

describe('calculations', () => {
  describe('calculateItemSubtotal', () => {
    it('calculates correct subtotal for price and quantity', () => {
      expect(calculateItemSubtotal(1999, 2)).toBe(3998)
      expect(calculateItemSubtotal(2999, 1)).toBe(2999)
      expect(calculateItemSubtotal(500, 3)).toBe(1500)
    })

    it('returns 0 for zero quantity', () => {
      expect(calculateItemSubtotal(1999, 0)).toBe(0)
    })

    it('returns 0 for zero price', () => {
      expect(calculateItemSubtotal(0, 5)).toBe(0)
    })

    it('handles large numbers correctly', () => {
      expect(calculateItemSubtotal(999999, 100)).toBe(99999900)
    })
  })

  describe('calculateSubtotal', () => {
    const mockProduct1 = {
      id: '1',
      name: 'Product 1',
      description: 'Description',
      price: 1999,
      category: 'electronics' as const,
      image: 'https://example.com/image.jpg',
      stock: 10,
      rating: 4.5,
    }

    const mockProduct2 = {
      id: '2',
      name: 'Product 2',
      description: 'Description',
      price: 2999,
      category: 'clothing' as const,
      image: 'https://example.com/image.jpg',
      stock: 5,
      rating: 4.0,
    }

    it('calculates correct subtotal for multiple items', () => {
      const items: CartItem[] = [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 1 },
      ]
      expect(calculateSubtotal(items)).toBe(6997) // (1999 * 2) + (2999 * 1)
    })

    it('returns 0 for empty cart', () => {
      expect(calculateSubtotal([])).toBe(0)
    })

    it('handles single item', () => {
      const items: CartItem[] = [{ product: mockProduct1, quantity: 1 }]
      expect(calculateSubtotal(items)).toBe(1999)
    })

    it('handles items with zero quantity', () => {
      const items: CartItem[] = [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 0 },
      ]
      expect(calculateSubtotal(items)).toBe(3998)
    })
  })

  describe('calculateTax', () => {
    it('calculates 10 percent tax correctly', () => {
      expect(calculateTax(6997)).toBe(700) // 6997 * 0.1 = 699.7, rounded to 700
      expect(calculateTax(1000)).toBe(100)
      expect(calculateTax(5000)).toBe(500)
    })

    it('rounds tax to nearest cent', () => {
      expect(calculateTax(666)).toBe(67) // 666 * 0.1 = 66.6, rounded to 67
      expect(calculateTax(667)).toBe(67) // 667 * 0.1 = 66.7, rounded to 67
      expect(calculateTax(665)).toBe(67) // 665 * 0.1 = 66.5, rounded to 67 (rounds up on .5)
    })

    it('returns 0 for zero subtotal', () => {
      expect(calculateTax(0)).toBe(0)
    })

    it('handles large subtotals', () => {
      expect(calculateTax(999999)).toBe(100000) // 999999 * 0.1 = 99999.9, rounded to 100000
    })
  })

  describe('calculateTotal', () => {
    it('adds subtotal and tax correctly', () => {
      expect(calculateTotal(6997, 700)).toBe(7697)
      expect(calculateTotal(1000, 100)).toBe(1100)
      expect(calculateTotal(5000, 500)).toBe(5500)
    })

    it('handles zero values', () => {
      expect(calculateTotal(0, 0)).toBe(0)
      expect(calculateTotal(1000, 0)).toBe(1000)
      expect(calculateTotal(0, 100)).toBe(100)
    })

    it('handles large values', () => {
      expect(calculateTotal(999999, 100000)).toBe(1099999)
    })
  })

  describe('calculateItemCount', () => {
    const mockProduct = {
      id: '1',
      name: 'Product',
      description: 'Description',
      price: 1999,
      category: 'electronics' as const,
      image: 'https://example.com/image.jpg',
      stock: 10,
      rating: 4.5,
    }

    it('counts total quantity across items', () => {
      const items: CartItem[] = [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2' }, quantity: 3 },
        { product: { ...mockProduct, id: '3' }, quantity: 1 },
      ]
      expect(calculateItemCount(items)).toBe(6)
    })

    it('returns 0 for empty cart', () => {
      expect(calculateItemCount([])).toBe(0)
    })

    it('handles single item', () => {
      const items: CartItem[] = [{ product: mockProduct, quantity: 5 }]
      expect(calculateItemCount(items)).toBe(5)
    })

    it('handles zero quantities', () => {
      const items: CartItem[] = [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2' }, quantity: 0 },
      ]
      expect(calculateItemCount(items)).toBe(2)
    })
  })

  describe('TAX_RATE constant', () => {
    it('is set to 0.1 (10 percent)', () => {
      expect(TAX_RATE).toBe(0.1)
    })
  })

  describe('property based tests', () => {
    it('subtotal is always non-negative', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: fc.nat(),
              quantity: fc.nat(),
            })
          ),
          (items) => {
            const cartItems: CartItem[] = items.map((item) => ({
              product: {
                id: '1',
                name: 'Product',
                description: 'Description',
                price: item.price,
                category: 'electronics' as const,
                image: 'https://example.com/image.jpg',
                stock: 10,
              },
              quantity: item.quantity,
            }))
            const subtotal = calculateSubtotal(cartItems)
            expect(subtotal).toBeGreaterThanOrEqual(0)
          }
        )
      )
    })

    it('tax is always between 0 and subtotal times TAX_RATE (with rounding)', () => {
      fc.assert(
        fc.property(fc.nat({ max: 10000000 }), (subtotal) => {
          const tax = calculateTax(subtotal)
          expect(tax).toBeGreaterThanOrEqual(0)
          expect(tax).toBeLessThanOrEqual(Math.ceil(subtotal * TAX_RATE))
        })
      )
    })

    it('total equals subtotal plus tax', () => {
      fc.assert(
        fc.property(fc.nat(), fc.nat(), (subtotal, tax) => {
          const total = calculateTotal(subtotal, tax)
          expect(total).toBe(subtotal + tax)
        })
      )
    })

    it('item count is always non-negative', () => {
      fc.assert(
        fc.property(fc.array(fc.nat()), (quantities) => {
          const cartItems: CartItem[] = quantities.map((quantity, i) => ({
            product: {
              id: String(i),
              name: 'Product',
              description: 'Description',
              price: 100,
              category: 'electronics' as const,
              image: 'https://example.com/image.jpg',
              stock: 10,
            },
            quantity,
          }))
          const count = calculateItemCount(cartItems)
          expect(count).toBeGreaterThanOrEqual(0)
          expect(count).toBe(quantities.reduce((sum, q) => sum + q, 0))
        })
      )
    })

    it('adding more items monotonically increases subtotal', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              price: fc.nat({ min: 1, max: 100000 }),
              quantity: fc.nat({ min: 1, max: 100 }),
            }),
            { minLength: 1 }
          ),
          (items) => {
            const subtotalN = calculateSubtotal(createCartItems(items))
            const subtotalNMinus1 = calculateSubtotal(
              createCartItems(items.slice(0, -1))
            )

            // Adding an item with positive price and quantity increases subtotal
            expect(subtotalN).toBeGreaterThanOrEqual(subtotalNMinus1)
          }
        )
      )
    })
  })
})
