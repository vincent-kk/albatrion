/**
 * Vitest config for the C-10 entry spike (same shape as vitest.spike.config.mjs
 * of the caret spike). Run from the package directory:
 *   npx vitest run --config architecture/spikes/events/vitest.entry.config.mjs
 * Root is this directory so the include glob stays local; modules resolve
 * upward to the repository's node_modules.
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
    include: ['**/entry.spike.test.tsx'],
    reporters: ['verbose'],
  },
};
