import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  defaultClientConditions,
  defaultServerConditions,
  mergeConfig,
} from 'vite';
import { defineConfig } from 'vitest/config';

import packageConfig from '../../../vite.config';

// Probe-only config, variant requested by the lead: the 'source' export condition
// first, plus the internal '@/<name>' aliases.
const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, '../../..');
const packages = resolve(here, '../../../../..');

const internalAliases = [
  ['schema-form', 'canard/schema-form'],
  ['common-utils', 'winglet/common-utils'],
  ['json-schema', 'winglet/json-schema'],
  ['json', 'winglet/json'],
  ['style-utils', 'winglet/style-utils'],
  ['react-utils', 'winglet/react-utils'],
].map(([prefix, workspace]) => ({
  find: new RegExp('^@/' + prefix + '(?=/|$)'),
  replacement: resolve(packages, workspace, 'src'),
}));

export default mergeConfig(
  packageConfig,
  defineConfig({
    root: pluginRoot,
    resolve: {
      conditions: ['source', ...defaultClientConditions],
      alias: internalAliases,
    },
    ssr: { resolve: { conditions: ['source', ...defaultServerConditions] } },
    test: {
      setupFiles: [resolve(pluginRoot, 'src/__tests__/setup/cssIdentifiers.ts')],
      include: ['src/__bounty__/r4-ui-antd/**/*.test.tsx'],
    },
  }),
);
