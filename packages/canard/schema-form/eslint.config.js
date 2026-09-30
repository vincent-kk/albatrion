// 다른 패키지의 eslint.config.js
import path from 'path';
import { fileURLToPath } from 'url';

import { createESLintConfig } from '../../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...createESLintConfig(path.resolve(__dirname, './tsconfig.json')),
  {
    files: [
      'src/core/record/**/*.ts',
      'src/core/behaviors/**/*.ts',
      'src/core/navigation/**/*.ts',
      'src/core/settle/**/*.ts',
      'src/core/SchemaNode/**/*.ts',
    ],
    ignores: ['**/__tests__/**'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/core/SchemaNode/SchemaNode.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "PropertyDefinition[key.type='PrivateIdentifier']",
          message: 'ES # private fields are forbidden in SchemaNode (NODE-010).',
        },
        {
          selector: "MethodDefinition[key.type='PrivateIdentifier']",
          message: 'ES # private methods are forbidden in SchemaNode (NODE-010).',
        },
        {
          selector: 'PropertyDefinition[value!=null]',
          message: 'SchemaNode fields are assigned only by the constructor (NODE-010).',
        },
        {
          selector: "MethodDefinition[kind='method'][value.body.body.length!=1]",
          message: 'SchemaNode methods contain one delegation statement (NODE-010).',
        },
        {
          selector: "MethodDefinition[kind='get'][value.body.body.length!=1], MethodDefinition[kind='set'][value.body.body.length!=1]",
          message: 'SchemaNode accessors contain one storage statement (NODE-010).',
        },
        {
          selector: "MethodDefinition[kind='constructor'] BlockStatement > :not(ExpressionStatement)",
          message: 'SchemaNode construction consists only of assignments (NODE-010).',
        },
        {
          selector: "MethodDefinition[kind='constructor'] BlockStatement > ExpressionStatement > :not(AssignmentExpression)",
          message: 'SchemaNode construction consists only of assignments (NODE-010).',
        },
        {
          selector: "MethodDefinition[kind='constructor'] BlockStatement > ExpressionStatement > AssignmentExpression[left.object.type!='ThisExpression']",
          message: 'SchemaNode construction assigns only its own fields (NODE-010).',
        },
        {
          selector: "MethodDefinition[kind='constructor'] :matches(NewExpression, ObjectExpression, ArrayExpression, ArrowFunctionExpression)",
          message: 'SchemaNode construction only assigns precomputed fields (NODE-010).',
        },
        {
          selector: 'IfStatement, SwitchStatement, ForStatement, ForOfStatement, WhileStatement',
          message: 'SchemaNode branching belongs to its owner modules (NODE-010).',
        },
      ],
    },
  },
  {
    files: [
      'src/core/blueprint/**/*.{ts,tsx}',
      'src/core/record/**/*.{ts,tsx}',
      'src/core/behaviors/**/*.{ts,tsx}',
      'src/core/navigation/**/*.{ts,tsx}',
      'src/core/settle/**/*.{ts,tsx}',
      'src/core/SchemaNode/**/*.{ts,tsx}',
      'src/helpers/schemaIntersection/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/schema-form/__legacy__',
                '@/schema-form/__legacy__/**',
                '**/__legacy__',
                '**/__legacy__/**',
              ],
              message:
                'New engine modules must not import the preserved legacy implementation (LANDING-159).',
            },
          ],
        },
      ],
    },
  },
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
