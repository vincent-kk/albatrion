// Read captured gate receipts; source hashes bind the evidence to the verified files.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

const round = process.argv[2];
assert.ok(round === undefined || round === '--round=2' || round === '--round=3' || round === '--round=4');
const root = new URL(round ? `./round-${round.slice(-1)}/` : './', import.meta.url);
const packageRoot = new URL('../../../../../../', import.meta.url);
const report = JSON.parse(fs.readFileSync(new URL('code-gates.json', root)));
for (const [file, hash] of Object.entries(report.sourceHashes))
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL(file, packageRoot))).digest('hex'), hash, file);
for (const [gate, result] of Object.entries(report.gates)) {
  assert.equal(result.exitCode, 0, gate);
  if (!result.artifact) continue;
  const raw = JSON.parse(gunzipSync(fs.readFileSync(new URL(result.artifact, root))));
  assert.equal(raw.success, true, gate);
  assert.equal(raw.numFailedTests, 0, gate);
  assert.equal(raw.testResults.length, result.files, gate);
  assert.equal(raw.numPassedTests, result.passed, gate);
  assert.equal(raw.numTodoTests, result.todo, gate);
}
const round2 = !!round;
const declarationBytes = fs.readFileSync(new URL(round2 ? 'evaluated-public-declarations.json.gz' : 'public-declarations.json', root));
const declarations = JSON.parse(round2 ? gunzipSync(declarationBytes) : declarationBytes);
assert.equal(declarations.rootExportsEqual, true);
assert.deepEqual(declarations.semanticDifferences, { added: [], removed: [] });
assert.equal(declarations.indexByteDifference, false);
if (round2) {
  assert.deepEqual(declarations.unsafeRuntimeExposures, []);
  assert.deepEqual(declarations.unresolvedAliases, []);
  assert.equal(declarations.candidateRootTraces.length, 97);
  const controls = JSON.parse(fs.readFileSync(new URL('declaration-controls.json', root)));
  assert.equal(controls.positiveExitCode, 1);
  assert.ok(controls.positiveDifferenceCounts.added + controls.positiveDifferenceCounts.removed > 0);
  assert.equal(controls.restoreExitCode, 0);
  assert.equal(controls.restored, true);
  assert.deepEqual(controls.restoreDifferenceCounts, { added: 0, removed: 0 });
}
const fca = JSON.parse(fs.readFileSync(new URL('fca-diff.json', root)));
for (const inspection of Object.values(fca.inspections)) {
  assert.deepEqual(inspection.diagnostics, { added: [], removed: [] });
  assert.deepEqual(inspection.findings, { added: [], removed: [] });
}
console.log('IR6_CODE_GATES_OK captured-results; performance-review-and-measurement-pending');
