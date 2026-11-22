import { resolve } from 'path';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

import packageConfig from '../../../vite.config';

const packageRoot = resolve(__dirname, '../../..');
const winglet = resolve(packageRoot, '..');

// Resolves every workspace dependency to its `source` export (src) instead of the stale dist.
export default mergeConfig(
  packageConfig,
  defineConfig({
    root: packageRoot,
    resolve: {
      conditions: ['source', ...defaultClientConditions],
      alias: {
        '@/common-utils': resolve(winglet, 'common-utils/src'),
      },
    },
    ssr: {
      resolve: {
        conditions: ['source', ...defaultServerConditions],
      },
    },
  }),
);
