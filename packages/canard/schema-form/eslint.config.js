// 다른 패키지의 eslint.config.js
import path from 'path';
import { fileURLToPath } from 'url';

import { createESLintConfig } from '../../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** `process.env.NODE_ENV` appears only as a bare `!== 'production'` / `=== 'production'` comparison at its use site, so consumer bundlers fold every development-only branch (rounds 189, 196, 200C-01). */
const ENVIRONMENT_TOKEN =
  "[object.object.name='process'][object.property.name='env'][property.name='NODE_ENV']";
const environmentTokenRules = [
  {
    selector: `:not(BinaryExpression) > MemberExpression${ENVIRONMENT_TOKEN}`,
    message:
      "Compare process.env.NODE_ENV to 'production' at the use site; no constant, destructuring, assignment or bare read (200C-01).",
  },
  {
    selector:
      "BinaryExpression[left.object.object.name='process'][left.object.property.name='env'][left.property.name='NODE_ENV']:not([operator='!=='][right.value='production']):not([operator='==='][right.value='production'])",
    message:
      "process.env.NODE_ENV is compared only with !== 'production' or === 'production' (200C-01).",
  },
  {
    selector: `BinaryExpression > MemberExpression.right${ENVIRONMENT_TOKEN}`,
    message:
      "Write the comparison as process.env.NODE_ENV !== 'production' with the token on the left (200C-01).",
  },
  {
    selector:
      "VariableDeclarator[id.type='ObjectPattern'][init.object.name='process'][init.property.name='env']",
    message:
      'Do not destructure process.env; compare process.env.NODE_ENV at the use site (200C-01).',
  },
];

export default [
  ...createESLintConfig(path.resolve(__dirname, './tsconfig.json')),
  {
    files: ['src/__legacy__/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/schema-form',
              message: 'Legacy modules must use local legacy copies.',
            },
          ],
          patterns: [
            {
              group: [
                '@/schema-form/*',
                '!@/schema-form/__legacy__',
                '!@/schema-form/__legacy__/**',
              ],
              message:
                'Legacy modules must use local legacy copies. Relative escapes are checked by check-legacy-isolation.mjs.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/core/record/**/*.ts',
      'src/core/behaviors/**/*.ts',
      'src/core/navigation/**/*.ts',
      'src/core/settle/**/*.ts',
      'src/core/dispatch/**',
      'src/core/validation/**',
      'src/core/SchemaNode/**/*.ts',
    ],
    ignores: ['**/__tests__/**'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/core/blueprint/**/*.ts', 'src/core/nodeFromJSONSchema.ts'],
    ignores: ['**/__tests__/**'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
    },
  },
  {
    files: ['src/core/SchemaNode/SchemaNode.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...environmentTokenRules,
        {
          selector: "PropertyDefinition[key.type='PrivateIdentifier']",
          message:
            'ES # private fields are forbidden in SchemaNode (NODE-010).',
        },
        {
          selector: "MethodDefinition[key.type='PrivateIdentifier']",
          message:
            'ES # private methods are forbidden in SchemaNode (NODE-010).',
        },
        {
          selector: 'PropertyDefinition[value!=null]',
          message:
            'SchemaNode fields are assigned only by the constructor (NODE-010).',
        },
        {
          selector:
            "MethodDefinition[kind='method'][value.body.body.length!=1]",
          message:
            'SchemaNode methods contain one delegation statement (NODE-010).',
        },
        {
          selector:
            "MethodDefinition[kind='get'][value.body.body.length!=1], MethodDefinition[kind='set'][value.body.body.length!=1]",
          message:
            'SchemaNode accessors contain one storage statement (NODE-010).',
        },
        {
          selector:
            "MethodDefinition[kind='constructor'] BlockStatement > :not(ExpressionStatement)",
          message:
            'SchemaNode construction consists only of assignments (NODE-010).',
        },
        {
          selector:
            "MethodDefinition[kind='constructor'] BlockStatement > ExpressionStatement > :not(AssignmentExpression)",
          message:
            'SchemaNode construction consists only of assignments (NODE-010).',
        },
        {
          selector:
            "MethodDefinition[kind='constructor'] BlockStatement > ExpressionStatement > AssignmentExpression[left.object.type!='ThisExpression']",
          message:
            'SchemaNode construction assigns only its own fields (NODE-010).',
        },
        {
          selector:
            "MethodDefinition[kind='constructor'] :matches(NewExpression, ObjectExpression, ArrayExpression, ArrowFunctionExpression)",
          message:
            'SchemaNode construction only assigns precomputed fields (NODE-010).',
        },
        {
          selector:
            'IfStatement, SwitchStatement, ForStatement, ForOfStatement, WhileStatement',
          message:
            'SchemaNode branching belongs to its owner modules (NODE-010).',
        },
      ],
    },
  },
  {
    // Files without their own no-restricted-syntax block; the two blocks that have one spread the same rules.
    files: [
      'src/core/**/*.{ts,tsx}',
      'src/app/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/errors/**/*.{ts,tsx}',
      'src/index.ts',
    ],
    ignores: ['src/core/SchemaNode/SchemaNode.ts', '**/__tests__/**'],
    rules: {
      'no-restricted-syntax': ['error', ...environmentTokenRules],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/__legacy__/**'],
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
                'Source modules must not import the preserved legacy implementation (LANDING-159, LANDING-205).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
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
            {
              group: [
                '@/schema-form/app/plugin',
                '@/schema-form/app/plugin/**',
                '**/app/plugin',
                '**/app/plugin/**',
              ],
              message:
                'Core engine modules receive validators as inputs and must not import app/plugin (CONTROLS-075).',
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
        ...environmentTokenRules,
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
