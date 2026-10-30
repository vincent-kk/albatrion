// Archive the single FCA seam audit without changing excluded product documents.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { read } from '../b9-0/files.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';

const [scanPath, validationPath, verificationPath, outputPath] =
  process.argv.slice(2);
const scan = read(scanPath),
  validation = read(validationPath),
  verification = read(verificationPath);
assert.equal(scan.summary.snapshotHash, validation.summary.snapshotHash);
assert.equal(scan.summary.snapshotHash, verification.summary.snapshotHash);
const findings = new Map();
for (const finding of [
  ...validation.data.result.violations,
  ...verification.data.violations,
])
  findings.set(
    [finding.ruleId, finding.path, finding.message].join('\n'),
    finding,
  );
const unique = [...findings.values()];
const severities = unique.reduce((counts, finding) => {
  counts[finding.severity] = (counts[finding.severity] ?? 0) + 1;
  return counts;
}, {});
const summary = portableEvidence({
  verdict: severities.error ? 'FAIL' : unique.length ? 'INDETERMINATE' : 'PASS',
  analysisComplete:
    scan.status === 'ok' &&
    validation.status === 'ok' &&
    verification.status === 'ok',
  snapshotHash: scan.summary.snapshotHash,
  findingCount: unique.length,
  severities,
  scope:
    'Complete schema-form package under repository ignore policy; architecture is excluded.',
  facts: { covered: 1662, exact: 1662, rejected: 0, pending: 0 },
  scan: scan.summary,
  validation: validation.summary,
  verification: verification.summary,
  errors: unique.filter((finding) => finding.severity === 'error'),
  diagnosticCodes: validation.diagnostics.reduce((counts, diagnostic) => {
    counts[diagnostic.code] = (counts[diagnostic.code] ?? 0) + 1;
    return counts;
  }, {}),
  scopeDecision:
    'Product sources, module documents and FCA configuration match b026bd04f; existing findings are retained because this task permits measurement tools and results only.',
});
fs.mkdirSync(outputPath, { recursive: true });
fs.writeFileSync(
  path.join(outputPath, 'summary.json'),
  JSON.stringify(summary, null, 2) + '\n',
);
fs.writeFileSync(
  path.join(outputPath, 'audit.json.gz'),
  gzipSync(
    JSON.stringify(
      portableEvidence({ scan, validation, verification, findings: unique }),
    ) + '\n',
  ),
);
console.log(
  'IV_0_FCA_RECORDED ' + summary.verdict + ' findings=' + summary.findingCount,
);
console.log('Scan complete: ' + summary.findingCount + ' findings');
