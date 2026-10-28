// Synthetic artifacts only; this command never executes a performance device.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { ledgerNames, stageNames } from '../b4-2/buildStages.mjs';
import { buildStages } from './buildStages.mjs';

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b6-tools-'));
const retired = [
  'captureExitedRaw',
  'setLatentRaw',
  'updateInactiveValuesMemo',
  'restoreLatentState',
];
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
    const included = (name) => lane === 'A' || !retired.includes(name);
    fs.writeFileSync(
      file,
      name === 'instrumentation.json'
        ? JSON.stringify({
            stages: ledgerNames.filter(included).map((name) => ({ name })),
            supplementalStages: stageNames
              .filter(included)
              .map((name) => ({ name })),
            expectedStages: {
              wrapped: ledgerNames.filter(included),
              supplemental: stageNames.filter(included),
            },
            absentDeviceStages: lane === 'B' ? retired : [],
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
const writeRaw = () => json(path.join(root, 'pair/results.json'), raw);
const stageFile = root + '-stage-b/stages/results.json';
const originalStage = fs.readFileSync(stageFile);
const run = () =>
  spawnSync(
    process.execPath,
    [path.join(tools, 'summarize.mjs'), root, path.join(root, 'summary')],
    { encoding: 'utf8' },
  );
writeRaw();
let result = run();
assert.equal(result.status, 0, result.stderr);
const judgement = () =>
  JSON.parse(fs.readFileSync(path.join(root, 'summary/judgement.json')));
assert.equal(judgement().adopt, true);
assert.deepEqual(
  Object.keys(judgement().gates).sort(),
  ['quality', 'test073', 'oneOfLedger', 'siblingsLedger', 'nodeHeap'].sort(),
);
for (const row of ['switch-oneOf-80', 'switch-siblings-0']) {
  const stage = JSON.parse(originalStage);
  for (const record of stage.results.filter((record) => record.row === row)) {
    record.samples.wrapped.fill(2);
    for (let i = 0; i < 100; i++) {
      record.stages[i].everythingElse.selfUs = 2;
      record.stages[i].everythingElse.inclusiveUs = 2;
      record.phaseStages[i]['everythingElse/unwrappedEntry'].selfUs = 2;
      record.phaseStages[i]['everythingElse/unwrappedEntry'].inclusiveUs = 2;
    }
  }
  json(stageFile, stage);
  result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    judgement().gates[
      row === 'switch-oneOf-80' ? 'oneOfLedger' : 'siblingsLedger'
    ],
    false,
  );
}
fs.writeFileSync(stageFile, originalStage);
json(path.join(root, 'heap-node-B.log'), {
  new: { samples: Array(7).fill(101), bytesPerNode: 101 },
});
result = run();
assert.equal(result.status, 0, result.stderr);
assert.equal(judgement().gates.nodeHeap, false);
json(path.join(root, 'heap-node-B.log'), {
  new: { samples: Array(7).fill(100), bytesPerNode: 100 },
});
const valid = structuredClone(raw);
raw.rows[0].B.ms = 99;
writeRaw();
assert.notEqual(run().status, 0, 'reject fabricated row summary');
Object.assign(raw, structuredClone(valid));
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
assert.equal(judgement().verdict, '판정 불가');
Object.assign(raw, structuredClone(valid));
writeRaw();
for (const record of raw.results)
  if (record.lane === 'B') {
    record.samples.current.fill(2);
    record.minima.current = 2;
  }
Object.assign(raw, summarizeAlternating(fixtures, raw.results, 'legacy'));
writeRaw();
result = run();
assert.equal(result.status, 0, result.stderr);
assert.equal(
  judgement().gates.test073,
  false,
  'TEST-073 rejects a real main-comparison regression',
);
Object.assign(raw, structuredClone(valid));
writeRaw();
const unauthorized = spawnSync(
  process.execPath,
  [path.join(tools, 'window.mjs'), root],
  { encoding: 'utf8' },
);
assert.notEqual(unauthorized.status, 0);
assert.match(unauthorized.stderr, /Only root may authorize/);
fs.appendFileSync(path.join(root, 'bundles/B/index.node.mjs'), '// changed');
assert.notEqual(run().status, 0, 'reject changed immutable bundle');
const fixtureRoot = path.join(root, 'source-fixture');
const modulesDir = path.resolve(tools, '../../../../../../../../node_modules');
for (const lane of ['A', 'B']) {
  const pkg = path.join(fixtureRoot, lane);
  const surface = path.join(pkg, 'src/core/surface');
  fs.mkdirSync(surface, { recursive: true });
  fs.mkdirSync(path.join(pkg, 'src/app/plugin'), { recursive: true });
  json(path.join(pkg, 'tsconfig.json'), {
    compilerOptions: { target: 'ESNext', module: 'ESNext' },
  });
  fs.writeFileSync(
    path.join(pkg, 'src/app/plugin/index.ts'),
    'export function registerPlugin() {}',
  );
  const imports = [],
    names = [];
  const aliases = {
    captureExitedRaw: 'captureLiteralStarExit',
    setLatentRaw: 'setLiteralStarRaw',
    updateInactiveValuesMemo: 'updateLiteralStarValues',
    restoreLatentState: 'restoreLiteralStarState',
  };
  for (const name of [...stageNames, ...ledgerNames].filter(
    (name, index, all) =>
      all.indexOf(name) === index && name !== 'wheelPreparation',
  )) {
    if (lane === 'B' && retired.includes(name)) continue;
    const declared = aliases[name] ?? name;
    const body =
      name === 'computeNode'
        ? `
const node = {};
function prepareHostWheelPlan(node) { return {}; }
export function computeNode(context = {hasGates: false}) {
  let wheelPlan = context.hasGates ? prepareHostWheelPlan(node) : undefined;
  let gates = 0, relocated = false, deferBaseline = false, cap = 0;
  let confirmation: boolean;
  return [wheelPlan, gates, relocated, deferBaseline, cap, confirmation];
}
`
        : `export function ${declared}(gate = {kind: 'oneOf'}) { return gate; }`;
    fs.writeFileSync(path.join(surface, declared + '.ts'), body);
    imports.push(`import {${declared}} from './${declared}';`);
    names.push(declared);
  }
  fs.writeFileSync(
    path.join(surface, 'index.ts'),
    imports.join('\n') +
      `\nexport function buildFieldNodeTree() { return [${names.join(',')}]; }\nexport function mountFieldNode() {}`,
  );
  const scratch = await buildStages(
    pkg,
    path.join(root, 'fixture-stages-' + lane),
    modulesDir,
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(scratch, 'instrumentation.json')),
  );
  assert.deepEqual(
    manifest.absentDeviceStages.sort(),
    lane === 'B' ? retired.toSorted() : [],
  );
  assert.equal(
    manifest.stages.length,
    ledgerNames.length - (lane === 'B' ? 4 : 0),
  );
}
console.log('B6_TOOL_SMOKE_OK synthetic-only');
