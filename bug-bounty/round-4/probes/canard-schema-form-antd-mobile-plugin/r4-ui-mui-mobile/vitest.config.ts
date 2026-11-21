import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  defaultClientConditions,
  defaultServerConditions,
  mergeConfig,
} from 'vite';
import { defineConfig } from 'vitest/config';

import baseConfig from '../../../vite.config';

// Probe-only config: every workspace package resolves to its `source` export condition, and the
// internal '@/<name>' aliases those sources use point at each package's src. The dist builds in
// the main tree predate the round 1 to 3 fixes, so probes must not read them.
const here = dirname(fileURLToPath(import.meta.url));
const packages = resolve(here, '../../../../..');

const internalAliases: Record<string, string> = {
  'schema-form': 'canard/schema-form',
  'common-utils': 'winglet/common-utils',
  'json-schema': 'winglet/json-schema',
  json: 'winglet/json',
  'style-utils': 'winglet/style-utils',
  'promise-modal': 'lerx/promise-modal',
  'agents-assets-sync': 'slats/agents-assets-sync',
};

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      conditions: ['source', ...defaultClientConditions],
      alias: Object.entries(internalAliases).map(([name, directory]) => ({
        find: new RegExp(`^@/${name}(?=/|$)`),
        replacement: resolve(packages, directory, 'src'),
      })),
    },
    ssr: {
      resolve: {
        conditions: ['source', ...defaultServerConditions],
      },
    },
  }),
);
