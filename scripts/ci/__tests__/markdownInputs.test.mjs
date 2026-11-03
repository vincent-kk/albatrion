import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { test } from 'node:test';

import { classifyChangedFile } from '../helpers/selection/classifyChangedFile.mjs';
import { readTrackedFiles } from '../helpers/workspaces/readTrackedFiles.mjs';
import { readWorkspaces } from '../helpers/workspaces/readWorkspaces.mjs';

test('literal markdown paths read by tracked tests are selection inputs', () => {
  const root = new URL('../../../', import.meta.url).pathname;
  const files = readTrackedFiles(root);
  const workspaces = readWorkspaces(root, files);
  const reads = [];
  for (const file of files.filter((path) => /(?:\.test\.|\.spec\.|\/__tests__\/)/.test(path) && /\.[cm]?[jt]sx?$/.test(path))) {
    const source = readFileSync(join(root, file), 'utf8');
    for (const [, method, path] of source.matchAll(/\b(new\s+URL|readFileSync)\s*\(\s*['"]([^'"\n]+\.md)['"]/g)) {
      const resolved = method.startsWith('new') ? posix.normalize(posix.join(dirname(file), path)) : path;
      if (!files.includes(resolved)) continue;
      reads.push(resolved);
      assert.notEqual(classifyChangedFile(resolved, workspaces), 'ignored', `${file} reads ${resolved}; register this markdown input`);
    }
  }
  assert.ok(reads.includes('packages/canard/schema-form/src/core/surface/DETAIL.md'));
});
