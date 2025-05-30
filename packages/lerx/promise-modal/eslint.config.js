import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import storybookPlugin from 'eslint-plugin-storybook';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      storybook: storybookPlugin,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-fallthrough': 'off',
      'no-constant-condition': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'after-used',
          vars: 'all',
          caughtErrors: 'all',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': [
        'error',
        {
          ignoreDeclarationMerge: true,
          builtinGlobals: false,
          ignoreTypeDeclarations: false,
          ignoreNamespaceDeclarations: false,
        },
      ],
      'no-undef': 'off',
    },
  },
];
