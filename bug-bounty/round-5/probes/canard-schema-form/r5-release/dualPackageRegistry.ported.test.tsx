import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

/**
 * Port of bug-bounty/round-2/probes/canard-schema-form/r2-release/dualPackageRegistry.test.tsx.
 * The only change: the round 3 manifest nests `types` and `default` under each condition,
 * so the runtime targets are read from `.node.import.default` and `.node.require.default`.
 * Loads the built dist (fresh at the round-5 base commit).
 */
const packageRoot = resolve(__dirname, '../../..');
const packageJson = createRequire(import.meta.url)('../../../package.json');
const nodeRequire = createRequire(resolve(packageRoot, 'package.json'));

const FieldRendererMarker = () => <span>plugin field renderer</span>;
const plugin = { FieldRenderer: FieldRendererMarker };
const schema = { type: 'object', properties: { name: { type: 'string' } } };

let reset: Array<() => void> = [];
afterEach(() => {
  cleanup();
  for (const undo of reset) undo();
  reset = [];
});

it('a plugin registered through the Node ESM entry reaches a Form loaded through the CommonJS entry', async () => {
  const esm = await import(
    pathToFileURL(
      resolve(packageRoot, packageJson.exports['.'].node.import.default),
    ).href
  );
  const cjs = nodeRequire('@canard/schema-form');
  expect(nodeRequire.resolve('@canard/schema-form')).toBe(
    resolve(packageRoot, packageJson.exports['.'].node.require.default),
  );
  expect(esm.Form).not.toBe(cjs.Form);
  reset.push(
    () => esm.registerPlugin(null),
    () => cjs.registerPlugin(null),
  );

  esm.registerPlugin(plugin);
  render(<cjs.Form jsonSchema={schema} />);
  expect(screen.queryAllByText('plugin field renderer').length).toBeGreaterThan(
    0,
  );
});
