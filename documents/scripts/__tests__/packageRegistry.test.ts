// Loaded by test:scripts; verifies nested declaration paths without built repository artifacts.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { discoverPackages, listUnbuiltPackages } from '../lib/packageRegistry';

test('discovers import declarations before legacy types for main and subpath exports', (context) => {
  mkdirSync('/tmp/bb3-build', { recursive: true });
  const root = mkdtempSync('/tmp/bb3-build/package-registry-');
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const packagesDir = join(root, 'packages');
  const docsDir = join(root, 'docs');
  const packageRoot = join(packagesDir, 'winglet/fixture');
  const branch = (types: string) => ({ types: './missing-legacy.d.ts', import: { types }, require: { types: './unused.d.cts' } });
  const files = {
    'packages/winglet/fixture/package.json': JSON.stringify({ name: '@winglet/fixture', version: '1.0.0', exports: { '.': branch('./dist/main.d.ts'), './sub': branch('./dist/sub.d.ts') } }),
    'packages/winglet/fixture/dist/main.d.ts': 'export {};',
    'packages/winglet/fixture/dist/sub.d.ts': 'export {};',
    'docs/winglet/fixture/index.mdx': '# fixture',
  };
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  const entries = discoverPackages({ packagesDir, docsDir });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].mainDtsPath, join(packageRoot, 'dist/main.d.ts'));
  assert.deepEqual(entries[0].subPaths, [{ exportKey: './sub', dtsPath: join(packageRoot, 'dist/sub.d.ts') }]);
  assert.deepEqual(listUnbuiltPackages('winglet', { packagesDir, docsDir }), []);
});
