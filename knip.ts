import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['modules/*.ts'],
  project: ['**/*.{ts,vue}', '!test/fixtures/**', '!test/nuxt/fixture/**'],
  ignoreDependencies: ['@vueuse/core'],
}

export default config
