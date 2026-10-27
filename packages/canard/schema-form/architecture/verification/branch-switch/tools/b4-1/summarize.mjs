// Validate the fixed device and emit small, portable evidence without sample dumps.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { stageNames as originalStages } from '../../../design-optimization/tools/profile/branch-switch/buildBundle.mjs';
import { ledgerNames, stageNames } from './buildStages.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const packageDir = path.resolve(
  fileURLToPath(new URL('../../../../../', import.meta.url)),
);
const { welchTTest } = await import(
  pathToFileURL(
    path.resolve(packageDir, '../../aileron/benchmark-form/src/utils/stats.ts'),
  )
);
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b),
    mid = (sorted.length - 1) / 2;
  return (sorted[Math.floor(mid)] + sorted[Math.ceil(mid)]) / 2;
};
const summary = (values) => ({
  median: median(values),
  min: Math.min(...values),
  max: Math.max(...values),
  width: Math.max(...values) - Math.min(...values),
  processMedians: values,
});
const raw = read(path.join(root, 'pair/results.json'));
const inputs = verifyInputs(root);
const expectedRows = buildAlternatingRows(true);
assert.deepEqual(
  raw.rows.map((row) => row.id),
  expectedRows.map((row) => row.id),
);
assert.equal(raw.rows.length, 22);
assert.equal(raw.results.length, 440);
assert.equal(raw.completed, true);
assert.equal(raw.config.quality, 'legacy');
assert.equal(raw.config.runs, 10);
assert.equal(raw.config.warmups, 20);
assert.equal(raw.config.samples, 100);
assert.equal(raw.NODE_ENV, 'production');
assert.equal(new Set(raw.results.map((record) => record.pid)).size, 440);
for (const lane of ['A', 'B']) {
  assert.equal(raw.engines[lane].legacyVersion, '0.16.1');
  const bytes = fs.readFileSync(
    path.join(root, 'bundles', lane, 'index.node.mjs'),
  );
  assert.equal(
    raw.engines[lane].engines.current.sha256,
    createHash('sha256').update(bytes).digest('hex'),
  );
}
assert.equal(
  raw.engines.A.engines.legacy.sha256,
  raw.engines.B.engines.legacy.sha256,
);
const welch = [];
for (const [index, row] of raw.rows.entries()) {
  const group = raw.results.slice(index * 20, (index + 1) * 20);
  assert.deepEqual(
    group.map((record) => [record.lane, record.repeat]),
    Array.from({ length: 10 }, (_, repeat) => [
      ['A', repeat],
      ['B', repeat],
    ]).flat(),
  );
  for (const record of group) {
    assert.equal(record.row, row.id);
    assert.equal(record.samples.current.length, 100);
    assert.equal(record.minima.current, Math.min(...record.samples.current));
    assert.ok(
      record.samples.current.every(
        (value) => Number.isFinite(value) && value > 0,
      ),
    );
    const legacy = expectedRows[index].currentOnly ? [] : record.samples.legacy;
    assert.equal(legacy.length, expectedRows[index].currentOnly ? 0 : 100);
    assert.ok(legacy.every((value) => Number.isFinite(value) && value > 0));
    assert.equal(
      record.minima.legacy,
      legacy.length ? Math.min(...legacy) : null,
    );
    const command = read(
      path.join(
        root,
        'pair',
        `${row.id}-${record.lane}-${record.repeat}.command.json`,
      ),
    );
    assert.equal(command.status, 0);
    assert.equal(command.signal, null);
  }
  const a = group
    .filter((record) => record.lane === 'A')
    .map((record) => record.minima.current);
  assert.equal(row.A.ms, median(a.slice(0, 5)));
  assert.equal(row.Aprime.ms, median(a.slice(5)));
  assert.equal(
    row.widthMs,
    Math.max(
      Math.abs(row.A.ms - row.Aprime.ms),
      Math.max(...a.slice(0, 5)) - Math.min(...a.slice(0, 5)),
      Math.max(...a.slice(5)) - Math.min(...a.slice(5)),
    ),
  );
  for (const [comparison, lower, upper] of [
    ['all', 0, 10],
    ['early', 0, 5],
    ['late', 5, 10],
  ]) {
    const samples = (lane) =>
      group
        .filter(
          (record) =>
            record.lane === lane &&
            record.repeat >= lower &&
            record.repeat < upper,
        )
        .flatMap((record) =>
          record.samples.current.map((value) => 1000 / value),
        );
    const A = samples('A'),
      B = samples('B'),
      test = welchTTest(A, B);
    const percent = 100 * (test.meanB / test.meanA - 1);
    welch.push({
      row: row.id,
      comparison,
      ...test,
      percent,
      regression: percent < -15 && test.pValue < 0.05,
      samplesPerRole: A.length,
    });
  }
}
const recomputed = summarizeAlternating(expectedRows, raw.results, 'legacy');
assert.deepEqual(
  raw.rows,
  recomputed.rows,
  'Row statistics must match raw samples',
);
assert.deepEqual(
  raw.quality,
  recomputed.quality,
  'Quality must match all legacy rows',
);
assert.equal(
  raw.validWindow,
  recomputed.quality.passed,
  'Quality flag must match all-row quality',
);
assert.equal(raw.quality.assessedRows, 18);
assert.equal(
  raw.quality.ratio,
  median(
    raw.rows
      .filter((row) => row.legacyRatio !== null)
      .map((row) => row.legacyRatio),
  ),
);
const stages = [],
  stageRegressions = [],
  targets = [];
const stagePids = [];
for (const row of [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-0',
]) {
  const ledgers = Object.fromEntries(
    ['A', 'B'].map((lane) => [
      lane,
      read(
        root + '-stage-' + lane.toLowerCase() + '/stages/results.json',
      ).results.filter((record) => record.row === row),
    ]),
  );
  const measured = {};
  for (const lane of ['A', 'B']) {
    assert.equal(ledgers[lane].length, 3);
    assert.deepEqual(
      ledgers[lane].map((record) => record.repeat),
      [0, 1, 2],
      'Stage repeats stay in process order',
    );
    for (const record of ledgers[lane]) {
      stagePids.push(record.pid);
      assert.equal(record.pass, 'ledger');
      assert.equal(record.warmups, 20);
      assert.equal(record.sampleCount, 100);
      assert.equal(record.samples.wrapped.length, 100);
      assert.equal(record.samples.unwrapped.length, 100);
      assert.equal(record.stages.length, 100);
      assert.equal(record.phaseStages.length, 100);
      assert.equal(record.groups.length, 100);
      for (const [index, sample] of record.stages.entries()) {
        assert.ok(
          Math.abs(
            Object.values(sample).reduce(
              (sum, stage) => sum + stage.selfUs,
              0,
            ) - record.samples.wrapped[index],
          ) < 1e-5,
        );
        assert.ok(
          Math.abs(
            Object.values(record.phaseStages[index]).reduce(
              (sum, stage) => sum + stage.selfUs,
              0,
            ) - record.samples.wrapped[index],
          ) < 1e-5,
          'Phase self costs reconcile',
        );
        for (const [name, stage] of Object.entries(sample)) {
          const phases = Object.entries(record.phaseStages[index])
            .filter(
              ([key]) =>
                key.endsWith('/' + name) ||
                (name === 'everythingElse' &&
                  key === 'everythingElse/unwrappedEntry'),
            )
            .map(([, value]) => value);
          for (const metric of ['selfUs', 'inclusiveUs', 'calls'])
            assert.ok(
              Math.abs(
                phases.reduce((sum, phase) => sum + phase[metric], 0) -
                  stage[metric],
              ) < 1e-5,
              'Phase stage reconciles: ' + name + '/' + metric,
            );
        }
      }
    }
    const names = [...ledgerNames, 'everythingElse'];
    measured[lane] = Object.fromEntries(
      names.map((name) => [
        name,
        {
          selfUs: summary(
            ledgers[lane].map((record) =>
              median(record.stages.map((sample) => sample[name]?.selfUs ?? 0)),
            ),
          ),
          inclusiveUs: summary(
            ledgers[lane].map((record) =>
              median(
                record.stages.map((sample) => sample[name]?.inclusiveUs ?? 0),
              ),
            ),
          ),
          calls: median(ledgers[lane].map((record) => record.calls[name] ?? 0)),
          maximumCalls: Math.max(
            ...ledgers[lane].flatMap((record) => [
              record.calls[name] ?? 0,
              ...record.stages.map((sample) => sample[name]?.calls ?? 0),
            ]),
          ),
          allocationBytes: median(
            ledgers[lane].map((record) => record.allocationBytes[name] ?? 0),
          ),
        },
      ]),
    );
    measured[lane].enteringNodes = {
      inclusiveUs: summary(
        ledgers[lane].map((record) =>
          median(
            record.groups.map(
              (sample) => sample.enteringNodes?.inclusiveUs ?? 0,
            ),
          ),
        ),
      ),
    };
    measured[lane].latency = Object.fromEntries(
      ['wrapped', 'unwrapped'].map((mode) => [
        mode + 'Us',
        summary(ledgers[lane].map((record) => median(record.samples[mode]))),
      ]),
    );
  }
  for (const name of originalStages) {
    const A = measured.A[name].inclusiveUs,
      B = measured.B[name].inclusiveUs;
    if (B.median - A.median > A.width)
      stageRegressions.push({ row, stage: name, A, B });
  }
  const callsB = measured.B;
  targets.push({
    row,
    latentZero:
      callsB.setLatentRaw.maximumCalls === 0 &&
      callsB.captureExitedRaw.maximumCalls === 0,
    inactiveMemoZero: callsB.updateInactiveValuesMemo.maximumCalls === 0,
    enteringHalf:
      measured.B.enteringNodes.inclusiveUs.median <=
      measured.A.enteringNodes.inclusiveUs.median / 2,
    enteringRatio: measured.A.enteringNodes.inclusiveUs.median
      ? measured.B.enteringNodes.inclusiveUs.median /
        measured.A.enteringNodes.inclusiveUs.median
      : null,
  });
  stages.push({ row, ...measured });
}
assert.equal(new Set(stagePids).size, 18, 'Fresh stage worker processes');
const supplementalRaw = read(
  root + '-stage-b/stages/supplemental-results.json',
);
assert.equal(supplementalRaw.results.length, 9);
const supplementalPids = supplementalRaw.results.map((record) => record.pid);
assert.equal(new Set([...stagePids, ...supplementalPids]).size, 27);
const supplemental = [];
for (const row of [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-0',
]) {
  const records = supplementalRaw.results.filter(
    (record) => record.row === row,
  );
  assert.deepEqual(
    records.map((record) => record.repeat),
    [0, 1, 2],
  );
  for (const record of records) {
    assert.equal(record.pass, 'supplemental');
    assert.equal(record.warmups, 20);
    assert.equal(record.sampleCount, 100);
    assert.equal(record.samples.wrapped.length, 100);
    assert.equal(record.samples.unwrapped.length, 100);
    assert.equal(record.stages.length, 100);
    assert.equal(record.phaseStages.length, 100);
    for (const [index, sample] of record.stages.entries()) {
      for (const metrics of [sample, record.phaseStages[index]])
        assert.ok(
          Math.abs(
            Object.values(metrics).reduce(
              (sum, stage) => sum + stage.selfUs,
              0,
            ) - record.samples.wrapped[index],
          ) < 1e-5,
        );
    }
  }
  supplemental.push({
    row,
    role: 'B',
    adoption: false,
    stages: Object.fromEntries(
      [...stageNames, 'everythingElse'].map((name) => [
        name,
        {
          selfUs: summary(
            records.map((record) =>
              median(record.stages.map((sample) => sample[name]?.selfUs ?? 0)),
            ),
          ),
          inclusiveUs: summary(
            records.map((record) =>
              median(
                record.stages.map((sample) => sample[name]?.inclusiveUs ?? 0),
              ),
            ),
          ),
          calls: median(records.map((record) => record.calls[name] ?? 0)),
          maximumCalls: Math.max(
            ...records.flatMap((record) => [
              record.calls[name] ?? 0,
              ...record.stages.map((sample) => sample[name]?.calls ?? 0),
            ]),
          ),
          allocationBytes: median(
            records.map((record) => record.allocationBytes[name] ?? 0),
          ),
        },
      ]),
    ),
    latency: Object.fromEntries(
      ['wrapped', 'unwrapped'].map((mode) => [
        mode + 'Us',
        summary(records.map((record) => median(record.samples[mode]))),
      ]),
    ),
    method:
      'Supplemental full-helper timers; includes timer overhead, excluded from every adoption gate',
  });
}
const heaps = ['node', 'bun'].map((runtime) => {
  const A = read(path.join(root, `heap-${runtime}-A.log`)).new;
  const B = read(path.join(root, `heap-${runtime}-B.log`)).new;
  assert.equal(A.samples.length, 7);
  assert.equal(B.samples.length, 7);
  assert.equal(A.bytesPerNode, median(A.samples));
  assert.equal(B.bytesPerNode, median(B.samples));
  return {
    runtime,
    A,
    B,
    maximumA: Math.max(...A.samples),
    passed: B.bytesPerNode <= Math.max(...A.samples),
  };
});
const regressions = welch.filter(
  (record) => record.comparison === 'all' && record.regression,
);
const retention = [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-0',
].map((row) => read(path.join(root, 'retention-' + row + '.log')));
const gates = {
  quality: raw.validWindow === true,
  latentZero: targets.every((target) => target.latentZero),
  inactiveMemoZero: targets.every((target) => target.inactiveMemoZero),
  enteringHalf: targets.every((target) => target.enteringHalf),
  stageNoise: stageRegressions.length === 0,
  test073: regressions.length === 0,
  nodeHeap: heaps[0].passed,
};
const portableWindow = (record) => ({
  startedAt: record.startedAt,
  quietSince: record.quietSince,
  durationSeconds: record.durationSeconds,
  heavy: record.heavy,
  processes: record.rows,
});
const judgment = {
  adopt: Object.values(gates).every(Boolean),
  verdict: !gates.quality
    ? '판정 불가'
    : Object.values(gates).every(Boolean)
      ? '채택'
      : '채택 조건 미충족',
  gates,
  targets,
  stageRegressions,
  regressions,
  validated: {
    rows: 22,
    processes: 440,
    legacyRows: 18,
    stageProcesses: 18,
    stageWrites: 1800,
    supplementalProcesses: 9,
    supplementalWrites: 900,
  },
  stageRule:
    'Original B0 inclusive medians; own noise is A process-median min/max width; all new creation/clone/overlay work is included once in the outermost entering group',
  instrumentation:
    'Comparative timers cover B0 common stages plus conditional outermost entering boundaries, including cloneFromSlot once. Nested creation timers are skipped. Full helper timings and overhead are reported in the supplemental pass only, excluded from adoption. No timer overhead is subtracted; wrapped and unwrapped process medians are both reported.',
  timerSites: Object.fromEntries(
    ['A', 'B'].map((lane) => {
      const manifest = read(
        root +
          '-stage-' +
          lane.toLowerCase() +
          '/stages/scratch/instrumentation.json',
      );
      assert.deepEqual(
        manifest.stages.map((stage) => stage.name).sort(),
        (lane === 'A' ? stageNames.slice(0, 22) : ledgerNames).toSorted(),
        'Fixed comparative timer boundaries',
      );
      assert.deepEqual(
        manifest.supplementalStages.map((stage) => stage.name).sort(),
        (lane === 'A' ? stageNames.slice(0, 22) : stageNames).toSorted(),
        'Fixed supplemental timer boundaries',
      );
      return [
        lane,
        {
          ledger: manifest.stages.length,
          supplemental: manifest.supplementalStages.length,
        },
      ];
    }),
  ),
};
fs.mkdirSync(output, { recursive: true });
for (const [name, data] of Object.entries({
  'judgement.json': judgment,
  'quality.json': raw.quality,
  'results.summary.json': {
    node: raw.node?.version ?? null,
    machine: raw.machine ?? null,
    startedAt: raw.startedAt ?? null,
    endedAt: raw.endedAt ?? null,
    processOrder: raw.processOrder,
    runsPerRole: 10,
    warmups: 20,
    samples: 100,
    rows: raw.rows,
    welch,
  },
  'stages.json': stages,
  'supplemental-stages.json': supplemental,
  'heaps.json': heaps,
  'retention.json': retention,
  'wildcard-cost.json': read(path.join(root, 'wildcard-cost.json')),
  'inputs.json': inputs,
  'stage-inputs.json': Object.fromEntries(
    ['A', 'B'].map((lane) => [
      lane,
      read(
        root +
          '-stage-' +
          lane.toLowerCase() +
          '/stages/scratch/instrumentation.json',
      ),
    ]),
  ),
  'window.json': {
    start: portableWindow(read(path.join(root, 'quiet-window.json'))),
    end: portableWindow(read(path.join(root, 'window-end.json')).processes),
    formal: read(path.join(root, 'formal-start.json')),
  },
}))
  fs.writeFileSync(
    path.join(output, name),
    JSON.stringify(data, null, 2) + '\n',
  );
console.log(JSON.stringify(judgment, null, 2));
