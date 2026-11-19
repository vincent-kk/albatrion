import { dirname, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Probe-local configuration for separateBundles.probe.tsx: React, ReactDOM and scheduler are
// inlined so that vi.resetModules() evaluates a second copy, as a second bundle on the page does.
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '../../..');

export default defineConfig({
  root: packageRoot,
  resolve: {
    alias: { '@/schema-form': resolve(packageRoot, 'src') },
  },
  test: {
    globals: true,
    testTimeout: 60000,
    environment: 'jsdom',
    setupFiles: [
      'src/core/engine/settle/__tests__/setupShippedGateEvaluation.ts',
    ],
    include: ['src/__bounty__/r5-ids/separateBundles.probe.tsx'],
    server: {
      deps: {
        inline: [/\/node_modules\/react\//, /\/node_modules\/react-dom\//, /\/node_modules\/scheduler\//],
      },
    },
  },
});
