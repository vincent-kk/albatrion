import { resolve } from 'path';
import {
  defaultClientConditions,
  defaultServerConditions,
  mergeConfig,
} from 'vite';
import { defineConfig } from 'vitest/config';

import base from '../../../vite.config';

/**
 * Probe-local config: resolves every workspace dependency through its "source"
 * export condition, so @winglet/* load from src instead of a stale dist.
 * Run with `--config src/__bounty__/r4-promise-modal/vitest.config.ts`.
 */
const winglet = resolve(__dirname, '../../../../../winglet');

export const sourceResolution = {
  resolve: {
    conditions: ['source', ...defaultClientConditions],
    alias: {
      '@/common-utils': resolve(winglet, 'common-utils/src'),
      '@/style-utils': resolve(winglet, 'style-utils/src'),
      '@/react-utils': resolve(winglet, 'react-utils/src'),
    },
  },
  ssr: {
    resolve: {
      conditions: ['source', ...defaultServerConditions],
    },
  },
};

export default mergeConfig(base, defineConfig(sourceResolution));
