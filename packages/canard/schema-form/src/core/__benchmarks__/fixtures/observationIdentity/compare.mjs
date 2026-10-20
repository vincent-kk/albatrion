// Untimed original58 compatibility; every input is explicit and bound to fresh preparation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd(),
  require = createRequire(import.meta.url);
const arg = (n) =>
  process.argv.find((x) => x.startsWith('--' + n + '='))?.slice(n.length + 3);
const out = path.resolve(arg('out') ?? arg('run') ?? '');
const sha = (p) =>
  createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const load = (p) => import(pathToFileURL(p).href),
  read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const manifestFile = path.join(out, 'manifest.json'),
  manifest = read(manifestFile);
assert.equal(manifest.schema, 'observation-identity-portability-v1');
for (const f of [
  ...manifest.provenance.configuration,
  ...manifest.provenance.dependencyInputs,
  manifest.provenance.ids,
  ...manifest.tools,
  ...manifest.lanes.source.inputs.map((x) => ({
    path: x.realPath,
    sha256: x.sha256,
  })),
  ...manifest.fixture.inputs,
])
  assert.equal(sha(f.path), f.sha256);
assert.equal(
  sha(path.join(out, manifest.fixture.path)),
  manifest.fixture.sha256,
);
for (const r of ['node', 'bun']) {
  const g = read(path.join(out, 'gate-' + r + '.json'));
  assert.equal(g.marker, 'STANDALONE_BINDING_4_CASES_PASSED');
  assert.equal(g.inputFingerprint, manifest.inputFingerprint);
}
const fixture = await load(path.join(out, manifest.fixture.path)),
  engines = {};
for (const [label, lane] of Object.entries(manifest.lanes)) {
  const file = path.join(out, lane.path);
  assert.equal(sha(file), lane.sha256);
  if (label !== 'source') {
    assert.equal(sha(lane.inputPath), lane.rawSHA256);
    assert.equal(
      fs.readFileSync(file, 'utf8'),
      fs.readFileSync(lane.inputPath, 'utf8') +
        lane.executionFooter +
        lane.getter,
    );
  }
  engines[label] = label === 'source' ? require(file) : await load(file);
}
const runtime = process.versions.bun ? 'bun' : 'node',
  histories = [],
  failures = [],
  comparisons = [],
  negativeControls = [];
const channels = [
  'nodes',
  'retiredNodes',
  'snapshot',
  'commit',
  'diagnostics',
  'globalState',
  'counts',
  'deliveryOrder',
  'latent',
  'misfits',
  'declarations',
  'rules',
  'ruleSources',
  'ruleTargets',
  'inactive',
  'inactiveMemo',
  'misfitsMemo',
  'warnings',
  'warningRecords',
  'operationResults',
  'firstListenerCommitSnapshots',
  'listenerHistory',
  'onChangeHistory',
  'referenceMatrix',
  'callerBefore',
  'callerAfter',
  'callerOwnershipChecks',
  'callerMutationIsolationChecks',
];
const nodeFields = [
  'path',
  'name',
  'key',
  'count',
  'nextKey',
  'parent',
  'root',
  'raw',
  'extras',
  'local',
  'emit',
  'value',
  'output',
  'defaultValue',
  'children',
  'structure',
  'schema',
  'active',
  'visible',
  'readOnly',
  'disabled',
  'required',
  'state',
  'revisions',
  'delivery',
  'detached',
  'errors',
  'misfit',
  'inactiveValues',
  'blueprint',
];
const schemaCoverage = {
  stateChannels: channels.slice(0, 19),
  historyChannels: channels.slice(19),
  nodeFields,
  states: 0,
  nodeViews: 0,
};
function validateObservation(observation) {
  assert.deepEqual(
    Object.keys(observation),
    channels,
    'Exact ordered channel schema',
  );
  assert.ok(Array.isArray(observation.operationResults));
  const phases = observation.operationResults.length;
  assert.ok(phases > 0);
  for (const name of channels.slice(0, 19))
    assert.equal(observation[name].length, phases, name + '/phase count');
  for (const name of ['nodes', 'retiredNodes'])
    for (const state of observation[name]) {
      assert.equal(state[0], 'array');
      assert.equal(state[2], state[3].length);
      for (const [, view] of state[3]) {
        assert.equal(view[0], 'object');
        assert.deepEqual(
          view[3].map(([name]) => name),
          nodeFields,
        );
        schemaCoverage.nodeViews++;
      }
      schemaCoverage.states++;
    }
  for (const row of observation.listenerHistory)
    assert.deepEqual(Object.keys(row), ['node', 'path', 'commit', 'event']);
  for (const snapshot of observation.firstListenerCommitSnapshots)
    assert.deepEqual(Object.keys(snapshot), channels.slice(0, 19));
  assert.equal(observation.callerOwnershipChecks.length, phases);
}
for (const [lane, engine] of Object.entries(engines)) {
  const observe = fixture.createStrictItemlessObserver(
    engine,
    engine.__readExistingRuleOwnerId,
  );
  for (const id of manifest.ids)
    try {
      const result = observe(
        fixture.makeItemlessScene(id),
        fixture.createTestValidator(),
      );
      assert.equal(result.phase, 'completed', id + '/unexpected rejection');
      validateObservation(result.observation);
      assert.equal(
        Object.keys(result.observation).length,
        28,
        id + '/all channels',
      );
      histories.push({ lane, id, result });
    } catch (e) {
      failures.push({ lane, id, message: e.message, stack: e.stack });
    }
}
if (!failures.length)
  for (const id of manifest.ids)
    for (const [a, b] of [
      ['source', 'A'],
      ['source', 'B'],
      ['A', 'B'],
    ]) {
      assert.deepEqual(
        histories.find((x) => x.lane === a && x.id === id).result,
        histories.find((x) => x.lane === b && x.id === id).result,
        id + '/' + a + '/' + b,
      );
      comparisons.push({ id, a, b });
    }
const selected = histories.find(
  (x) => x.lane === 'A' && x.id === 'derive-inject-target',
);
if (selected)
  for (const kind of [
    'rules-omission',
    'alias-loss',
    'event-loss',
    'rule-target-change',
  ]) {
    const original = structuredClone(selected.result.observation),
      corrupted = structuredClone(original);
    if (kind === 'rules-omission') delete corrupted.rules;
    if (kind === 'alias-loss') corrupted.referenceMatrix = [];
    if (kind === 'event-loss') corrupted.listenerHistory = [];
    if (kind === 'rule-target-change') corrupted.ruleTargets = [];
    assert.throws(() => assert.deepEqual(original, corrupted));
    negativeControls.push({ kind, rejected: true, original, corrupted });
  }
const file = path.join(out, 'strict-' + runtime + '.json');
fs.writeFileSync(
  file,
  JSON.stringify(
    {
      runtime,
      version: process.versions.bun ?? process.version,
      histories,
      failures,
      comparisons,
      negativeControls,
      schemaCoverage,
      manifestSHA256: sha(manifestFile),
    },
    null,
    2,
  ) + '\n',
  { flag: 'wx' },
);
console.log(
  JSON.stringify({
    file,
    histories: histories.length,
    failures,
    comparisons: comparisons.length,
    negativeControls: negativeControls.length,
  }),
);
if (failures.length) process.exitCode = 1;
