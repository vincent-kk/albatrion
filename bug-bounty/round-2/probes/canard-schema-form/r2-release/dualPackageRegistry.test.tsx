import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

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
  // Node resolves `import` to the node.import target and `require` to the require target.
  const esm = await import(
    pathToFileURL(resolve(packageRoot, packageJson.exports['.'].node.import)).href
  );
  const cjs = nodeRequire('@canard/schema-form');
  expect(nodeRequire.resolve('@canard/schema-form')).toBe(
    resolve(packageRoot, packageJson.exports['.'].node.require),
  );
  expect(esm.Form).not.toBe(cjs.Form);
  reset.push(() => esm.registerPlugin(null), () => cjs.registerPlugin(null));

  esm.registerPlugin(plugin);
  render(<cjs.Form jsonSchema={schema} />);
  expect(screen.queryAllByText('plugin field renderer').length).toBeGreaterThan(0);
});
