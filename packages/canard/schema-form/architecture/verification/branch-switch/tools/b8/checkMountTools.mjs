// CLI-only synthetic and source-boundary smoke; never builds or times product code.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

import { createMountRecorder } from './helpers/createMountRecorder.mjs';
import { instrumentMountSource } from './helpers/instrumentMountSource.mjs';
import { mountStages } from './helpers/mountStages.mjs';
import { runMountWorker } from './helpers/runMountWorker.mjs';
import { summarizeMountResults } from './helpers/summarizeMountResults.mjs';

const repository = fileURLToPath(
  new URL('../../../../../../../../', import.meta.url),
);
const prefix = 'packages/canard/schema-form/';
for (const revision of [
  '0eb03ff3b',
  '95853ae5f',
  'ad0be79ba',
  'HEAD',
  'WORKTREE',
]) {
  const names = execFileSync(
    'git',
    revision === 'WORKTREE'
      ? ['ls-files', '--', prefix + 'src']
      : ['ls-tree', '-r', '--name-only', revision, '--', prefix + 'src'],
    { cwd: repository, encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  const matches = [];
  for (const file of names.filter(
    (file) =>
      !file.includes('/__legacy__/') &&
      !file.includes('/__tests__/') &&
      (mountStages.some(
        (stage) =>
          file.endsWith('/' + stage.name + '.ts') ||
          (stage.file && file.endsWith(stage.file)),
      ) ||
        file.endsWith('/fieldNodeFactory.ts') ||
        file.endsWith('/getDependencyIndex.ts')),
  )) {
    const source =
      revision === 'WORKTREE'
        ? fs.readFileSync(path.join(repository, file), 'utf8')
        : execFileSync('git', ['show', revision + ':' + file], {
            cwd: repository,
            encoding: 'utf8',
          });
    const transformed = instrumentMountSource(
      source,
      file.slice(prefix.length),
    );
    const tree = ts.createSourceFile(
      file,
      transformed.contents,
      ts.ScriptTarget.Latest,
      true,
    );
    assert.equal(tree.parseDiagnostics.length, 0, revision + ': ' + file);
    matches.push(...transformed.sites);
  }
  for (const stage of mountStages.filter((stage) => stage.required))
    assert.equal(
      matches.filter((site) => site.name === stage.name).length,
      1,
      revision + ': ' + stage.name,
    );
  console.log('BOUNDARIES_OK ' + revision + ' ' + matches.length);
}
const source = `const appendChildEntries = (value: number) => value + 1;
const buildNodes = (value: number): number => { if (value < 0) throw new Error('probe'); return value ? buildNodes(value - 1) : appendChildEntries(2); };
const blueprint = () => buildNodes(2); globalThis.result = blueprint();`;
const transformed = instrumentMountSource(
  source,
  'src/core/engine/blueprint/buildNodes.ts',
);
const recorder = createMountRecorder(null);
const context = { __b8mount: recorder };
vm.runInNewContext(
  ts.transpileModule(transformed.contents, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText,
  context,
);
assert.equal(context.result, 3);
assert.equal(recorder.metrics.buildNodes.calls, 3);
assert.equal(recorder.metrics.appendChildEntries.calls, 1);
assert.equal(recorder.snapshot().timed, false);
assert.throws(
  () =>
    vm.runInNewContext(
      ts.transpileModule(transformed.contents + '\nbuildNodes(-1);', {
        compilerOptions: { target: ts.ScriptTarget.ES2022 },
      }).outputText,
      { __b8mount: recorder },
    ),
  /probe/,
);
recorder.reset();
let tick = 0;
const timed = createMountRecorder(() => ++tick);
const outer = timed.enter('outer', 'schemaWalk');
const inner = timed.enter('inner', 'childEntries');
timed.exit(inner);
timed.exit(outer);
assert.equal(timed.snapshot().totalUs, 3000);
assert.equal(timed.snapshot().phases.schemaWalk.selfUs, 2000);
assert.equal(timed.snapshot().phases.childEntries.selfUs, 1000);
assert.equal(
  timed.snapshot().totalUs,
  Object.values(timed.snapshot().phases).reduce(
    (sum, metric) => sum + metric.selfUs,
    0,
  ),
);
const pointerRecorder = createMountRecorder(null, true);
const owner = pointerRecorder.enter('gateBudgetIndex', 'gateBudgetPreparation');
for (let index = 0; index < 2; index++) {
  const pointer = pointerRecorder.enter(
    'parsePointerSegments',
    'pointerParsing',
    '#/oneOf/0/controls/active',
  );
  pointerRecorder.exit(pointer);
}
pointerRecorder.exit(owner);
assert.equal(
  pointerRecorder.snapshot().pointers[
    JSON.stringify([
      'parsePointerSegments',
      'gateBudgetIndex',
      'gateBudgetIndex',
      '#/oneOf/0/controls/active',
    ])
  ],
  2,
);
assert.equal(pointerRecorder.snapshot().phases.gateBudgetPreparation.calls, 3);
const inputs = {
  lanes: { S: { revision: 'stage' }, E: { revision: 'candidate' } },
  config: { runs: 10, warmups: 20, samples: 100 },
  fixture: 'mount-oneOf-80',
};
const metric = { selfUs: 1, inclusiveUs: 1, calls: 1 };
const ledger = {
  timed: true,
  totalUs: 1,
  phases: { schemaWalk: metric },
  metrics: { blueprint: metric },
};
const raw = {
  completed: true,
  records: Object.keys(inputs.lanes).flatMap((lane, laneIndex) =>
    Array.from({ length: 10 }, (_, repeat) => ({
      lane,
      repeat,
      pid: laneIndex * 10 + repeat + 1,
      config: inputs.config,
      samples: Object.fromEntries(
        ['unwrapped', 'wrapped', 'detailed'].map((mode) => [
          mode,
          Array(100).fill(1 + laneIndex),
        ]),
      ),
      ledgers: {
        wrapped: Array(100).fill(ledger),
        detailed: Array(100).fill(ledger),
      },
    })),
  ),
};
const smoke = {
  results: Object.keys(inputs.lanes).map((lane) => ({
    lane,
    timed: false,
    counts: { metrics: {} },
  })),
};
const summary = summarizeMountResults(inputs, raw, smoke);
assert.equal(summary.lanes.S.totals.unwrapped.widthUs, 0);
assert.equal(summary.increments[0].unwrappedDeltaUs, 1);
const incomplete = structuredClone(raw);
incomplete.records.pop();
assert.throws(() => summarizeMountResults(inputs, incomplete, smoke));
const duplicate = structuredClone(raw);
duplicate.records[1].pid = duplicate.records[0].pid;
assert.throws(
  () => summarizeMountResults(inputs, duplicate, smoke),
  /independent/,
);
const corrupted = structuredClone(raw);
corrupted.records[0].ledgers.wrapped[0].totalUs = 7;
assert.throws(() => summarizeMountResults(inputs, corrupted, smoke));
const nonfinite = structuredClone(raw);
nonfinite.records[0].samples.unwrapped[0] = Infinity;
assert.throws(() => summarizeMountResults(inputs, nonfinite, smoke));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'b8-mount-tools-'));
try {
  fs.mkdirSync(path.join(scratch, 'synthetic'));
  const stub = `// Synthetic mount shape, never product code.
export const buildFieldNodeTree = () => {
 const token = globalThis.__b8mount.enter('blueprint', 'schemaWalk');
 for (let index=0; index<81; index++) { const child=globalThis.__b8mount.enter('buildNodes', 'schemaWalk'); globalThis.__b8mount.exit(child); }
 globalThis.__b8mount.exit(token);
 return { value: { common:'shared', kind:'kind_0', payload_0_a:'a_0', payload_0_b:0, payload_0_c:true }, children:[] };
};
export const mountFieldNode = () => { const token=globalThis.__b8mount.enter('dispatchMount','firstSettlement'); globalThis.__b8mount.exit(token); };`;
  for (const mode of ['wrapped', 'unwrapped', 'detailed'])
    fs.writeFileSync(path.join(scratch, 'synthetic', mode + '.mjs'), stub);
  const syntheticSmoke = await runMountWorker(
    scratch,
    'synthetic',
    inputs.config,
    true,
  );
  assert.equal(syntheticSmoke.timed, false);
  assert.equal(syntheticSmoke.counts.metrics.buildNodes.calls, 81);
  assert.equal(syntheticSmoke.counts.totalUs, 0);
} finally {
  fs.rmSync(scratch, { recursive: true });
}
console.log('B8_MOUNT_TOOLS_OK');
