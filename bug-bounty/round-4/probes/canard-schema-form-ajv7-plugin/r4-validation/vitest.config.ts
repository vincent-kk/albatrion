import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from '../../../vite.config';

/**
 * Probe-local config: every workspace package resolves to its `src` through the `source` export
 * condition, and each package's internal `@/<name>` alias points at that `src`, so no stale `dist`
 * is loaded. Run with `--config src/__bounty__/r4-validation/vitest.config.ts`.
 */
const here = fileURLToPath(new URL('.', import.meta.url));
const packageRoot = resolve(here, '../../..');
const packages = resolve(here, '../../../../..');

const sourceAliases = {
  '@/schema-form': resolve(packages, 'canard/schema-form/src'),
  '@/common-utils': resolve(packages, 'winglet/common-utils/src'),
  '@/data-loader': resolve(packages, 'winglet/data-loader/src'),
  '@/json-schema': resolve(packages, 'winglet/json-schema/src'),
  '@/json': resolve(packages, 'winglet/json/src'),
  '@/react-utils': resolve(packages, 'winglet/react-utils/src'),
  '@/style-utils': resolve(packages, 'winglet/style-utils/src'),
};

export default mergeConfig(
  baseConfig,
  defineConfig({
    root: packageRoot,
    resolve: {
      conditions: ['source', ...defaultClientConditions],
      alias: sourceAliases,
    },
    ssr: {
      resolve: {
        conditions: ['source', ...defaultServerConditions],
        externalConditions: ['source'],
      },
    },
  }),
);
