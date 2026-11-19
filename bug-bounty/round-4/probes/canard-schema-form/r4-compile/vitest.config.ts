// Probe-local config: resolves every @winglet/* import to package source instead of the stale dist.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  defaultClientConditions,
  defaultServerConditions,
  mergeConfig,
} from 'vite';
import { defineConfig } from 'vitest/config';

import base from '../../../vite.config';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '../../..');
const winglet = resolve(packageRoot, '../../winglet');

export default mergeConfig(
  base,
  defineConfig({
    root: packageRoot,
    resolve: {
      conditions: ['source', ...defaultClientConditions],
      alias: {
        '@/common-utils': resolve(winglet, 'common-utils/src'),
        '@/json-schema': resolve(winglet, 'json-schema/src'),
        '@/json': resolve(winglet, 'json/src'),
        '@/react-utils': resolve(winglet, 'react-utils/src'),
      },
    },
    ssr: {
      resolve: {
        conditions: ['source', ...defaultServerConditions],
      },
    },
  }),
);
