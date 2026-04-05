export const DAY_MS = 86_400_000

export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
