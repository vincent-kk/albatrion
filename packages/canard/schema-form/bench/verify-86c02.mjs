// Evidence entry: validate captured checks against unchanged source; --run reproduces suites.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(pkg, '../../..');
const evidence = JSON.parse(fs.readFileSync(path.join(pkg,
  'architecture/verification/07-switch/86c02-verification.json'), 'utf8'));
for (const [file, hash] of Object.entries(evidence.sourceHashes))
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(repo, file))).digest('hex'), hash, file);
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD', '--',
  'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const added = execFileSync('git', ['ls-files', '--others', '--exclude-standard',
  'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
assert.deepEqual([...changed, ...added].sort(), Object.keys(evidence.sourceHashes).sort());
assert.equal(execFileSync('git', ['rev-parse', '--short=9', 'HEAD'],
  { cwd: repo, encoding: 'utf8' }).trim(), evidence.head);
const reserved = ['providers/RootNodeContext/RootNodeContextProvider.tsx',
  'providers/RootNodeContext/useLiveNode.ts', 'providers/RootNodeContext/utils/applyFormErrors.ts',
  'components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx',
  'components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts', 'core/types/index.ts'];
for (const relative of reserved) {
  const file = `packages/canard/schema-form/src/${relative}`;
  assert(fs.readFileSync(path.join(repo, file)).equals(execFileSync('git', ['show', `HEAD:${file}`], { cwd: repo })));
}
const tests = evidence.commands[0];
assert.equal(tests.tests.failed, 4);
assert.equal(tests.failures.length, 4);
assert(tests.failures.every(name => /^(render|react18): EVENT-070 React stops two fields writing back through use(Layout)?Effect$/.test(name)));
assert(evidence.commands.slice(1).every(result => result.exit === 0));
if (process.argv.includes('--run')) {
  const run = spawnSync('npx', ['--no-install','vitest','run','--project','unit',
    '--project','render','--project','react18','--reporter=dot'], {
    cwd: pkg, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  const output = run.stdout + run.stderr;
  const failures = output.split('\n').filter(line => /^ FAIL /.test(line));
  console.log(output.split('\n').filter(line => /Test Files|Tests |^ FAIL /.test(line)).join('\n'));
  assert(run.status === 0 || run.status === 1 && failures.length === 4 &&
    failures.every(line => /\|(render|react18)\|.*Form.effectFeedback.test.tsx.*EVENT-070 React stops two fields writing back through use(Layout)?Effect/.test(line)));
}
console.log(`SUITES_OK: captured ${tests.tests.passed} passed; 4 authorized EVENT-070 failures; unchanged source hashes`);
console.log('STATIC_OK: captured tsc/eslint success; reserved files match HEAD');
