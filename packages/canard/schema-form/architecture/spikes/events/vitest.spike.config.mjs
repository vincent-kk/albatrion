/**
 * Vitest config for the events spike. Run from the package directory:
 *   npx vitest run --config architecture/spikes/events/vitest.spike.config.mjs
 * Root is this directory so the include glob stays local; modules resolve
 * upward to the package's and the repository's node_modules.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export default {
  root: here,
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.spike.test.tsx'],
    reporters: ['verbose'],
  },
};
