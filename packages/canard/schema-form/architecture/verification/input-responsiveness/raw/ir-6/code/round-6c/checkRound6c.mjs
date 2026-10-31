// Run with node from the checkout; the accepted round-6 head fixes the audit baseline.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
const git = (...args) =>
  execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).trim();
const accepted = 'd942c9fdc4b4fb34e2c803509a57bb87e36a9182';
const beforePR = 'facd72a71c44a798f5484827509073a27fb678a3';
const source = 'packages/canard/schema-form/src';
const raw =
  'packages/canard/schema-form/architecture/verification/input-responsiveness/raw';
assert.equal(git('diff', accepted, '--', source), '');
assert.equal(git('ls-files', '--others', '--exclude-standard', '--', source), '');
const recorded = git('ls-tree', '-r', '--name-only', accepted, '--', raw).split('\n');
const rawChanges = git('diff', '--name-only', '--no-renames', accepted, '--', raw)
  .split('\n')
  .filter(Boolean);
assert.deepEqual(rawChanges.filter((file) => recorded.includes(file)), []);
const preexisting = git('ls-tree', '-r', '--name-only', beforePR).split('\n');
const changes = git('diff', '--numstat', '--no-renames', accepted)
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('\t'));
const existingChanges = changes.filter(([, , file]) => preexisting.includes(file));
for (const [, deleted, file] of existingChanges)
  assert.equal(deleted, '0', 'Pre-PR lines must remain intact: ' + file);
const ledger = 'packages/canard/schema-form/architecture/ledger/settle.md';
const content = fs.readFileSync(path.join(repositoryRoot, ledger), 'utf8');
assert.ok(
  content.trimEnd() === git('show', accepted + ':' + ledger),
  'The accepted ledger must remain unchanged in round 6c',
);
const machinePathLines = content
  .split('\n')
  .flatMap((line, index) =>
    /[/](Users|private[/]tmp|tmp)[/]/.test(line) ? [index + 1] : [],
  );
assert.deepEqual(machinePathLines, [348, 400, 401, 829, 868, 869]);
const oldLedgerLines = git('show', beforePR + ':' + ledger).split('\n');
for (const line of machinePathLines)
  assert.ok(
    content.split('\n')[line - 1] === oldLedgerLines[line - 1],
    'The pre-existing machine-path line must remain intact: ' + line,
  );
console.log(
  `IR6_ROUND6C_SCOPE_OK productDiff=0 recordedRawDiff=0 prePRDeletions=0 prePRChangedFiles=${existingChanges.length} existingPathLines=${machinePathLines.join(',')}`,
);
