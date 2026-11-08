// Run by the declaration-check package scripts before checking built public exports.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import { fixDtsExtensions } from '../utils/fixDtsExtensions.mjs';

test('resolves static and inline references to files and current/parent indexes', () => {
  const root = mkdtempSync(join(tmpdir(), 'declaration-paths-'));
  try {
    for (const name of ['index.d.ts', 'value.d.ts', 'nested/index.d.ts', 'nested/deep/index.d.ts']) {
      mkdirSync(dirname(join(root, name)), { recursive: true });
      writeFileSync(join(root, name), 'export type Value = string;\n');
    }
    const file = join(root, 'nested/deep/consumer.d.ts');
    const source = [
      "export { Value } from '../../value';",
      "export type A = import('../../value').Value;",
      "export type B = import('.').Value;",
      "export type C = import('..').Value;",
      "export type D = import('../..').Value;",
      "export { Value as E } from '..';",
      "export type External = import('external-package').Value;",
      "export type Existing = import('../../value.js').Value;",
      "export type Missing = import('./missing').Value;",
    ].join('\n');
    writeFileSync(file, source);
    assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 1, importsFixed: 6 });
    assert.equal(readFileSync(file, 'utf8'), source
      .replaceAll("'../../value'", "'../../value.js'")
      .replaceAll("'.'", "'./index.js'")
      .replaceAll("'..'", "'../index.js'")
      .replaceAll("'../..'", "'../../index.js'"));
    assert.deepEqual(fixDtsExtensions(root), { filesProcessed: 0, importsFixed: 0 });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
