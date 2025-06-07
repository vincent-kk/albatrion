import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    include: ['@canard/schema-form', '@winglet/json-schema'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    target: 'es2022',
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  resolve: {
    alias: {
      '@/schema-form': resolve(__dirname, './src'),
      '@/schema-form-ajv8-plugin': resolve(
        __dirname,
        '../schema-form-ajv8-plugin/src',
      ),
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
