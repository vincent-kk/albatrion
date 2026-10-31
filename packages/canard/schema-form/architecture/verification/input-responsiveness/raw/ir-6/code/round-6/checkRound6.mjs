// Run from repository root; adjacent artifacts bind the round-6 code evidence, never performance gates.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

const directory = new URL('./', import.meta.url);
const read = (name) => {
  const bytes = fs.readFileSync(new URL(name, directory));
  return JSON.parse(name.endsWith('.gz') ? gunzipSync(bytes) : bytes.toString('utf8'));
};
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const gate = read('code-gates.json');
const sources = read('source-hashes.json.gz');
assert.equal(Object.keys(sources).length, gate.sourceFileCount);
for (const [file, hash] of Object.entries(sources)) assert.equal(digest(fs.readFileSync(file)), hash, file);
for (const [file, hash] of Object.entries(gate.artifactHashes))
  assert.equal(digest(fs.readFileSync(new URL(file, directory))), hash, file);
for (const [name, expected] of Object.entries(gate.results)) {
  const result = read('final-' + name + '.json.gz');
  assert.equal(result.numFailedTests, 0, name);
  assert.equal(result.numFailedTestSuites, 0, name);
  assert.equal(result.numPassedTests, expected.passed, name);
  assert.equal(result.testResults.length, expected.files, name);
}
assert.equal(gate.importModelPassedCases, 2);
for (const name of ['catchup-render', 'catchup-react18', 'mount-render', 'mount-react18', 'fragment-render', 'fragment-react18'])
  assert.ok(read('red-' + name + '.json.gz').numFailedTests > 0, name);
for (const check of read(gate.round6b ? '../round-6b/static-checks.json' : 'static-checks.json').checks) assert.equal(check.exitCode, 0, check.name);
const declaration = read('evaluated-public-declarations.json.gz');
assert.deepEqual(declaration.semanticDifferences, { added: [], removed: [] });
assert.deepEqual(declaration.unsafeRuntimeExposures, []);
assert.equal(declaration.indexByteDifference, false);
const control = read('declaration-controls.json');
assert.equal(control.positiveExitCode, 1);
assert.equal(control.restoreExitCode, 0);
const fca = read(gate.round6b ? '../round-6b/fca-diff.json' : 'fca-diff.json');
assert.deepEqual(fca.findings, { added: [], removed: [] });
assert.deepEqual(fca.diagnostics, { added: [], removed: [] });
assert.equal(fca.absoluteStatus, 'indeterminate');
for (const [name, result] of Object.entries(read(gate.round6b ? '../round-6b/ledger-checks.json' : 'ledger-checks.json'))) assert.equal(result.exitCode, 0, name);
for (const [name, expected] of Object.entries(gate.runtimeBundles))
  assert.equal(digest(fs.readFileSync('packages/canard/schema-form/dist/' + name)), expected.sha256, name);
assert.equal(read(gate.round6b ? '../round-6b/machine-path-audit.json' : 'machine-path-audit.json').exitCode, 0);
if (gate.round6b) {
  for (const name of ['catchup', 'mount']) {
    const proof = read('../round-6b/red-' + name + '-provenance.json');
    for (const [file, hash] of Object.entries(proof.tests))
      assert.equal(digest(fs.readFileSync('packages/canard/schema-form/' + file)), hash, file);
  }
  const fragment = read('../round-6b/red-fragment-provenance.json');
  assert.equal(digest(fs.readFileSync('packages/canard/schema-form/src/components/FieldProxy/__tests__/errorReveal.lifecycle.test.tsx')), fragment.lifecycleSha256);
  for (const major of ['render', 'react18']) {
    assert.match(JSON.stringify(read('red-catchup-' + major + '.json.gz')), /errorReveal.lifecycle.test.tsx:94:/);
    assert.match(JSON.stringify(read('red-fragment-' + major + '.json.gz')), /errorReveal.lifecycle.test.tsx:139:/);
    assert.match(JSON.stringify(read('red-mount-' + major + '.json.gz')), /visibility.mount-release.test.tsx:110:/);
  }
}
console.log('IR6_ROUND6_CODE_GATES_OK sourceFiles=' + gate.sourceFileCount + ' newFcaFindings=0 formal-window-pending');
