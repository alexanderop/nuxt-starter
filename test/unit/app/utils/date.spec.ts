import { describe, expect, it } from 'vitest'
import { DAY_MS, parseIsoDate, toIsoDate } from '~/utils/date'

describe('DAY_MS', () => {
  it('equals 86_400_000', () => {
    expect(DAY_MS).toBe(86_400_000)
  })
})

describe('parseIsoDate', () => {
  it('returns a UTC midnight date', () => {
    const d = parseIsoDate('2024-03-15')
    expect(d.toISOString()).toBe('2024-03-15T00:00:00.000Z')
  })
})

describe('toIsoDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date('2024-03-15T00:00:00.000Z'))).toBe('2024-03-15')
  })

  it('roundtrips with parseIsoDate', () => {
    const iso = '2024-12-31'
    expect(toIsoDate(parseIsoDate(iso))).toBe(iso)
  })
})
