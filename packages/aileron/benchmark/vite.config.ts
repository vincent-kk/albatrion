import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@/benchmark': resolve(__dirname, './src'),
      '@/schema-form': resolve(__dirname, './../../canard/schema-form/src'),
      '@/common-utils': resolve(__dirname, './../../winglet/common-utils/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
