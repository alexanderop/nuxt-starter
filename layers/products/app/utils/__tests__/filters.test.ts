import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { filterProducts, sortProducts } from '../filters'
import type { Product } from '../../schemas/product'
import type { ProductFilter, ProductSort } from '../../schemas/filters'

describe('product filters', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 9999,
      category: 'electronics',
      image: 'https://example.com/headphones.jpg',
      stock: 15,
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear',
      price: 1999,
      category: 'clothing',
      image: 'https://example.com/tshirt.jpg',
      stock: 50,
      rating: 4.0,
    },
    {
      id: '3',
      name: 'JavaScript Book',
      description: 'Learn JavaScript from scratch with this comprehensive guide',
      price: 2999,
      category: 'books',
      image: 'https://example.com/book.jpg',
      stock: 0,
      rating: 4.8,
    },
    {
      id: '4',
      name: 'Desk Lamp',
      description: 'Modern LED desk lamp with adjustable brightness',
      price: 3999,
      category: 'home',
      image: 'https://example.com/lamp.jpg',
      stock: 8,
      rating: 3.5,
    },
    {
      id: '5',
      name: 'Running Shoes',
      description: 'Lightweight running shoes for maximum performance',
      price: 7999,
      category: 'sports',
      image: 'https://example.com/shoes.jpg',
      stock: 20,
      rating: 4.7,
    },
    {
      id: '6',
      name: 'Smartwatch',
      description: 'Feature-rich smartwatch with fitness tracking',
      price: 19999,
      category: 'electronics',
      image: 'https://example.com/watch.jpg',
      stock: 5,
    },
  ]

  describe('filterProducts', () => {
    describe('search filtering', () => {
      it('filters by name (case-insensitive)', () => {
        const filter: ProductFilter = { search: 'headphones' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Wireless Headphones')
      })

      it('filters by name with different case', () => {
        const filter: ProductFilter = { search: 'HEADPHONES' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Wireless Headphones')
      })

      it('filters by description', () => {
        const filter: ProductFilter = { search: 'fitness' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Smartwatch')
      })

      it('filters by partial match', () => {
        const filter: ProductFilter = { search: 'shirt' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Cotton T-Shirt')
      })

      it('returns all products when search is empty string', () => {
        const filter: ProductFilter = { search: '' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })

      it('returns all products when search is whitespace', () => {
        const filter: ProductFilter = { search: '   ' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })

      it('returns empty array when no matches found', () => {
        const filter: ProductFilter = { search: 'nonexistent' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(0)
      })

      it('handles undefined search', () => {
        const filter: ProductFilter = { search: undefined }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })
    })

    describe('category filtering', () => {
      it('filters by category', () => {
        const filter: ProductFilter = { category: 'electronics' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(2)
        expect(result.every((p) => p.category === 'electronics')).toBe(true)
      })

      it('returns all products when category is "all"', () => {
        const filter: ProductFilter = { category: 'all' }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })

      it('handles category with no products', () => {
        const filter: ProductFilter = { category: 'electronics' }
        const result = filterProducts(
          mockProducts.filter((p) => p.category !== 'electronics'),
          filter
        )

        expect(result).toHaveLength(0)
      })

      it('handles undefined category', () => {
        const filter: ProductFilter = { category: undefined }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })
    })

    describe('price range filtering', () => {
      it('filters by price range', () => {
        const filter: ProductFilter = { priceRange: { min: 2000, max: 5000 } }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(2) // Book (2999), Lamp (3999) - T-Shirt (1999) is below min
        expect(result.every((p) => p.price >= 2000 && p.price <= 5000)).toBe(true)
      })

      it('includes items at min boundary', () => {
        const filter: ProductFilter = { priceRange: { min: 1999, max: 5000 } }
        const result = filterProducts(mockProducts, filter)

        const tShirt = result.find((p) => p.name === 'Cotton T-Shirt')
        expect(tShirt).toBeDefined()
      })

      it('includes items at max boundary', () => {
        const filter: ProductFilter = { priceRange: { min: 1000, max: 1999 } }
        const result = filterProducts(mockProducts, filter)

        const tShirt = result.find((p) => p.name === 'Cotton T-Shirt')
        expect(tShirt).toBeDefined()
      })

      it('handles price range with no matches', () => {
        const filter: ProductFilter = { priceRange: { min: 100, max: 500 } }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(0)
      })

      it('handles undefined price range', () => {
        const filter: ProductFilter = { priceRange: undefined }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })
    })

    describe('minimum rating filtering', () => {
      it('filters by minimum rating', () => {
        const filter: ProductFilter = { minRating: 4.5 }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(3) // Headphones (4.5), Book (4.8), Shoes (4.7)
        expect(result.every((p) => (p.rating ?? 0) >= 4.5)).toBe(true)
      })

      it('includes items at exact rating', () => {
        const filter: ProductFilter = { minRating: 4.5 }
        const result = filterProducts(mockProducts, filter)

        const headphones = result.find((p) => p.name === 'Wireless Headphones')
        expect(headphones).toBeDefined()
      })

      it('treats products without rating as 0', () => {
        const filter: ProductFilter = { minRating: 0 }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })

      it('filters out products without rating when minRating > 0', () => {
        const filter: ProductFilter = { minRating: 1 }
        const result = filterProducts(mockProducts, filter)

        const smartwatch = result.find((p) => p.name === 'Smartwatch')
        expect(smartwatch).toBeUndefined()
      })

      it('handles undefined minRating', () => {
        const filter: ProductFilter = { minRating: undefined }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })
    })

    describe('stock filtering', () => {
      it('filters for in-stock items only', () => {
        const filter: ProductFilter = { inStock: true }
        const result = filterProducts(mockProducts, filter)

        expect(result.every((p) => p.stock > 0)).toBe(true)
        expect(result.find((p) => p.name === 'JavaScript Book')).toBeUndefined()
      })

      it('returns all products when inStock is false', () => {
        const filter: ProductFilter = { inStock: false }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })

      it('returns all products when inStock is undefined', () => {
        const filter: ProductFilter = { inStock: undefined }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(mockProducts.length)
      })
    })

    describe('combined filters', () => {
      it('applies multiple filters together (AND logic)', () => {
        const filter: ProductFilter = {
          category: 'electronics',
          priceRange: { min: 5000, max: 15000 },
          inStock: true,
        }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Wireless Headphones')
        expect(result[0].category).toBe('electronics')
        expect(result[0].price).toBeGreaterThanOrEqual(5000)
        expect(result[0].price).toBeLessThanOrEqual(15000)
        expect(result[0].stock).toBeGreaterThan(0)
      })

      it('filters by search and category', () => {
        const filter: ProductFilter = {
          search: 'shirt',
          category: 'clothing',
        }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Cotton T-Shirt')
      })

      it('returns empty array when combined filters match nothing', () => {
        const filter: ProductFilter = {
          category: 'electronics',
          search: 'shirt',
        }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(0)
      })

      it('handles all filters together', () => {
        const filter: ProductFilter = {
          search: 'headphones',
          category: 'electronics',
          priceRange: { min: 5000, max: 15000 },
          minRating: 4.0,
          inStock: true,
        }
        const result = filterProducts(mockProducts, filter)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Wireless Headphones')
      })
    })

    describe('immutability', () => {
      it('does not mutate the input array', () => {
        const original = [...mockProducts]
        const filter: ProductFilter = { category: 'electronics' }

        filterProducts(mockProducts, filter)

        expect(mockProducts).toEqual(original)
      })
    })
  })

  describe('sortProducts', () => {
    describe('name sorting', () => {
      it('sorts by name ascending (A-Z)', () => {
        const result = sortProducts(mockProducts, 'name-asc')

        expect(result[0].name).toBe('Cotton T-Shirt')
        expect(result[result.length - 1].name).toBe('Wireless Headphones')

        // Verify full sort order
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].name.localeCompare(result[i + 1].name)).toBeLessThanOrEqual(0)
        }
      })

      it('sorts by name descending (Z-A)', () => {
        const result = sortProducts(mockProducts, 'name-desc')

        expect(result[0].name).toBe('Wireless Headphones')
        expect(result[result.length - 1].name).toBe('Cotton T-Shirt')

        // Verify full sort order
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].name.localeCompare(result[i + 1].name)).toBeGreaterThanOrEqual(0)
        }
      })
    })

    describe('price sorting', () => {
      it('sorts by price ascending (low to high)', () => {
        const result = sortProducts(mockProducts, 'price-asc')

        expect(result[0].name).toBe('Cotton T-Shirt') // 1999
        expect(result[result.length - 1].name).toBe('Smartwatch') // 19999

        // Verify full sort order
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].price).toBeLessThanOrEqual(result[i + 1].price)
        }
      })

      it('sorts by price descending (high to low)', () => {
        const result = sortProducts(mockProducts, 'price-desc')

        expect(result[0].name).toBe('Smartwatch') // 19999
        expect(result[result.length - 1].name).toBe('Cotton T-Shirt') // 1999

        // Verify full sort order
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].price).toBeGreaterThanOrEqual(result[i + 1].price)
        }
      })
    })

    describe('rating sorting', () => {
      it('sorts by rating descending (high to low)', () => {
        const result = sortProducts(mockProducts, 'rating-desc')

        expect(result[0].name).toBe('JavaScript Book') // 4.8
        expect(result[result.length - 1].name).toBe('Smartwatch') // undefined (treated as 0)

        // Verify full sort order (treating undefined as 0)
        for (let i = 0; i < result.length - 1; i++) {
          const ratingA = result[i].rating ?? 0
          const ratingB = result[i + 1].rating ?? 0
          expect(ratingA).toBeGreaterThanOrEqual(ratingB)
        }
      })

      it('treats products without rating as 0', () => {
        const result = sortProducts(mockProducts, 'rating-desc')

        const smartwatch = result.find((p) => p.name === 'Smartwatch')
        expect(smartwatch).toBeDefined()

        // Smartwatch should be last or near-last (rating = undefined = 0)
        const index = result.indexOf(smartwatch!)
        expect(index).toBe(result.length - 1)
      })
    })

    describe('immutability', () => {
      it('does not mutate the input array', () => {
        const original = [...mockProducts]

        sortProducts(mockProducts, 'price-asc')

        expect(mockProducts).toEqual(original)
      })

      it('returns a new array', () => {
        const result = sortProducts(mockProducts, 'price-asc')

        expect(result).not.toBe(mockProducts)
      })
    })

    describe('stability', () => {
      it('maintains relative order for items with same value', () => {
        const products: Product[] = [
          { ...mockProducts[0], price: 1000 },
          { ...mockProducts[1], price: 1000 },
          { ...mockProducts[2], price: 2000 },
        ]

        const result = sortProducts(products, 'price-asc')

        // Items with same price should maintain original relative order
        expect(result[0].id).toBe(products[0].id)
        expect(result[1].id).toBe(products[1].id)
      })
    })
  })

  describe('chaining filter and sort', () => {
    it('filters then sorts correctly', () => {
      const filter: ProductFilter = { category: 'electronics' }
      const filtered = filterProducts(mockProducts, filter)
      const result = sortProducts(filtered, 'price-asc')

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Wireless Headphones') // 9999
      expect(result[1].name).toBe('Smartwatch') // 19999
    })

    it('handles empty results after filtering', () => {
      const filter: ProductFilter = { category: 'nonexistent' as any }
      const filtered = filterProducts(mockProducts, filter)
      const result = sortProducts(filtered, 'price-asc')

      expect(result).toHaveLength(0)
    })
  })

  describe('property based tests', () => {
    it('filtering never adds items (result length <= input length)', () => {
      fc.assert(
        fc.property(
          fc.record({
            search: fc.option(fc.string(), { nil: undefined }),
            category: fc.option(
              fc.constantFrom('electronics', 'clothing', 'books', 'home', 'sports', 'all'),
              { nil: undefined }
            ),
            inStock: fc.option(fc.boolean(), { nil: undefined }),
          }),
          (filter) => {
            const result = filterProducts(mockProducts, filter as ProductFilter)
            expect(result.length).toBeLessThanOrEqual(mockProducts.length)
          }
        )
      )
    })

    it('sorting maintains array length', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<ProductSort>('name-asc', 'name-desc', 'price-asc', 'price-desc', 'rating-desc'),
          (sort) => {
            const result = sortProducts(mockProducts, sort)
            expect(result.length).toBe(mockProducts.length)
          }
        )
      )
    })

    it('filtering by category only returns that category', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('electronics', 'clothing', 'books', 'home', 'sports'),
          (category) => {
            const filter: ProductFilter = { category }
            const result = filterProducts(mockProducts, filter)

            expect(result.every((p) => p.category === category)).toBe(true)
          }
        )
      )
    })

    it('price range filtering respects bounds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20000 }),
          fc.integer({ min: 0, max: 20000 }),
          (min, max) => {
            // Ensure min <= max
            const [actualMin, actualMax] = min <= max ? [min, max] : [max, min]

            const filter: ProductFilter = {
              priceRange: { min: actualMin, max: actualMax },
            }
            const result = filterProducts(mockProducts, filter)

            expect(
              result.every((p) => p.price >= actualMin && p.price <= actualMax)
            ).toBe(true)
          }
        )
      )
    })

    it('sorting by price-asc produces ascending order', () => {
      fc.assert(
        fc.property(fc.constant(mockProducts), (products) => {
          const result = sortProducts(products, 'price-asc')

          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].price).toBeLessThanOrEqual(result[i + 1].price)
          }
        })
      )
    })

    it('sorting by price-desc produces descending order', () => {
      fc.assert(
        fc.property(fc.constant(mockProducts), (products) => {
          const result = sortProducts(products, 'price-desc')

          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].price).toBeGreaterThanOrEqual(result[i + 1].price)
          }
        })
      )
    })
  })
})
