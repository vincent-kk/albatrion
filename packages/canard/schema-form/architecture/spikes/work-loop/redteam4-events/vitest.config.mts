/**
 * Minimal vitest config for the red-team 4 event-system spike. Run from the
 * package directory:
 *   node ../../../node_modules/.bin/vitest run --config architecture/spikes/work-loop/redteam4-events/vitest.config.mts
 * The `@/schema-form` alias mirrors the package's vite.config.ts so the
 * current library can be imported from source without touching the package.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@/schema-form': resolve(here, '../../../../src') },
  },
  esbuild: { jsx: 'automatic' },
  test: {
    root: here,
    environment: 'jsdom',
    include: ['*.test.{ts,tsx}'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
