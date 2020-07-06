module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true,
    'jest':true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier/flowtype',
    'prettier/react',
    'prettier/standard'
  ],
  'parser':'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'prettier'
  ],
  'settings':{
    'react':{
      'version':'16.13.1'
    }
  },
  'globals':{
    'window': true
  },
  'rules': {
    'no-console':'off',
    'indent': [
      'error',
      2,
      { 
        'SwitchCase': 1,
        'flatTernaryExpressions':false
      }
    ],
    'linebreak-style':'off',
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'off',
      'always'
    ],
    'no-fallthrough':'off',
    'require-atomic-updates':'off',
    'no-extra-boolean-cast':'off',
    'valid-jsdoc':'off',
    'class-methods-use-this':'off',
    'require-await':'off',
    'consistent-return':'off',
    'default-case':'off',
    'dot-notation':'off',
    'no-await-in-loop':'off',
    'no-control-regex':'off',
    'no-prototype-builtins':'off',
    'no-alert':'off',
    'no-div-regex':'off',
    'no-else-return':'off',
    'no-eq-null':'off',
    'no-invalid-this':'off',
    'no-magic-numbers':'off',
    'no-restricted-properties':'off',
    'no-useless-escape':'off',
    'no-useless-return':'off',
    'no-warning-comments':'off',
    'vars-on-top':'off',
    'init-declarations':'off',
    'no-catch-shadow':'off',
    'no-restricted-globals':'off',
    'no-shadow':'off',
    'callback-return':'off',
    'global-require':'off',
    'no-mixed-requires':'off',
    'no-process-env':'off',
    'no-process-exit':'off',
    'no-restricted-modules':'off',
    'no-sync':'off',
    'array-bracket-newline':'off',
    'array-element-newline':'off',
    'brace-style':'off',
    'camelcase':'off',
    'capitalized-comments':'off',
    'comma-dangle':'off',
    'consistent-this':'off',
    'func-names':'off',
    'func-style':'off',
    'id-blacklist':'off',
    'id-length':'off',
    'id-match':'off',
    'line-comment-position':'off',
    'max-len':'off',
    'max-lines':'off',
    'max-statements':'off',
    'max-statements-per-line':'off',
    'multiline-ternary':'off',
    'newline-per-chained-call':'off',
    'no-bitwise':'off',
    'no-continue':'off',
    'no-inline-comments':'off',
    'no-lonely-if':'off',
    'no-mixed-operators':'off',
    'no-multi-assign':'off',
    'no-negated-condition':'off',
    'no-nested-ternary':'off',
    'no-plusplus':'off',
    'no-restricted-syntax':'off',
    'no-ternary':'off',
    'no-underscore-dangle':'off',
    'no-unneeded-ternary':'off',
    'object-property-newline':'off',
    'operator-assignment':'off',
    'sort-keys':'off',
    'sort-vars':'off',
    'wrap-regex':'off',
    'no-restricted-imports':'off',
    'prefer-destructuring':'off',
    'prefer-rest-params':'off',
    'react/jsx-indent-props':[
      'warn',
      2
    ],
    'react/prop-types':'off',
    'react/jsx-boolean-value':[
      'warn',
      'always'
    ],
    'react/jsx-props-no-multi-spaces':'error',
    'react/jsx-tag-spacing':[
      'error',
      {
        'closingSlash': 'never',
        'beforeSelfClosing': 'always',
        'afterOpening': 'never',
        'beforeClosing': 'allow'
      }
    ],
    'react/display-name':'off',
    'prettier/prettier': [
      'error',
      {
        'singleQuote': true
      }
    ]
  }
};