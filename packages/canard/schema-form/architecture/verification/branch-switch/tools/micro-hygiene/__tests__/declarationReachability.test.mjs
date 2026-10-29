import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { collectReachableDeclarations } from '../helpers/collectReachableDeclarations.mjs';

function fixture(files, check) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'micro-hygiene-types-'));
  try {
    for (const [file, text] of Object.entries(files))
      fs.writeFileSync(path.join(root, file), text);
    check(root);
  } finally {
    fs.rmSync(root, { recursive: true });
  }
}
test('a private emitted module is absent from the public declaration closure', () => {
  fixture(
    {
      'index.d.ts': 'export type { API } from "./public.js";',
      'public.d.ts':
        'import type { Value } from "./shared"; export type API = Value;',
      'shared.d.ts': 'export type Value = string;',
      'private.d.ts': 'export function helper(): void;',
    },
    (root) => {
      assert.deepEqual(collectReachableDeclarations(root), [
        'index.d.ts',
        'public.d.ts',
        'shared.d.ts',
      ]);
    },
  );
});
test('re-exporting the same helper makes its address public', () => {
  fixture(
    {
      'index.d.ts': 'export { helper } from "./private";',
      'private.d.ts': 'export function helper(): void;',
    },
    (root) => {
      assert.deepEqual(collectReachableDeclarations(root), [
        'index.d.ts',
        'private.d.ts',
      ]);
    },
  );
});
test('import types contribute edges while external package names stay external', () => {
  fixture(
    {
      'index.d.ts':
        'import type { ReactNode } from "react"; export declare function read(): import("./value").Value;',
      'value.d.ts': 'export type Value = string;',
    },
    (root) => {
      assert.deepEqual(collectReachableDeclarations(root), [
        'index.d.ts',
        'value.d.ts',
      ]);
    },
  );
});
test('an unresolved relative public edge is a failure', () => {
  fixture(
    { 'index.d.ts': 'export type { Value } from "./missing";' },
    (root) => {
      assert.throws(
        () => collectReachableDeclarations(root),
        /Unresolved public declaration import/,
      );
    },
  );
});
