module.exports = {
  'presets': [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  'plugins': [
    '@babel/plugin-transform-runtime',
    // Stage 2
    [
      '@babel/plugin-proposal-decorators',
      {
        'legacy': true
      }
    ],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-syntax-dynamic-import',
    // Stage 3
    '@babel/plugin-syntax-import-meta',
    [
      '@babel/plugin-proposal-class-properties',
      {
        'loose': false
      }
    ],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-json-strings',
    // TypeScript
    [
      '@babel/plugin-transform-typescript',
      {
        'isTSX': true,
        'allExtensions':true
      }
    ]
  ]
}