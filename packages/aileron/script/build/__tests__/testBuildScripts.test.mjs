// Loaded by node:test; exercises the root script against an isolated fixture tree.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { test } from 'node:test';

test('test:build-scripts runs each fixture test file through shell expansion', (context) => {
  const root = mkdtempSync(join(tmpdir(), 'build-script-command-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const directory = join(root, 'packages/aileron/script/build/__tests__');
  mkdirSync(directory, { recursive: true });
  for (const name of ['first', 'second']) {
    writeFileSync(join(directory, `${name}.test.mjs`),
      `import { test } from 'node:test';\ntest('${name} fixture executes', () => {});\n`);
  }
  const manifest = JSON.parse(readFileSync(new URL('../../../../../package.json', import.meta.url), 'utf8'));
  // The child is a standalone test runner, not a child of this runner's IPC harness.
  const { NODE_TEST_CONTEXT, ...environment } = process.env;
  const run = spawnSync(manifest.scripts['test:build-scripts'], {
    shell: true, cwd: root, encoding: 'utf8',
    env: { ...environment, PATH: `${dirname(process.execPath)}${delimiter}${environment.PATH}` },
  });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /ok \d+ - first fixture executes/);
  assert.match(run.stdout, /ok \d+ - second fixture executes/);
  assert.match(run.stdout, /# tests 2/);
});
