import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: [
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
    'import',
    'node',
    'promise',
  ],
  categories: {
    correctness: 'error',
    nursery: 'off',
    pedantic: 'off',
    perf: 'off',
    restriction: 'off',
    style: 'off',
    suspicious: 'off',
  },
  options: {
    typeAware: true,
    typeCheck: true,
    denyWarnings: true,
    reportUnusedDisableDirectives: 'error',
  },
  env: {
    builtin: true,
    node: true,
  },
  ignorePatterns: ['node_modules'],
  rules: {
    'import/no-cycle': 'error',
    'import/newline-after-import': [
      'error',
      { count: 1, exactCount: true, considerComments: true },
    ],
    'typescript/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  },
});
