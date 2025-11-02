import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatCurrency, parseCurrency } from '../currency'

describe('currency utilities', () => {
  describe('formatCurrency', () => {
    it('formats cents to USD currency string', () => {
      expect(formatCurrency(1999)).toBe('$19.99')
      expect(formatCurrency(2999)).toBe('$29.99')
      expect(formatCurrency(100)).toBe('$1.00')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles zero cents', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles single digit cents', () => {
      expect(formatCurrency(5)).toBe('$0.05')
      expect(formatCurrency(50)).toBe('$0.50')
    })

    it('handles whole dollar amounts', () => {
      expect(formatCurrency(100)).toBe('$1.00')
      expect(formatCurrency(1000)).toBe('$10.00')
      expect(formatCurrency(10000)).toBe('$100.00')
    })

    it('handles large amounts with comma separators', () => {
      expect(formatCurrency(100000)).toBe('$1,000.00')
      expect(formatCurrency(1000000)).toBe('$10,000.00')
      expect(formatCurrency(123456789)).toBe('$1,234,567.89')
    })

    it('handles negative amounts', () => {
      expect(formatCurrency(-1999)).toBe('-$19.99')
      expect(formatCurrency(-100)).toBe('-$1.00')
    })

    it('always includes two decimal places', () => {
      const result = formatCurrency(1000)
      expect(result).toMatch(/\.\d{2}$/)
    })

    it('always starts with $ sign (for positive amounts)', () => {
      const result = formatCurrency(1999)
      expect(result).toMatch(/^\$/)
    })
  })

  describe('parseCurrency', () => {
    it('parses currency string with $ sign to cents', () => {
      expect(parseCurrency('$19.99')).toBe(1999)
      expect(parseCurrency('$29.99')).toBe(2999)
      expect(parseCurrency('$1.00')).toBe(100)
      expect(parseCurrency('$0.00')).toBe(0)
    })

    it('parses currency string without $ sign', () => {
      expect(parseCurrency('19.99')).toBe(1999)
      expect(parseCurrency('29.99')).toBe(2999)
      expect(parseCurrency('1.00')).toBe(100)
      expect(parseCurrency('0.00')).toBe(0)
    })

    it('parses strings with comma separators', () => {
      expect(parseCurrency('$1,000.00')).toBe(100000)
      expect(parseCurrency('$10,000.00')).toBe(1000000)
      expect(parseCurrency('1,234.56')).toBe(123456)
    })

    it('parses strings with spaces', () => {
      expect(parseCurrency('$ 19.99')).toBe(1999)
      expect(parseCurrency('$  19.99')).toBe(1999)
    })

    it('handles whole dollar amounts', () => {
      expect(parseCurrency('$10')).toBe(1000)
      expect(parseCurrency('100')).toBe(10000)
    })

    it('handles single decimal place (rounds)', () => {
      expect(parseCurrency('$19.9')).toBe(1990)
      expect(parseCurrency('$19.5')).toBe(1950)
    })

    it('rounds to nearest cent for precision issues', () => {
      expect(parseCurrency('$19.999')).toBe(2000)
      expect(parseCurrency('$19.994')).toBe(1999)
      expect(parseCurrency('$19.995')).toBe(2000)
    })

    it('handles negative amounts', () => {
      expect(parseCurrency('-$19.99')).toBe(-1999)
      expect(parseCurrency('-19.99')).toBe(-1999)
    })

    it('handles zero', () => {
      expect(parseCurrency('$0')).toBe(0)
      expect(parseCurrency('0')).toBe(0)
      expect(parseCurrency('$0.00')).toBe(0)
    })
  })

  describe('round-trip consistency', () => {
    it('format then parse returns original value for valid cents', () => {
      const testValues = [0, 1, 50, 99, 100, 1999, 2999, 10000, 99999, 123456]

      testValues.forEach((cents) => {
        const formatted = formatCurrency(cents)
        const parsed = parseCurrency(formatted)
        expect(parsed).toBe(cents)
      })
    })

    it('parse then format returns consistent string', () => {
      const testStrings = ['$19.99', '$29.99', '$1.00', '$0.00', '$1,000.00']

      testStrings.forEach((str) => {
        const parsed = parseCurrency(str)
        const formatted = formatCurrency(parsed)
        // Remove commas for comparison since small amounts don't have them
        const normalizedOriginal = str.replace(/,/g, '')
        const normalizedFormatted = formatted.replace(/,/g, '')
        expect(normalizedFormatted).toBe(normalizedOriginal)
      })
    })

    it('handles edge case with very small amounts', () => {
      expect(formatCurrency(1)).toBe('$0.01')
      expect(parseCurrency('$0.01')).toBe(1)

      expect(formatCurrency(5)).toBe('$0.05')
      expect(parseCurrency('$0.05')).toBe(5)
    })
  })

  describe('property based tests', () => {
    it('format then parse round-trip preserves value for non-negative cents', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10000000 }), (cents) => {
          const formatted = formatCurrency(cents)
          const parsed = parseCurrency(formatted)
          expect(parsed).toBe(cents)
        })
      )
    })

    it('formatCurrency always returns string with $ prefix (for non-negative)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10000000 }), (cents) => {
          const formatted = formatCurrency(cents)
          expect(formatted).toMatch(/^\$/)
        })
      )
    })

    it('formatCurrency always returns string with two decimal places', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10000000 }), (cents) => {
          const formatted = formatCurrency(cents)
          expect(formatted).toMatch(/\.\d{2}$/)
        })
      )
    })

    it('parseCurrency always returns integer cents', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100000, noNaN: true }).map((dollars) => `$${dollars.toFixed(2)}`),
          (currencyString) => {
            const parsed = parseCurrency(currencyString)
            expect(Number.isInteger(parsed)).toBe(true)
          }
        )
      )
    })

    it('parseCurrency handles any combination of $, commas, and spaces', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (cents, includeDollar, includeComma, includeSpace) => {
            const dollars = cents / 100
            let str = dollars.toFixed(2)

            if (includeComma && dollars >= 1000) {
              str = str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }

            if (includeDollar) {
              str = '$' + str
            }

            if (includeSpace) {
              str = str.replace('$', '$ ')
            }

            const parsed = parseCurrency(str)
            expect(parsed).toBe(cents)
          }
        )
      )
    })

    it('formatting always produces valid parseable strings', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10000000 }), (cents) => {
          const formatted = formatCurrency(cents)

          // Should not throw
          expect(() => parseCurrency(formatted)).not.toThrow()

          // Should round-trip correctly
          const parsed = parseCurrency(formatted)
          expect(parsed).toBe(cents)
        })
      )
    })
  })

  describe('edge cases', () => {
    it('handles very large amounts', () => {
      const largeCents = 999999999 // $9,999,999.99
      const formatted = formatCurrency(largeCents)
      expect(formatted).toBe('$9,999,999.99')
      expect(parseCurrency(formatted)).toBe(largeCents)
    })

    it('handles amounts with many decimal places when parsing', () => {
      expect(parseCurrency('$19.123456')).toBe(1912) // Rounds to 1912 cents
    })

    it('handles empty decimal string', () => {
      expect(parseCurrency('$19.')).toBe(1900)
    })

    it('handles multiple dollar signs (only first matters)', () => {
      // The replace removes all $ signs, so multiple $ work
      expect(parseCurrency('$$19.99')).toBe(1999)
    })
  })
})
