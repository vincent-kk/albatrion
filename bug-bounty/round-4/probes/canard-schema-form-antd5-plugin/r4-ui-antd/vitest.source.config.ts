import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import packageConfig from '../../../vite.config';

// Probe-only config: every workspace package resolves to its src, because the shipped
// dist builds predate the round 1 to 3 fixes. The 'source' export condition cannot be
// used here: antd's CommonJS build requires scroll-into-view-if-needed and
// compute-scroll-into-view, which also declare a 'source' condition pointing at
// untranspiled TypeScript under node_modules. Each workspace export's declared
// 'source' target is aliased instead. Run from the plugin workspace with
// --config src/__bounty__/r4-ui-antd/vitest.source.config.ts.
const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, '../../..');
const packages = resolve(here, '../../../../..');

const workspaces = [
  'canard/schema-form',
  'winglet/common-utils',
  'winglet/react-utils',
  'winglet/json-schema',
  'winglet/json',
  'winglet/style-utils',
];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const sourceAliases = workspaces.flatMap((workspace) => {
  const root = resolve(packages, workspace);
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  return Object.entries(manifest.exports as Record<string, { source?: string }>)
    .filter(([, target]) => target && typeof target.source === 'string')
    .map(([subpath, target]) => ({
      find: new RegExp('^' + escape(manifest.name + subpath.slice(1)) + '$'),
      replacement: resolve(root, target.source!),
    }));
});

const internalAliases = [
  ['schema-form', 'canard/schema-form'],
  ['common-utils', 'winglet/common-utils'],
  ['json-schema', 'winglet/json-schema'],
  ['json', 'winglet/json'],
  ['style-utils', 'winglet/style-utils'],
  ['react-utils', 'winglet/react-utils'],
].map(([prefix, workspace]) => ({
  find: new RegExp('^@/' + escape(prefix) + '(?=/|$)'),
  replacement: resolve(packages, workspace, 'src'),
}));

// The package config's setupFiles are relative to the plugin root, which stays the root.
const merged = mergeConfig(
  packageConfig,
  defineConfig({
    root: pluginRoot,
    resolve: { alias: [...sourceAliases, ...internalAliases] },
  }),
);
merged.test = { ...merged.test, include: ['src/__bounty__/r4-ui-antd/**/*.test.tsx'] };

export default merged;
