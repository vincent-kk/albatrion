import { cleanup, render, screen } from '@testing-library/react';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, expect, inject, it } from 'vitest';

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

it('round-2 schema-form 7: a plugin registered through the Node ESM entry reaches a Form loaded through the CommonJS entry', async (context) => {
  if (inject('reactMajor') === '18')
    context.skip(
      'Built bundles resolve the installed React 19; source tests cover React 18.',
    );
  // Node resolves `import` to the node.import target and `require` to the require target.
  const esm = await import(
    pathToFileURL(resolve(packageRoot, packageJson.exports['.'].node.import))
      .href
  );
  const cjs = nodeRequire('@canard/schema-form');
  expect(nodeRequire.resolve('@canard/schema-form')).toBe(
    resolve(packageRoot, packageJson.exports['.'].node.require),
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

it('round-2 schema-form 7: incompatible registry versions remain isolated', async (context) => {
  if (inject('reactMajor') === '18')
    context.skip('Built bundles use the installed React 19.');
  const file = resolve(packageRoot, packageJson.exports['.'].node.import);
  const source = await readFile(file, 'utf8');
  const key = '@canard/schema-form/plugin-registry/0.16';
  const otherSource = source
    .split(key)
    .join('@canard/schema-form/plugin-registry/incompatible');
  expect(otherSource).not.toBe(source);
  const directory = await mkdtemp(resolve(tmpdir(), 'schema-form-registry-'));
  try {
    await symlink(
      resolve(packageRoot, '../../../node_modules'),
      resolve(directory, 'node_modules'),
      'dir',
    );
    const otherFile = resolve(directory, 'other.mjs');
    await writeFile(otherFile, otherSource);
    const original = await import(pathToFileURL(file).href);
    const other = await import(pathToFileURL(otherFile).href);
    original.registerPlugin(plugin);
    other.registerPlugin(null);
    render(<original.Form jsonSchema={schema} />);
    expect(
      screen.queryAllByText('plugin field renderer').length,
    ).toBeGreaterThan(0);
    cleanup();
    render(<other.Form jsonSchema={schema} />);
    expect(screen.queryAllByText('plugin field renderer')).toEqual([]);
    original.registerPlugin(null);
    other.registerPlugin(null);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
