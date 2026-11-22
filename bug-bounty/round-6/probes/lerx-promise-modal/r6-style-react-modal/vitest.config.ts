import { resolve } from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import base from '../../../vite.config';

export default mergeConfig(base, defineConfig({
  resolve: {
    conditions: ['source'],
    alias: {
      '@/common-utils': resolve(__dirname, '../../../../../winglet/common-utils/src'),
      '@/react-utils': resolve(__dirname, '../../../../../winglet/react-utils/src'),
      '@/style-utils': resolve(__dirname, '../../../../../winglet/style-utils/src'),
    },
  },
}));
