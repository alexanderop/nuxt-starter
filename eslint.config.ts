/**
 * Secondary ESLint config — Vue-specific rules only.
 *
 * Oxlint (via `vp lint`) handles core JS/TS, unicorn, and basic Vue rules.
 * This config adds the Vue template and component API rules that Oxlint
 * does not support. Run with `pnpm lint:eslint`.
 */
import eslintPluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.nitro/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.data/**',
      '**/.cache/**',
      '**/.lighthouseci/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },

  {
    extends: [...eslintPluginVue.configs['flat/recommended']],
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // ── Disable rules already handled by Oxlint ──────────────────
      // Oxlint covers these via its vue plugin or categories
      'vue/no-arrow-functions-in-watch': 'off',
      'vue/no-deprecated-destroyed-lifecycle': 'off',
      'vue/no-export-in-script-setup': 'off',
      'vue/no-lifecycle-after-await': 'off',
      'vue/prefer-import-from-vue': 'off',
      'vue/valid-define-emits': 'off',
      'vue/valid-define-props': 'off',
      // Oxlint handles define-props-destructuring
      'vue/define-props-destructuring': 'off',

      // ── Disable opinionated defaults from flat/recommended ───────
      // These conflict with project conventions or are too noisy
      'vue/html-self-closing': 'off', // formatter handles this
      'vue/max-attributes-per-line': 'off', // formatter handles this
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-indent': 'off', // formatter handles this
      'vue/html-closing-bracket-newline': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/require-default-prop': 'off', // TS handles defaults
      'vue/require-prop-types': 'off', // TS handles types
      'vue/multi-word-component-names': 'off', // Nuxt pages use single words

      // ── Dead code detection ──────────────────────────────────────
      'vue/no-unused-properties': [
        'error',
        {
          groups: ['props', 'data', 'computed', 'methods'],
        },
      ],
      'vue/no-unused-refs': 'error',
      'vue/no-unused-emit-declarations': 'error',

      // ── Vue 3.5+ API enforcement ────────────────────────────────
      'vue/prefer-use-template-ref': 'error',

      // ── Component naming ─────────────────────────────────────────
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
        },
      ],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/attribute-hyphenation': ['error', 'always'],

      // ── Template quality ─────────────────────────────────────────
      'vue/max-template-depth': ['warn', { maxDepth: 8 }],

      // ── Explicit component APIs ──────────────────────────────────
      'vue/require-explicit-slots': 'warn',
    },
  },
)
