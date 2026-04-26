import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

process.env.FORCE_COLOR = '0';

export default defineConfig({
  resolve: {
    alias: {
      '@/claude-assets-sync': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
