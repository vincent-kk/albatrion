import { resolve } from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

/**
 * Runs the whole test suite against the PRODUCTION build of React
 * (react/react-dom resolve their prod bundles via NODE_ENV), so lifecycle
 * behavior is verified outside development-mode safeguards like StrictMode
 * double-invocation. The *.prod.test.* canary asserts the environment.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@/promise-modal': resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    env: { NODE_ENV: 'production' },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Testing Library depends on act(), which production React does not ship;
    // the production rendering coverage lives in *.prod.test.* files instead.
    exclude: [...configDefaults.exclude, '**/bootstrapLifecycle.test.tsx'],
  },
});
