module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prettier/prettier': ['error', { singleQuote: true, trailingComma: 'all', printWidth: 140, arrowParens: 'avoid' }],
  },
}
