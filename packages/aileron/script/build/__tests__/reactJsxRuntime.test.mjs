// Loaded by test:build-scripts; checks the opt-in ESM transformation through real Rolldown output.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { rolldown } from 'rolldown';
import { getLibBuildOptions } from '../rolldown.transpile.mjs';

/** Build a source import and an equal-looking string so only module specifiers may change. */
const buildFixture = async (root, directory, format, reactPeerRange) => {
  const { libBuildOptions } = getLibBuildOptions(pathToFileURL(join(root, 'rolldown.config.mjs')).href);
  const { output, ...input } = await libBuildOptions({ entrypoints: ['src/nested/index.ts'], format, extension: format === 'esm' ? 'mjs' : 'cjs', outDir: join(root, directory), reactPeerRange });
  const bundle = await rolldown(input);
  try { await bundle.write(output); } finally { await bundle.close(); }
  return readFileSync(join(root, directory, 'nested/index.' + (format === 'esm' ? 'mjs' : 'cjs')), 'utf8');
};

test('only the opted-in legacy-peer ESM graph uses the private JSX runtime bridge', async context => {
  const root = mkdtempSync(join(tmpdir(), 'jsx-runtime-build-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'src/nested'), { recursive: true });
  writeFileSync(join(root, 'src/nested/index.ts'), 'import {jsx} from "react/jsx-runtime"; export const render = () => jsx("div", {}); export const address = "react/jsx-runtime";');
  writeFileSync(join(root, 'tsconfig.json'), '{"compilerOptions":{"target":"es2020","module":"esnext"}}');
  const plain = await buildFixture(root, 'plain', 'esm');
  const bridged = await buildFixture(root, 'bridged', 'esm', '>=16.14 <20');
  assert.match(plain, /from "react\/jsx-runtime"/);
  assert.match(bridged, /from "\.\.\/_runtime\/react-jsx-runtime\.cjs"/);
  assert.match(bridged, /address = "react\/jsx-runtime"/);
  const asset = join(root, 'bridged/_runtime/react-jsx-runtime.cjs');
  assert.match(readFileSync(asset, 'utf8'), /require\(['"]react\/jsx-runtime['"]\)/);
  assert.ok(!existsSync(join(root, 'plain/_runtime/react-jsx-runtime.cjs')));
  const cjs = await buildFixture(root, 'cjs', 'cjs');
  assert.equal(await buildFixture(root, 'cjs-opted', 'cjs', '>=16.14 <20'), cjs);
  assert.ok(!existsSync(join(root, 'cjs-opted/_runtime/react-jsx-runtime.cjs')));
});

test('an unreviewed peer range cannot silently opt in to the legacy bridge', async () => {
  const { libBuildOptions } = getLibBuildOptions(import.meta.url);
  await assert.rejects(libBuildOptions({ entrypoints: ['src/index.ts'], format: 'esm', extension: 'mjs', outDir: 'dist', reactPeerRange: '>=18 <20' }), /React peer range/);
});
