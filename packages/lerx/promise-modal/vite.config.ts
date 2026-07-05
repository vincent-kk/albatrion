import { resolve } from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@/promise-modal': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // *.prod.test.* runs only under vitest.prod.config.ts (production React)
    exclude: [...configDefaults.exclude, '**/*.prod.test.*'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
