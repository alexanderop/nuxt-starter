import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'
import { theme } from './uno.theme'

export default defineConfig({
  presets: [presetWind4()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme,
  shortcuts: [
    ['container', 'w-[min(1100px,calc(100%-2rem))] mx-auto'],
    [
      'focus-ring',
      'outline-none focus-visible:(outline-2 outline-[var(--accent)] outline-offset-3px)',
    ],
    ['shell-surface', 'backdrop-blur-[18px] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)]'],
    [
      'surface-card',
      'rounded-5 border border-border bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] p-5 shadow-[var(--shadow)]',
    ],
    [
      'pill',
      'inline-flex items-center min-h-[2.2rem] px-[0.85rem] border border-border rounded-full bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] text-fg-muted text-[0.95rem]',
    ],
    [
      'site-control',
      'inline-flex items-center justify-center min-h-9 px-3.5 border border-border rounded-full bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] text-fg-muted no-underline transition-[border-color,color,transform,background-color] duration-200 hover:(border-border-strong text-fg -translate-y-px) aria-[current=page]:(border-border-strong text-fg -translate-y-px)',
    ],
    [
      'button-primary',
      'inline-flex items-center justify-center gap-2 min-h-[2.875rem] px-4 border border-transparent rounded-full no-underline text-white bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] shadow-[var(--shadow)] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px',
    ],
    [
      'button-secondary',
      'inline-flex items-center justify-center gap-2 min-h-[2.875rem] px-4 border border-border-strong rounded-full no-underline bg-[color-mix(in_srgb,var(--bg-elevated)_86%,transparent)] text-fg transition-[transform,border-color,background-color] duration-200 hover:(-translate-y-px border-border-strong)',
    ],
  ],
})
