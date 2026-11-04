import { fileURLToPath } from 'node:url';

import { createESLintConfig } from '../../../eslint.config.mjs';

export default [
  ...createESLintConfig(fileURLToPath(new URL('./tsconfig.json', import.meta.url))),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@canard/schema-form', '@canard/schema-form/**'],
              message: 'Inject the form engine through structural scenario contracts.',
            },
          ],
        },
      ],
    },
  },
];
