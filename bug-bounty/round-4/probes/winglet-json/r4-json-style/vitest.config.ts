import { resolve } from 'path';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

import base from '../../../vite.config';

// Resolves workspace packages (@winglet/common-utils) to their `source` export condition,
// because the main tree's dist predates the round 1 to 3 fixes.
export default mergeConfig(
  base,
  defineConfig({
    root: resolve(__dirname, '../../..'),
    resolve: {
      conditions: ['source', ...defaultClientConditions],
      alias: {
        '@/common-utils': resolve(__dirname, '../../../../common-utils/src'),
      },
    },
    ssr: {
      resolve: {
        conditions: ['source', ...defaultServerConditions],
        externalConditions: ['source'],
      },
    },
    test: {
      include: ['src/__bounty__/r4-json-style/**/*.test.ts'],
      server: { deps: { inline: [/@winglet\//] } },
    },
  }),
);
