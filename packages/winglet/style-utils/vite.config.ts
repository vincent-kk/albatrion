import { resolve } from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@/style-utils': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, '**/*.browser.test.*'],
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
