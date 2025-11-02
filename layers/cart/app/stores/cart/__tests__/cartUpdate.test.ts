import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { update } from '../cartUpdate'
import { initialModel, type CartModel, type CartMsg } from '../cartModel'
import type { Product } from '#layers/products/app/schemas/product'
import type { CartItem } from '../../../schemas/cart'

describe('cartUpdate', () => {
  const mockProduct1: Product = {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 1999,
    category: 'electronics',
    image: 'https://example.com/image1.jpg',
    stock: 10,
    rating: 4.5,
  }

  const mockProduct2: Product = {
    id: '2',
    name: 'Product 2',
    description: 'Description 2',
    price: 2999,
    category: 'clothing',
    image: 'https://example.com/image2.jpg',
    stock: 5,
    rating: 4.0,
  }

  describe('ADD_ITEM', () => {
    it('adds new item to empty cart', () => {
      const result = update(initialModel, {
        type: 'ADD_ITEM',
        product: mockProduct1,
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.product.id).toBe('1')
      expect(result.items[0]!.quantity).toBe(1)
    })

    it('increments quantity when product already exists', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }

      const result = update(model, {
        type: 'ADD_ITEM',
        product: mockProduct1,
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.quantity).toBe(3)
    })

    it('adds second different product', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }

      const result = update(model, {
        type: 'ADD_ITEM',
        product: mockProduct2,
      })

      expect(result.items).toHaveLength(2)
      expect(result.items[0]!.product.id).toBe('1')
      expect(result.items[1].product.id).toBe('2')
      expect(result.items[1].quantity).toBe(1)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }
      const originalItemsRef = model.items

      update(model, { type: 'ADD_ITEM', product: mockProduct2 })

      expect(model.items).toBe(originalItemsRef)
      expect(model.items).toHaveLength(1)
    })
  })

  describe('REMOVE_ITEM', () => {
    it('removes item from cart', () => {
      const model: CartModel = {
        items: [
          { product: mockProduct1, quantity: 2 },
          { product: mockProduct2, quantity: 1 },
        ],
      }

      const result = update(model, {
        type: 'REMOVE_ITEM',
        productId: '1',
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.product.id).toBe('2')
    })

    it('handles removing non-existent item', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }

      const result = update(model, {
        type: 'REMOVE_ITEM',
        productId: 'non-existent',
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.product.id).toBe('1')
    })

    it('results in empty cart when removing last item', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }

      const result = update(model, {
        type: 'REMOVE_ITEM',
        productId: '1',
      })

      expect(result.items).toHaveLength(0)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }
      const originalItemsRef = model.items

      update(model, { type: 'REMOVE_ITEM', productId: '1' })

      expect(model.items).toBe(originalItemsRef)
      expect(model.items).toHaveLength(1)
    })
  })

  describe('UPDATE_QUANTITY', () => {
    it('updates quantity to new value', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }

      const result = update(model, {
        type: 'UPDATE_QUANTITY',
        productId: '1',
        quantity: 5,
      })

      expect(result.items[0]!.quantity).toBe(5)
    })

    it('removes item when quantity is 0', () => {
      const model: CartModel = {
        items: [
          { product: mockProduct1, quantity: 2 },
          { product: mockProduct2, quantity: 1 },
        ],
      }

      const result = update(model, {
        type: 'UPDATE_QUANTITY',
        productId: '1',
        quantity: 0,
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.product.id).toBe('2')
    })

    it('removes item when quantity is negative', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }

      const result = update(model, {
        type: 'UPDATE_QUANTITY',
        productId: '1',
        quantity: -5,
      })

      expect(result.items).toHaveLength(0)
    })

    it('handles updating non-existent item', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }

      const result = update(model, {
        type: 'UPDATE_QUANTITY',
        productId: 'non-existent',
        quantity: 5,
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.quantity).toBe(1)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }
      const originalItemsRef = model.items
      const originalItemRef = model.items[0]

      update(model, { type: 'UPDATE_QUANTITY', productId: '1', quantity: 5 })

      expect(model.items).toBe(originalItemsRef)
      expect(model.items[0]).toBe(originalItemRef)
      expect(model.items[0].quantity).toBe(2)
    })
  })

  describe('INCREMENT_ITEM', () => {
    it('increments quantity by 1', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }

      const result = update(model, {
        type: 'INCREMENT_ITEM',
        productId: '1',
      })

      expect(result.items[0]!.quantity).toBe(3)
    })

    it('returns unchanged model when item not found', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }

      const result = update(model, {
        type: 'INCREMENT_ITEM',
        productId: 'non-existent',
      })

      expect(result).toEqual(model)
      expect(result.items).toHaveLength(1)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }
      const originalQuantity = model.items[0].quantity

      update(model, { type: 'INCREMENT_ITEM', productId: '1' })

      expect(model.items[0].quantity).toBe(originalQuantity)
    })
  })

  describe('DECREMENT_ITEM', () => {
    it('decrements quantity by 1', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 3 }],
      }

      const result = update(model, {
        type: 'DECREMENT_ITEM',
        productId: '1',
      })

      expect(result.items[0]!.quantity).toBe(2)
    })

    it('removes item when decrementing from quantity 1', () => {
      const model: CartModel = {
        items: [
          { product: mockProduct1, quantity: 1 },
          { product: mockProduct2, quantity: 2 },
        ],
      }

      const result = update(model, {
        type: 'DECREMENT_ITEM',
        productId: '1',
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.product.id).toBe('2')
    })

    it('returns unchanged model when item not found', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }

      const result = update(model, {
        type: 'DECREMENT_ITEM',
        productId: 'non-existent',
      })

      expect(result).toEqual(model)
      expect(result.items).toHaveLength(1)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 3 }],
      }
      const originalQuantity = model.items[0].quantity

      update(model, { type: 'DECREMENT_ITEM', productId: '1' })

      expect(model.items[0].quantity).toBe(originalQuantity)
    })
  })

  describe('CLEAR_CART', () => {
    it('clears all items from cart', () => {
      const model: CartModel = {
        items: [
          { product: mockProduct1, quantity: 2 },
          { product: mockProduct2, quantity: 1 },
        ],
      }

      const result = update(model, { type: 'CLEAR_CART' })

      expect(result.items).toHaveLength(0)
    })

    it('results in empty cart when already empty', () => {
      const result = update(initialModel, { type: 'CLEAR_CART' })

      expect(result.items).toHaveLength(0)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }
      const originalItemsRef = model.items

      update(model, { type: 'CLEAR_CART' })

      expect(model.items).toBe(originalItemsRef)
      expect(model.items).toHaveLength(1)
    })
  })

  describe('HYDRATE_FROM_STORAGE', () => {
    it('replaces cart items with provided items', () => {
      const storageItems: CartItem[] = [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 1 },
      ]

      const result = update(initialModel, {
        type: 'HYDRATE_FROM_STORAGE',
        items: storageItems,
      })

      expect(result.items).toEqual(storageItems)
      expect(result.items).toHaveLength(2)
    })

    it('overwrites existing cart items', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 5 }],
      }

      const storageItems: CartItem[] = [{ product: mockProduct2, quantity: 1 }]

      const result = update(model, {
        type: 'HYDRATE_FROM_STORAGE',
        items: storageItems,
      })

      expect(result.items).toEqual(storageItems)
      expect(result.items[0]!.product.id).toBe('2')
    })

    it('handles empty storage items', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 2 }],
      }

      const result = update(model, {
        type: 'HYDRATE_FROM_STORAGE',
        items: [],
      })

      expect(result.items).toHaveLength(0)
    })

    it('does not mutate original model', () => {
      const model: CartModel = {
        items: [{ product: mockProduct1, quantity: 1 }],
      }
      const originalItemsRef = model.items

      update(model, {
        type: 'HYDRATE_FROM_STORAGE',
        items: [{ product: mockProduct2, quantity: 2 }],
      })

      expect(model.items).toBe(originalItemsRef)
      expect(model.items).toHaveLength(1)
    })
  })

  describe('property based tests', () => {
    it('adding N items then removing N items results in empty cart', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 10 }),
          (productIds) => {
            const uniqueIds = Array.from(new Set(productIds))

            let model = initialModel

            // Add all items
            uniqueIds.forEach((id) => {
              model = update(model, {
                type: 'ADD_ITEM',
                product: {
                  ...mockProduct1,
                  id: String(id),
                },
              })
            })

            // Remove all items
            uniqueIds.forEach((id) => {
              model = update(model, {
                type: 'REMOVE_ITEM',
                productId: String(id),
              })
            })

            expect(model.items).toHaveLength(0)
          }
        )
      )
    })

    it('incrementing then decrementing results in original quantity', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (initialQuantity) => {
          let model: CartModel = {
            items: [{ product: mockProduct1, quantity: initialQuantity }],
          }

          model = update(model, { type: 'INCREMENT_ITEM', productId: '1' })
          model = update(model, { type: 'DECREMENT_ITEM', productId: '1' })

          expect(model.items[0].quantity).toBe(initialQuantity)
        })
      )
    })

    it('item quantity is never negative', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('INCREMENT_ITEM', 'DECREMENT_ITEM', 'UPDATE_QUANTITY') as fc.Arbitrary<
                'INCREMENT_ITEM' | 'DECREMENT_ITEM' | 'UPDATE_QUANTITY'
              >,
              quantity: fc.integer({ min: -10, max: 10 }),
            }),
            { maxLength: 20 }
          ),
          (operations) => {
            let model: CartModel = {
              items: [{ product: mockProduct1, quantity: 5 }],
            }

            operations.forEach((op) => {
              if (op.type === 'INCREMENT_ITEM') {
                model = update(model, { type: 'INCREMENT_ITEM', productId: '1' })
              } else if (op.type === 'DECREMENT_ITEM') {
                model = update(model, { type: 'DECREMENT_ITEM', productId: '1' })
              } else if (op.type === 'UPDATE_QUANTITY') {
                model = update(model, {
                  type: 'UPDATE_QUANTITY',
                  productId: '1',
                  quantity: op.quantity,
                })
              }
            })

            // Either item is removed (0 items) or has positive quantity
            if (model.items.length > 0) {
              expect(model.items[0].quantity).toBeGreaterThan(0)
            }
          }
        )
      )
    })

    it('cart maintains referential integrity (no duplicate product IDs)', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 20 }), { maxLength: 50 }),
          (productIds) => {
            let model = initialModel

            productIds.forEach((id) => {
              model = update(model, {
                type: 'ADD_ITEM',
                product: {
                  ...mockProduct1,
                  id: String(id),
                },
              })
            })

            const ids = model.items.map((item) => item.product.id)
            const uniqueIds = new Set(ids)

            expect(ids.length).toBe(uniqueIds.size)
          }
        )
      )
    })

    it('all operations return a new model (immutability)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<CartMsg['type']>(
            'ADD_ITEM',
            'REMOVE_ITEM',
            'CLEAR_CART',
            'INCREMENT_ITEM',
            'DECREMENT_ITEM',
            'UPDATE_QUANTITY',
            'HYDRATE_FROM_STORAGE'
          ),
          (msgType) => {
            const model: CartModel = {
              items: [{ product: mockProduct1, quantity: 2 }],
            }

            let result: CartModel = model
            switch (msgType) {
              case 'ADD_ITEM':
                result = update(model, { type: 'ADD_ITEM', product: mockProduct2 })
                break
              case 'REMOVE_ITEM':
                result = update(model, { type: 'REMOVE_ITEM', productId: '1' })
                break
              case 'CLEAR_CART':
                result = update(model, { type: 'CLEAR_CART' })
                break
              case 'INCREMENT_ITEM':
                result = update(model, { type: 'INCREMENT_ITEM', productId: '1' })
                break
              case 'DECREMENT_ITEM':
                result = update(model, { type: 'DECREMENT_ITEM', productId: '1' })
                break
              case 'UPDATE_QUANTITY':
                result = update(model, { type: 'UPDATE_QUANTITY', productId: '1', quantity: 5 })
                break
              case 'HYDRATE_FROM_STORAGE':
                result = update(model, { type: 'HYDRATE_FROM_STORAGE', items: [] })
                break
            }

            // Result should be a different object reference
            expect(result).not.toBe(model)
            expect(result.items).not.toBe(model.items)
          }
        )
      )
    })
  })
})
