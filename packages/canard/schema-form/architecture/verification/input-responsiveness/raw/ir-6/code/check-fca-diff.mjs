// Loaded by the IR-6 code gate; adjacent gzip artifacts are the captured scan inputs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

const root = new URL('./', import.meta.url);
const round = process.argv[2];
assert.ok(round === undefined || round === '--round=2' || round === '--round=3' || round === '--round=4' || round === '--round=5' || round === '--round=5b' || round === '--round=5c');
const candidateRoot = round ? new URL(`round-${round.slice('--round='.length)}/`, root) : root;
const moved = {
  'package:/src/__tests__/e2e/features-composite-tails.test.tsx': [[171, 173]],
  'package:/src/__tests__/e2e/features-input-components-consumer.test.tsx': [[103, 105]],
  'package:/src/__tests__/e2e/features-validation-state-display.test.tsx': [[78, 80], [110, 112]],
};
if (round === '--round=3' || round === '--round=4' || round === '--round=5' || round === '--round=5b' || round === '--round=5c') {
  moved['package:/src/__tests__/e2e/features-composite-tails.test.tsx'] = [[171, 176]];
  moved['package:/src/__tests__/e2e/features-input-components-consumer.test.tsx'] = [[103, 106]];
}

/** Normalize only four verified declaration-line movements, retaining the raw differences. */
function canonical(item, candidate) {
  const copy = { ...item };
  if (candidate && item.ruleId === 'test-record-case-cap')
    for (const [before, after] of moved[item.path] ?? [])
      copy.message = copy.message.replace(`at line ${after} `, `at line ${before} `);
  return JSON.stringify(copy, Object.keys(copy).sort());
}

/** Compare finding multisets without dropping repeated findings or uncertainty. */
function differences(before, after, normalize = false) {
  const remaining = before.map((item) => canonical(item, false));
  const added = [];
  for (const item of after) {
    const key = canonical(item, normalize);
    const index = remaining.indexOf(key);
    if (index < 0) added.push(item);
    else remaining.splice(index, 1);
  }
  return { added, removed: remaining.map((item) => JSON.parse(item)) };
}

const report = { method: 'Exact finding and diagnostic multisets; only the four recorded line movements are normalized.', lineMovements: moved, inspections: {} };
for (const kind of ['scan', 'validate', 'verification']) {
  const read = (lane) => JSON.parse(gunzipSync(fs.readFileSync(new URL(`fca-${lane}-${kind}.json.gz`, lane === 'base' ? root : candidateRoot))));
  const before = read('base');
  const after = read('final');
  const getFindings = (value) => kind === 'validate' ? value.data.result.violations : kind === 'verification' ? value.data.violations : [];
  const result = {
    baseStatus: before.status,
    candidateStatus: after.status,
    baseSummary: before.summary,
    candidateSummary: after.summary,
    diagnostics: differences(before.diagnostics, after.diagnostics),
    rawFindings: differences(getFindings(before), getFindings(after)),
    findings: differences(getFindings(before), getFindings(after), true),
  };
  if (kind === 'verification') result.newFiles = after.data.files.filter((file) => !before.data.files.some((other) => other.path === file.path));
  report.inspections[kind] = result;
  assert.deepEqual(result.diagnostics, { added: [], removed: [] });
  assert.deepEqual(result.findings, { added: [], removed: [] });
}
fs.writeFileSync(new URL('fca-diff.json', candidateRoot), JSON.stringify(report, null, 2) + '\n');
console.log('IR6_FCA_DIFF_OK new-findings=0 absolute-status=indeterminate');
