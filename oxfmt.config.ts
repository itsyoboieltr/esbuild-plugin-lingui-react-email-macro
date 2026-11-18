import { defineConfig } from 'oxfmt';

export default defineConfig({
  singleQuote: true,
  jsxSingleQuote: true,
  printWidth: 80,
  bracketSameLine: true,
  trailingComma: 'es5',
  sortImports: {
    groups: [
      ['builtin', 'external', 'unknown'],
      'internal',
      ['parent', 'sibling', 'index'],
    ],
  },
  sortPackageJson: true,
  ignorePatterns: ['node_modules'],
});
