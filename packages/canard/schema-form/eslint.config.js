// 다른 패키지의 eslint.config.js
import path from 'path';
import { fileURLToPath } from 'url';

import { createESLintConfig } from '../../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...createESLintConfig(path.resolve(__dirname, './tsconfig.json')),
  // Friend-zone boundary for internal node members.
  // `__member__` APIs on nodes are `public @internal` (stripped from public
  // d.ts via stripInternal) so the strategy/manager friend zone (src/core,
  // src/app) can call them with full type checking. Everything else must use
  // the public node API — this rule restores, mechanically, the enforcement
  // that the `protected` modifier used to imply for those members.
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/providers/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/formTypeDefinitions/**/*.{ts,tsx}',
      'src/helpers/**/*.{ts,tsx}',
    ],
    ignores: ['**/__tests__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        // Keep the base-config entries (per-rule overrides replace, not merge).
        {
          selector: "PropertyDefinition[key.type='PrivateIdentifier']",
          message:
            "ES private fields (#) are not allowed. Use 'private __fieldName__' convention instead for ECMA 2022 compatibility.",
        },
        {
          selector: "MethodDefinition[key.type='PrivateIdentifier']",
          message:
            "ES private methods (#) are not allowed. Use 'private __methodName__()' convention instead for ECMA 2022 compatibility.",
        },
        {
          selector:
            'MemberExpression[computed=false][property.name=/^__[a-zA-Z0-9]+__$/]',
          message:
            'Internal `__member__` access is restricted to the core friend zone (src/core, src/app). Use the public node API instead.',
        },
        {
          selector:
            'MemberExpression[computed=true][property.value=/^__[a-zA-Z0-9]+__$/]',
          message:
            'Internal `__member__` access is restricted to the core friend zone (src/core, src/app). Use the public node API instead.',
        },
      ],
    },
  },
];
