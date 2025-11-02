import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { update } from '../productsUpdate'
import { initialModel, type ProductsModel, type ProductsMsg } from '../productsModel'
import type { Product } from '../../../schemas/product'
import type { ProductFilter, ProductSort } from '../../../schemas/filters'

describe('productsUpdate', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 1999,
      category: 'electronics',
      image: 'https://example.com/image1.jpg',
      stock: 10,
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 2999,
      category: 'clothing',
      image: 'https://example.com/image2.jpg',
      stock: 5,
      rating: 4.0,
    },
  ]

  describe('SET_FILTER', () => {
    it('sets filter criteria', () => {
      const filter: ProductFilter = {
        category: 'electronics',
        search: 'test',
        inStock: true,
      }

      const result = update(initialModel, {
        type: 'SET_FILTER',
        filter,
      })

      expect(result.currentFilter).toEqual(filter)
    })

    it('replaces existing filter completely', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: {
          category: 'clothing',
          search: 'old search',
          inStock: false,
        },
      }

      const newFilter: ProductFilter = {
        category: 'electronics',
        inStock: true,
      }

      const result = update(model, {
        type: 'SET_FILTER',
        filter: newFilter,
      })

      expect(result.currentFilter).toEqual(newFilter)
    })

    it('does not modify other state properties', () => {
      const model: ProductsModel = {
        ...initialModel,
        products: mockProducts,
        loading: false,
        error: null,
      }

      const result = update(model, {
        type: 'SET_FILTER',
        filter: { category: 'electronics' },
      })

      expect(result.products).toBe(model.products)
      expect(result.loading).toBe(model.loading)
      expect(result.error).toBe(model.error)
      expect(result.currentSort).toBe(model.currentSort)
    })

    it('does not mutate original model', () => {
      const model = { ...initialModel }
      const originalFilter = model.currentFilter

      update(model, {
        type: 'SET_FILTER',
        filter: { category: 'electronics' },
      })

      expect(model.currentFilter).toBe(originalFilter)
    })
  })

  describe('SET_SORT', () => {
    it('sets sort option', () => {
      const result = update(initialModel, {
        type: 'SET_SORT',
        sort: 'price-desc',
      })

      expect(result.currentSort).toBe('price-desc')
    })

    it('replaces existing sort', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentSort: 'name-asc',
      }

      const result = update(model, {
        type: 'SET_SORT',
        sort: 'price-desc',
      })

      expect(result.currentSort).toBe('price-desc')
    })

    it('handles all valid sort options', () => {
      const sortOptions: ProductSort[] = [
        'name-asc',
        'name-desc',
        'price-asc',
        'price-desc',
        'rating-desc',
      ]

      sortOptions.forEach((sort) => {
        const result = update(initialModel, {
          type: 'SET_SORT',
          sort,
        })

        expect(result.currentSort).toBe(sort)
      })
    })

    it('does not modify other state properties', () => {
      const model: ProductsModel = {
        ...initialModel,
        products: mockProducts,
        currentFilter: { category: 'electronics' },
      }

      const result = update(model, {
        type: 'SET_SORT',
        sort: 'price-desc',
      })

      expect(result.products).toBe(model.products)
      expect(result.currentFilter).toBe(model.currentFilter)
      expect(result.loading).toBe(model.loading)
      expect(result.error).toBe(model.error)
    })

    it('does not mutate original model', () => {
      const model = { ...initialModel }
      const originalSort = model.currentSort

      update(model, {
        type: 'SET_SORT',
        sort: 'price-desc',
      })

      expect(model.currentSort).toBe(originalSort)
    })
  })

  describe('RESET_FILTER', () => {
    it('resets filter to initial state', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: {
          category: 'electronics',
          search: 'test',
          inStock: true,
        },
      }

      const result = update(model, { type: 'RESET_FILTER' })

      expect(result.currentFilter).toEqual(initialModel.currentFilter)
    })

    it('resets sort to initial state', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentSort: 'price-desc',
      }

      const result = update(model, { type: 'RESET_FILTER' })

      expect(result.currentSort).toEqual(initialModel.currentSort)
    })

    it('resets both filter and sort together', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: {
          category: 'electronics',
          search: 'test',
        },
        currentSort: 'price-desc',
      }

      const result = update(model, { type: 'RESET_FILTER' })

      expect(result.currentFilter).toEqual(initialModel.currentFilter)
      expect(result.currentSort).toEqual(initialModel.currentSort)
    })

    it('does not modify products, loading, or error', () => {
      const model: ProductsModel = {
        ...initialModel,
        products: mockProducts,
        loading: true,
        error: 'Some error',
      }

      const result = update(model, { type: 'RESET_FILTER' })

      expect(result.products).toBe(model.products)
      expect(result.loading).toBe(model.loading)
      expect(result.error).toBe(model.error)
    })

    it('is idempotent (calling twice has same effect as once)', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: { category: 'electronics' },
        currentSort: 'price-desc',
      }

      const result1 = update(model, { type: 'RESET_FILTER' })
      const result2 = update(result1, { type: 'RESET_FILTER' })

      expect(result2).toEqual(result1)
    })

    it('does not mutate original model', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: { category: 'electronics' },
      }
      const originalFilter = model.currentFilter

      update(model, { type: 'RESET_FILTER' })

      expect(model.currentFilter).toBe(originalFilter)
    })
  })

  describe('FETCH_REQUEST', () => {
    it('sets loading to true', () => {
      const result = update(initialModel, { type: 'FETCH_REQUEST' })

      expect(result.loading).toBe(true)
    })

    it('clears error', () => {
      const model: ProductsModel = {
        ...initialModel,
        error: 'Previous error',
      }

      const result = update(model, { type: 'FETCH_REQUEST' })

      expect(result.error).toBe(null)
    })

    it('does not modify products or filter/sort', () => {
      const model: ProductsModel = {
        ...initialModel,
        products: mockProducts,
        currentFilter: { category: 'electronics' },
        currentSort: 'price-desc',
      }

      const result = update(model, { type: 'FETCH_REQUEST' })

      expect(result.products).toBe(model.products)
      expect(result.currentFilter).toBe(model.currentFilter)
      expect(result.currentSort).toBe(model.currentSort)
    })

    it('does not mutate original model', () => {
      const model = { ...initialModel }
      const originalLoading = model.loading

      update(model, { type: 'FETCH_REQUEST' })

      expect(model.loading).toBe(originalLoading)
    })
  })

  describe('FETCH_SUCCESS', () => {
    it('sets products to fetched data', () => {
      const result = update(initialModel, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })

      expect(result.products).toEqual(mockProducts)
    })

    it('sets loading to false', () => {
      const model: ProductsModel = {
        ...initialModel,
        loading: true,
      }

      const result = update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })

      expect(result.loading).toBe(false)
    })

    it('clears error', () => {
      const model: ProductsModel = {
        ...initialModel,
        error: 'Fetch failed',
        loading: true,
      }

      const result = update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })

      expect(result.error).toBe(null)
    })

    it('replaces existing products', () => {
      const oldProducts: Product[] = [
        {
          id: 'old-1',
          name: 'Old Product',
          description: 'Old',
          price: 999,
          category: 'home',
          image: 'https://example.com/old.jpg',
          stock: 1,
        },
      ]

      const model: ProductsModel = {
        ...initialModel,
        products: oldProducts,
        loading: true,
      }

      const result = update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })

      expect(result.products).toEqual(mockProducts)
      expect(result.products).not.toEqual(oldProducts)
    })

    it('handles empty products array', () => {
      const result = update(initialModel, {
        type: 'FETCH_SUCCESS',
        products: [],
      })

      expect(result.products).toEqual([])
      expect(result.loading).toBe(false)
      expect(result.error).toBe(null)
    })

    it('does not modify filter or sort', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: { category: 'electronics' },
        currentSort: 'price-desc',
      }

      const result = update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })

      expect(result.currentFilter).toBe(model.currentFilter)
      expect(result.currentSort).toBe(model.currentSort)
    })

    it('does not mutate original model', () => {
      const model = { ...initialModel, loading: true }
      const originalProducts = model.products

      update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })

      expect(model.products).toBe(originalProducts)
      expect(model.loading).toBe(true)
    })
  })

  describe('FETCH_FAILURE', () => {
    it('sets error message', () => {
      const errorMessage = 'Failed to fetch products'

      const result = update(initialModel, {
        type: 'FETCH_FAILURE',
        error: errorMessage,
      })

      expect(result.error).toBe(errorMessage)
    })

    it('sets loading to false', () => {
      const model: ProductsModel = {
        ...initialModel,
        loading: true,
      }

      const result = update(model, {
        type: 'FETCH_FAILURE',
        error: 'Error',
      })

      expect(result.loading).toBe(false)
    })

    it('does not modify products', () => {
      const model: ProductsModel = {
        ...initialModel,
        products: mockProducts,
        loading: true,
      }

      const result = update(model, {
        type: 'FETCH_FAILURE',
        error: 'Error',
      })

      expect(result.products).toBe(model.products)
    })

    it('does not modify filter or sort', () => {
      const model: ProductsModel = {
        ...initialModel,
        currentFilter: { category: 'electronics' },
        currentSort: 'price-desc',
        loading: true,
      }

      const result = update(model, {
        type: 'FETCH_FAILURE',
        error: 'Error',
      })

      expect(result.currentFilter).toBe(model.currentFilter)
      expect(result.currentSort).toBe(model.currentSort)
    })

    it('does not mutate original model', () => {
      const model = { ...initialModel, loading: true }
      const originalError = model.error

      update(model, {
        type: 'FETCH_FAILURE',
        error: 'New error',
      })

      expect(model.error).toBe(originalError)
      expect(model.loading).toBe(true)
    })
  })

  describe('fetch lifecycle', () => {
    it('handles full success flow (request -> success)', () => {
      let model = initialModel

      // Start fetch
      model = update(model, { type: 'FETCH_REQUEST' })
      expect(model.loading).toBe(true)
      expect(model.error).toBe(null)

      // Fetch succeeds
      model = update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })
      expect(model.loading).toBe(false)
      expect(model.products).toEqual(mockProducts)
      expect(model.error).toBe(null)
    })

    it('handles full failure flow (request -> failure)', () => {
      let model = initialModel

      // Start fetch
      model = update(model, { type: 'FETCH_REQUEST' })
      expect(model.loading).toBe(true)

      // Fetch fails
      model = update(model, {
        type: 'FETCH_FAILURE',
        error: 'Network error',
      })
      expect(model.loading).toBe(false)
      expect(model.error).toBe('Network error')
      expect(model.products).toEqual([])
    })

    it('handles retry after failure (failure -> request -> success)', () => {
      let model: ProductsModel = {
        ...initialModel,
        error: 'Previous error',
      }

      // Retry fetch
      model = update(model, { type: 'FETCH_REQUEST' })
      expect(model.error).toBe(null)
      expect(model.loading).toBe(true)

      // Success this time
      model = update(model, {
        type: 'FETCH_SUCCESS',
        products: mockProducts,
      })
      expect(model.loading).toBe(false)
      expect(model.error).toBe(null)
      expect(model.products).toEqual(mockProducts)
    })
  })

  describe('property based tests', () => {
    it('all operations return a new model (immutability)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<ProductsMsg['type']>(
            'SET_FILTER',
            'SET_SORT',
            'RESET_FILTER',
            'FETCH_REQUEST',
            'FETCH_SUCCESS',
            'FETCH_FAILURE'
          ),
          (msgType) => {
            const model: ProductsModel = {
              ...initialModel,
              products: mockProducts,
            }

            let result: ProductsModel = model
            switch (msgType) {
              case 'SET_FILTER':
                result = update(model, {
                  type: 'SET_FILTER',
                  filter: { category: 'electronics' },
                })
                break
              case 'SET_SORT':
                result = update(model, { type: 'SET_SORT', sort: 'price-desc' })
                break
              case 'RESET_FILTER':
                result = update(model, { type: 'RESET_FILTER' })
                break
              case 'FETCH_REQUEST':
                result = update(model, { type: 'FETCH_REQUEST' })
                break
              case 'FETCH_SUCCESS':
                result = update(model, {
                  type: 'FETCH_SUCCESS',
                  products: mockProducts,
                })
                break
              case 'FETCH_FAILURE':
                result = update(model, { type: 'FETCH_FAILURE', error: 'Error' })
                break
            }

            // Result should be a different object reference
            expect(result).not.toBe(model)
          }
        )
      )
    })

    it('reset always returns to initial filter and sort', () => {
      fc.assert(
        fc.property(
          fc.record({
            category: fc.constantFrom('electronics', 'clothing', 'books', 'home', 'sports'),
            search: fc.string({ maxLength: 50 }),
          }),
          fc.constantFrom<ProductSort>('name-asc', 'name-desc', 'price-asc', 'price-desc', 'rating-desc'),
          (filter, sort) => {
            let model = initialModel

            // Apply random filter and sort
            model = update(model, { type: 'SET_FILTER', filter })
            model = update(model, { type: 'SET_SORT', sort })

            // Reset
            model = update(model, { type: 'RESET_FILTER' })

            expect(model.currentFilter).toEqual(initialModel.currentFilter)
            expect(model.currentSort).toEqual(initialModel.currentSort)
          }
        )
      )
    })

    it('loading is false after success or failure', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'FETCH_SUCCESS' | 'FETCH_FAILURE'>('FETCH_SUCCESS', 'FETCH_FAILURE'),
          (resultType) => {
            let model: ProductsModel = {
              ...initialModel,
              loading: true,
            }

            if (resultType === 'FETCH_SUCCESS') {
              model = update(model, {
                type: 'FETCH_SUCCESS',
                products: mockProducts,
              })
            } else {
              model = update(model, {
                type: 'FETCH_FAILURE',
                error: 'Error',
              })
            }

            expect(model.loading).toBe(false)
          }
        )
      )
    })

    it('error is null after request or success', () => {
      fc.assert(
        fc.property(fc.string(), (errorMessage) => {
          let model: ProductsModel = {
            ...initialModel,
            error: errorMessage,
          }

          // Request clears error
          model = update(model, { type: 'FETCH_REQUEST' })
          expect(model.error).toBe(null)

          // Set error again
          model = update(model, { type: 'FETCH_FAILURE', error: errorMessage })
          expect(model.error).toBe(errorMessage)

          // Success clears error
          model = update(model, {
            type: 'FETCH_SUCCESS',
            products: mockProducts,
          })
          expect(model.error).toBe(null)
        })
      )
    })
  })

  describe('initialModel', () => {
    it('has correct initial values', () => {
      expect(initialModel.products).toEqual([])
      expect(initialModel.loading).toBe(false)
      expect(initialModel.error).toBe(null)
      expect(initialModel.currentFilter).toEqual({
        search: undefined,
        category: 'all',
        inStock: false,
      })
      expect(initialModel.currentSort).toBe('name-asc')
    })
  })
})
