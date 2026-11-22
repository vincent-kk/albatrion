import { resolve } from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import base from '../../../vite.config';

export default mergeConfig(base, defineConfig({
  resolve: {
    conditions: ['source'],
    alias: { '@/common-utils': resolve(__dirname, '../../../../common-utils/src') },
  },
}));
