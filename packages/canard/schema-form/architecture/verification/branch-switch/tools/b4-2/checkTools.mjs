// Synthetic review inputs only: this script never launches the formal window.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = fileURLToPath(
  new URL('../../../../../../../../', import.meta.url),
);
const tools = path.join(
  repo,
  'packages/canard/schema-form/architecture/verification/branch-switch/tools/b4-2',
);
const helpers = path.join(
  repo,
  'packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers',
);
const { buildAlternatingRows } = await import(
  pathToFileURL(path.join(helpers, 'buildAlternatingRows.mjs'))
);
const { summarizeAlternating } = await import(
  pathToFileURL(path.join(helpers, 'summarizeAlternating.mjs'))
);
const { stageNames, ledgerNames } = await import(
  pathToFileURL(path.join(tools, 'buildStages.mjs'))
);
const { createSlotRecorder } = await import(
  pathToFileURL(path.join(tools, 'recorder.mjs'))
);
assert.ok(process.argv[2], 'Provide an external synthetic output directory');
const root = path.resolve(process.argv[2]);
assert.ok(!fs.existsSync(root), 'Preserve earlier synthetic attempts');
fs.mkdirSync(root, { recursive: true });
fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });
const json = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
};
const digest = (file) => {
  const bytes = fs.readFileSync(file);
  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
};
const files = {},
  stageBundles = {};
for (const lane of ['A', 'B']) {
  files[lane] = {};
  stageBundles[lane] = {};
  for (const name of ['index.node.mjs', 'index.mjs', 'index.d.ts']) {
    const file = path.join(root, 'bundles', lane, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'export {};\n');
    files[lane][name] = digest(file);
  }
  for (const name of [
    'wrapped.mjs',
    'unwrapped.mjs',
    'supplemental.mjs',
    'instrumentation.json',
  ]) {
    const file =
      root + '-stage-' + lane.toLowerCase() + '/stages/scratch/' + name;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      name === 'instrumentation.json'
        ? JSON.stringify({
            stages: ledgerNames.map((name) => ({ name })),
            supplementalStages: stageNames.map((name) => ({ name })),
            expectedStages: { supplemental: stageNames },
          })
        : 'export {};\n',
    );
    stageBundles[lane][name] = digest(file);
  }
}
json(path.join(root, 'inputs.json'), { files, stageBundles });
const fixtures = buildAlternatingRows(true);
const results = fixtures.flatMap((row, ri) =>
  Array.from({ length: 10 }, (_, repeat) =>
    ['A', 'B'].map((lane) => ({
      row: row.id,
      repeat,
      lane,
      pid: ri * 20 + repeat * 2 + (lane === 'B' ? 1 : 0) + 1,
      samples: {
        current: Array.from({ length: 100 }, (_, i) => 1 + i / 10000),
        legacy: row.currentOnly ? [] : Array(100).fill(1),
      },
      minima: { current: 1, legacy: row.currentOnly ? null : 1 },
    })),
  ).flat(),
);
for (const record of results)
  json(
    path.join(
      root,
      'pair',
      `${record.row}-${record.lane}-${record.repeat}.command.json`,
    ),
    { status: 0, signal: null },
  );
const raw = {
  config: { quality: 'legacy', runs: 10, warmups: 20, samples: 100 },
  NODE_ENV: 'production',
  completed: true,
  validWindow: true,
  engines: Object.fromEntries(
    ['A', 'B'].map((lane) => [
      lane,
      {
        legacyVersion: '0.16.1',
        engines: {
          current: files[lane]['index.node.mjs'],
          legacy: { sha256: 'same' },
        },
      },
    ]),
  ),
  results,
  ...summarizeAlternating(fixtures, results, 'legacy'),
};
const rowNames = ['switch-oneOf-80', 'switch-payload-12', 'switch-siblings-0'];
for (const lane of ['A', 'B'])
  json(root + '-stage-' + lane.toLowerCase() + '/stages/results.json', {
    results: rowNames.flatMap((row) =>
      Array.from({ length: 3 }, (_, repeat) => ({
        row,
        repeat,
        pass: 'ledger',
        warmups: 20,
        sampleCount: 100,
        pid: (lane === 'A' ? 1000 : 2000) + rowNames.indexOf(row) * 3 + repeat,
        samples: { wrapped: Array(100).fill(1), unwrapped: Array(100).fill(1) },
        stages: Array.from({ length: 100 }, () => ({
          everythingElse: { selfUs: 1, inclusiveUs: 1, calls: 1 },
        })),
        phaseStages: Array.from({ length: 100 }, () => ({
          'everythingElse/unwrappedEntry': {
            selfUs: 1,
            inclusiveUs: 1,
            calls: 1,
          },
        })),
        groups: Array.from({ length: 100 }, () => ({
          enteringNodes: { inclusiveUs: lane === 'A' ? 2 : 1, calls: 1 },
        })),
        calls: {},
        allocationBytes: {},
      })),
    ),
  });
const supplemental = JSON.parse(
  fs.readFileSync(root + '-stage-b/stages/results.json'),
);
for (const record of supplemental.results) {
  record.pass = 'supplemental';
  record.pid += 1000;
}
json(root + '-stage-b/stages/supplemental-results.json', supplemental);
for (const runtime of ['node', 'bun'])
  for (const lane of ['A', 'B'])
    json(path.join(root, `heap-${runtime}-${lane}.log`), {
      new: { samples: Array(7).fill(100), bytesPerNode: 100 },
    });
for (const row of rowNames)
  json(path.join(root, `retention-${row}.log`), { row });
for (const name of ['quiet-window', 'window-end', 'formal-start'])
  json(
    path.join(root, name + '.json'),
    name === 'window-end' ? { processes: {} } : {},
  );
json(path.join(root, 'wildcard-cost.json'), {
  method: 'Synthetic supplemental shape only',
});
const writeRaw = () => json(path.join(root, 'pair/results.json'), raw);
const run = () =>
  spawnSync(
    process.execPath,
    [path.join(tools, 'summarize.mjs'), root, path.join(root, 'summary')],
    { encoding: 'utf8' },
  );
writeRaw();
let result = run();
assert.equal(result.status, 0, result.stderr);
const supplementaryFile = root + '-stage-b/stages/supplemental-results.json';
const supplementaryBefore = fs.readFileSync(supplementaryFile);
const supplementaryChanged = JSON.parse(supplementaryBefore);
supplementaryChanged.results[0].stages[0].setLatentRaw = {
  selfUs: 0,
  inclusiveUs: 0.1,
  calls: 1,
};
supplementaryChanged.results[0].phaseStages[0]['computeNode/setLatentRaw'] = {
  selfUs: 0,
  inclusiveUs: 0.1,
  calls: 1,
};
json(supplementaryFile, supplementaryChanged);
result = run();
assert.equal(result.status, 0, result.stderr);
assert.equal(
  JSON.parse(fs.readFileSync(path.join(root, 'summary/judgement.json'))).gates
    .latentZero,
  true,
  'supplemental calls never change comparative adoption',
);
fs.writeFileSync(supplementaryFile, supplementaryBefore);
const valid = structuredClone(raw);
const mutations = [
  [
    'B summary',
    () => {
      raw.rows[0].B.ms = 99;
    },
  ],
  [
    'legacy samples',
    () => {
      raw.results.find((r) => r.samples.legacy.length).samples.legacy[0] = -1;
    },
  ],
  [
    'quality flag',
    () => {
      raw.validWindow = false;
    },
  ],
  [
    'row identity',
    () => {
      raw.rows[0].id = 'unknown';
      for (const r of raw.results.slice(0, 20)) r.row = 'unknown';
    },
  ],
];
for (const [label, mutate] of mutations) {
  Object.assign(raw, structuredClone(valid));
  mutate();
  writeRaw();
  result = run();
  assert.notEqual(result.status, 0, label + ' must be rejected');
}
Object.assign(raw, structuredClone(valid));
writeRaw();
for (const record of raw.results)
  if (record.lane === 'B' && record.samples.legacy.length) {
    record.samples.legacy.fill(2);
    record.minima.legacy = 2;
  }
Object.assign(raw, summarizeAlternating(fixtures, raw.results, 'legacy'), {
  validWindow: false,
});
writeRaw();
result = run();
assert.equal(result.status, 0, result.stderr);
assert.equal(
  JSON.parse(fs.readFileSync(path.join(root, 'summary/judgement.json')))
    .verdict,
  '판정 불가',
);
Object.assign(raw, structuredClone(valid));
writeRaw();
const gateFile = root + '-stage-b/stages/results.json';
const gateBefore = fs.readFileSync(gateFile);
const gateRecords = JSON.parse(gateBefore);
for (const record of gateRecords.results.filter(
  (record) => record.row === 'switch-oneOf-80',
)) {
  for (let index = 0; index < 100; index++) {
    record.stages[index].everythingElse.selfUs = 0.9;
    record.stages[index].everythingElse.inclusiveUs = 0.9;
    record.stages[index].markCommitDeliveries = {
      selfUs: 0.1,
      inclusiveUs: 0.1,
      calls: 1,
    };
    record.phaseStages[index]['everythingElse/unwrappedEntry'].selfUs = 0.9;
    record.phaseStages[index]['everythingElse/unwrappedEntry'].inclusiveUs =
      0.9;
    record.phaseStages[index]['commitSettlement/markCommitDeliveries'] = {
      selfUs: 0.1,
      inclusiveUs: 0.1,
      calls: 1,
    };
  }
}
json(gateFile, gateRecords);
result = run();
assert.equal(result.status, 0, result.stderr);
assert.equal(
  JSON.parse(fs.readFileSync(path.join(root, 'summary/judgement.json'))).gates
    .clonedDelivery,
  false,
  'delivery beyond A width is rejected',
);
fs.writeFileSync(gateFile, gateBefore);
const siblings = JSON.parse(gateBefore);
for (const record of siblings.results.filter(
  (record) => record.row === 'switch-siblings-0',
)) {
  record.samples.wrapped.fill(2);
  record.samples.unwrapped.fill(2);
  for (let index = 0; index < 100; index++)
    for (const metrics of [
      record.stages[index].everythingElse,
      record.phaseStages[index]['everythingElse/unwrappedEntry'],
    ]) {
      metrics.selfUs = 2;
      metrics.inclusiveUs = 2;
    }
}
json(gateFile, siblings);
result = run();
assert.equal(result.status, 0, result.stderr);
const rejectedSiblings = JSON.parse(
  fs.readFileSync(path.join(root, 'summary/judgement.json')),
).gates;
assert.equal(rejectedSiblings.siblingsLedger, false);
assert.equal(rejectedSiblings.siblingsLatency, false);
fs.writeFileSync(gateFile, gateBefore);
const stageFile = root + '-stage-b/stages/results.json';
const stage = JSON.parse(fs.readFileSync(stageFile));
stage.results[0].stages[0].setLatentRaw = {
  selfUs: 0,
  inclusiveUs: 0.1,
  calls: 1,
};
stage.results[0].phaseStages[0]['computeNode/setLatentRaw'] = {
  selfUs: 0,
  inclusiveUs: 0.1,
  calls: 1,
};
json(stageFile, stage);
result = run();
assert.equal(result.status, 0, result.stderr);
assert.equal(
  JSON.parse(fs.readFileSync(path.join(root, 'summary/judgement.json'))).gates
    .latentZero,
  false,
  'one nonzero timed sample cannot be hidden by median or profile',
);
stage.results[0].phaseStages[0]['everythingElse/unwrappedEntry'].selfUs = 999;
json(stageFile, stage);
result = run();
assert.notEqual(result.status, 0, 'phase mismatch must be rejected');
const recorder = createSlotRecorder();
recorder.enabled = true;
const outer = recorder.enter('cloneFromSlot');
const inner = recorder.enter('cloneSlotSubtree');
recorder.exit(inner);
recorder.exit(outer);
assert.equal(recorder.groups.enteringNodes.calls, 1);
assert.ok(
  recorder.groups.enteringNodes.inclusiveUs >=
    recorder.metrics.cloneSlotSubtree.inclusiveUs,
);
recorder.reset();
assert.deepEqual(recorder.groups, {});
const creation = recorder.enterCreation('cloneFromSlot');
assert.equal(recorder.enterCreation('createFieldNode'), undefined);
recorder.exit(creation);
assert.equal(recorder.groups.enteringNodes.calls, 1);
recorder.reset();
const before = fs.readFileSync(path.join(root, 'bundles/A/index.node.mjs'));
fs.appendFileSync(path.join(root, 'bundles/A/index.node.mjs'), '// changed');
result = spawnSync(process.execPath, [path.join(tools, 'window.mjs'), root], {
  encoding: 'utf8',
});
assert.notEqual(result.status, 0);
assert.match(result.stderr, /hash|SHA|bytes|input/i);
assert.ok(
  !fs.existsSync(path.join(root, 'formal-start.json')) ||
    JSON.parse(fs.readFileSync(path.join(root, 'formal-start.json')))
      .startedAt === undefined,
);
fs.writeFileSync(path.join(root, 'bundles/A/index.node.mjs'), before);
const { verifyInputs } = await import(
  pathToFileURL(path.join(tools, 'verifyInputs.mjs'))
);
const stageBundle = root + '-stage-b/stages/scratch/wrapped.mjs';
const stageBefore = fs.readFileSync(stageBundle);
fs.appendFileSync(stageBundle, '// changed');
assert.throws(() => verifyInputs(root), /Input bytes|Input hash/);
fs.writeFileSync(stageBundle, stageBefore);
verifyInputs(root);
console.log('B4_2_TOOL_SMOKE_OK synthetic-only');
