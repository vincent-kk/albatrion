// Run by the root test:build-scripts command; each fixture is a standalone consumer package.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('../verifyDeclarations.mjs', import.meta.url));

/** Runs declaration verification in an isolated package and always removes it. */
function verify(exports, files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'verify-declarations-'));
  try {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'declaration-fixture', type: 'module', exports }));
    for (const [name, contents] of Object.entries(files)) writeFileSync(join(root, name), contents);
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
    return { status: result.status, output: result.stdout + result.stderr };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('verifies a string declaration target alongside conditional exports', () => {
  const result = verify({ '.': { types: './index.d.ts' }, './direct': './direct.d.ts' }, {
    'index.d.ts': 'export type Value = string;',
    'direct.d.ts': 'export type Direct = number;',
  });
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /2 exports/);
});

test('does not hide an invalid string target behind a valid typed entry', () => {
  const result = verify({ '.': { types: './index.d.ts' }, './broken': './missing.js' }, { 'index.d.ts': 'export type Value = string;' });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /missing|broken/);
});

test('explicitly reports blocked null exports without importing them', () => {
  const result = verify({ '.': { types: './index.d.ts' }, './private': null }, { 'index.d.ts': 'export type Value = string;' });
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /blocked export .*private/);
  assert.match(result.output, /1 exports/);
});

test('rejects nested-only types conditions with the affected export named', () => {
  const result = verify({ '.': { types: './index.d.ts' }, './nested': { import: { types: './nested.d.mts', default: './nested.mjs' } } }, { 'index.d.ts': 'export type Value = string;' });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /nested.*top-level types/);
});

test('accepts the exports string shorthand', () => {
  const result = verify('./index.d.ts', { 'index.d.ts': 'export type Value = string;' });
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /DECLARATIONS_OK/);
});

test('fails loudly when every public export is blocked', () => {
  const result = verify({ '.': null });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /no .*public exports/);
});
