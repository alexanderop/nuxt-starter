import type { Theme } from '@unocss/preset-wind4/theme'

export const theme: Theme = {
  spacing: {
    DEFAULT: '4px',
  },
  font: {
    sans: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  colors: {
    bg: {
      DEFAULT: 'var(--bg)',
      subtle: 'var(--bg-subtle)',
      muted: 'var(--bg-muted)',
      elevated: 'var(--bg-elevated)',
    },
    fg: {
      DEFAULT: 'var(--fg)',
      muted: 'var(--fg-muted)',
    },
    border: {
      DEFAULT: 'var(--border)',
      strong: 'var(--border-strong)',
    },
    accent: {
      DEFAULT: 'var(--accent)',
      strong: 'var(--accent-strong)',
    },
  },
  animation: {
    keyframes: {
      'fade-in': '{from { opacity: 0 } to { opacity: 1 }}',
      'slide-up':
        '{from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) }}',
    },
    durations: {
      'fade-in': '0.25s',
      'slide-up': '0.4s',
    },
    timingFns: {
      'fade-in': 'ease-out',
      'slide-up': 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
  },
}
