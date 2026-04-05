module.exports = {
  ci: {
    collect: {
      startServerCommand: 'PORT=4173 HOST=127.0.0.1 node .output/server/index.mjs',
      startServerReadyPattern: 'Listening',
      url: ['http://127.0.0.1:4173/'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0 }],
      },
    },
  },
}
