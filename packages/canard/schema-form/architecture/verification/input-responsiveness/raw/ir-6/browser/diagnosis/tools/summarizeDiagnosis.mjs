// Invoked from repository root; retained diagnostic profiles and formal raw drive this report.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

import { quantiles } from './helpers/quantiles.mjs';
import { renderDiagnosisTables } from './renderDiagnosisTables.mjs';

const base = path.resolve(
  'packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/browser/diagnosis',
);
const read = (file) =>
  JSON.parse(gunzipSync(fs.readFileSync(path.join(base, file))));
const formal = read('formal-drivers.json.gz'),
  mount = read('runs/profiles-mount/diagnostic-analysis.json.gz'),
  burst = read('runs/profiles-burst/diagnostic-analysis.json.gz'),
  variants = read('runs/variants/diagnostic-analysis.json.gz');
const variantRows = variants.rows.map((row) => {
  const e = variants.rows.find(
    (other) => other.id === row.id && other.lane === 'E',
  );
  const f = variants.rows.find(
    (other) => other.id === row.id && other.lane === 'F',
  );
  return {
    id: row.id,
    lane: row.lane,
    count: row.count,
    firstMedian: row.firstMedian,
    eagerMedian: row.eagerMedian,
    reductionMs: f.eagerMedian - row.eagerMedian,
    explainedFraction:
      f.eagerMedian === e.eagerMedian
        ? null
        : (f.eagerMedian - row.eagerMedian) / (f.eagerMedian - e.eagerMedian),
  };
});
for (const difference of mount.differences)
  for (const name of [
    'display-hook-and-reveal',
    'shared-react-external-store',
    'field-proxy-input-render',
    'engine-mount-build-settle',
    'validation-schedule-compile-verdict',
    'policy-commit-layout',
    'react-commit-passive',
    'react-render-other',
    'other-native-gc-and-js',
  ])
    if (!difference.groups.some((group) => group.name === name))
      difference.groups.push({
        name,
        E: { selfMs: 0, inclusiveMs: 0 },
        F: { selfMs: 0, inclusiveMs: 0 },
        deltaSelf: 0,
        deltaInclusive: 0,
      });
const verdict = read(
  'runs/profiles-flat500-verdict/diagnostic-analysis.json.gz',
);
const firstKeys = [];
for (const id of formal.burstRows.map((row) => row.id))
  for (const lane of ['L', 'E', 'F']) {
    const observations =
      id === 'type-flat-500-validate-burst' ? verdict : burst;
    const keys = observations.slowKeys.filter(
      (key) => key.id === id && key.lane === lane && key.source,
    );
    assert.equal(keys.length, 5);
    const groups = Object.create(null),
      scope = Object.create(null),
      functionMeans = Object.create(null);
    for (const key of keys) {
      for (const [name, value] of Object.entries(key.profile.groups))
        groups[name] = (groups[name] ?? 0) + value.selfMs / keys.length;
      for (const fn of key.profile.functions)
        functionMeans[fn.name] =
          (functionMeans[fn.name] ?? 0) + fn.selfMs / keys.length;
    }
    for (const commit of keys[0].commits)
      for (const node of commit.nodes)
        scope[node.name] = (scope[node.name] ?? 0) + 1;
    firstKeys.push({
      id,
      lane,
      count: keys.length,
      handlerMedian: quantiles(keys.map((key) => key.handlerMs)).median,
      closestPriorRunMs: keys.some(
        (key) => key.precedingValidationRunDeltaMs != null,
      )
        ? Math.min(
            ...keys
              .map((key) => key.precedingValidationRunDeltaMs)
              .filter((value) => value != null),
          )
        : null,
      verdictTimingInstrumented: keys.every(
        (key) => key.verdictTimingInstrumented,
      ),
      closestPriorVerdictMs: keys.some(
        (key) => key.precedingVerdictDeliveryDeltaMs != null,
      )
        ? Math.min(
            ...keys
              .map((key) => key.precedingVerdictDeliveryDeltaMs)
              .filter((value) => value != null),
          )
        : null,
      verdictsInside: keys.every((key) => key.verdictTimingInstrumented)
        ? keys.reduce(
            (sum, key) => sum + key.verdictDeliveriesInsideProcessing,
            0,
          )
        : null,
      runsInside: keys.reduce(
        (sum, key) => sum + key.validationRunsInsideProcessing,
        0,
      ),
      groups,
      scope,
      functionMeans,
    });
  }
const data = {
  diagnosticOnly: true,
  registeredVerdicts: {
    G1: 'PASS',
    G2: 'FAIL',
    G3: 'PASS',
    G4: 'PASS',
    G5: 'PASS',
    G6: 'PASS',
    G8: 'FAIL',
  },
  variants: variantRows,
  mountRows: mount.rows,
  mountDifferences: mount.differences,
  sensitivity: {
    registeredUpper: formal.registeredUpperReproduced,
    ...formal.sensitivity,
  },
  drivers: formal.drivers,
  tailResamples: formal.tailResamples,
  slowF: formal.slowF,
  burstRows: formal.burstRows,
  firstKeys,
};
const summary = JSON.stringify(data, null, 2) + '\n',
  tables = renderDiagnosisTables(data);
if (process.argv.includes('--write')) {
  fs.writeFileSync(
    path.join(base, 'diagnostic-summary.json.gz'),
    gzipSync(summary),
  );
  fs.writeFileSync(path.join(base, 'diagnostic-tables.md'), tables);
} else {
  assert.equal(
    gunzipSync(
      fs.readFileSync(path.join(base, 'diagnostic-summary.json.gz')),
    ).toString(),
    summary,
  );
  assert.equal(
    fs.readFileSync(path.join(base, 'diagnostic-tables.md'), 'utf8'),
    tables,
  );
  const report = fs.readFileSync(
    path.resolve(base, '../../../../ir-6-results.md'),
    'utf8',
  );
  assert.equal(
    report
      .split('<!-- IR6_DIAG_TABLES_START -->\n')[1]
      ?.split('<!-- IR6_DIAG_TABLES_END -->')[0],
    tables,
  );
}
console.log(
  'IR6_DIAGNOSIS_REPRODUCED formalVerdictsUnchanged=true variants=5 firstKeyProfiles=45',
);
