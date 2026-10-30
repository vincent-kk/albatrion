// Invoked by node run.mjs; this file is verification tooling.
// Node/Bun-compatible runner; only Node is used for this slice and its window.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { settings, stats, quantile, scene, schemaOf, inputOf, expectedOf, recorder, drain, warmEngine, writeOnce, fullCheck, childrenOf } from '../bench-common.mjs';
import { runtime, sha, expectedSha } from '../config.mjs';

const B2 = path.dirname(fileURLToPath(import.meta.url)), config = settings(true);
const manifest = JSON.parse(fs.readFileSync(path.join(B2, 'build.json'), 'utf8'));
const labels = JSON.parse(fs.readFileSync(path.join(B2, 'labels.json'), 'utf8'));
const spec = scene('object', 'BN', 1000, 'all-keys'), schema = schemaOf(spec), input = inputOf(spec), expected = expectedOf(spec);
function engineOf(M) {
  const engine = { M, legacy: false };
  engine.make = (jsonSchema, value, onChange) => {
    const root = M.fieldNodeFactory(M.blueprint(jsonSchema), { diagnostics: { status: 'stable' }, loadSnapshot: undefined, latentRaw: new M.PathKeyedMap('pair'), misfitPaths: new M.PathKeyedSet(), inactiveValuesMemo: new M.PathKeyedMap('path'), onChange });
    M.mountFieldNode(root, value, M.SetValueOption.Overwrite);
    return root;
  };
  return engine;
}
const engines = {
  baseline: engineOf(await import('./current-baseline.mjs')),
  profiling: engineOf(await import('./current-profiling.mjs')),
  focused: engineOf(await import('./current-focused.mjs')),
};
const measurements = {};
for (const variant of process.argv.includes('--reverse') ? ['focused', 'profiling', 'baseline'] : ['baseline', 'profiling', 'focused']) {
  const engine = engines[variant], samplesMs = [], profiles = [], observations = [];
  for (let i = -config.warmups; i < config.samples; i++) {
    const rec = recorder(), root = engine.make(schema, structuredClone(input), rec.onChange);
    await drain(); await warmEngine(engine);
    if (!fullCheck(engine, root, spec, input)) throw new Error('B2 fixture mismatch');
    const host = root.find('/h'), value = structuredClone(expected.h);
    rec.reset(); const result = await writeOnce(engine, spec, root, rec, expected, () => host.setValue(value, engine.M.SetValueOption.Overwrite));
    if (!result.ok) throw new Error('B2 value/completion mismatch: ' + JSON.stringify({ ...result, metrics: undefined }));
    if (i >= 0) {
      samplesMs.push(result.elapsedMs); profiles.push(result.metrics?.b2 ?? null);
      observations.push({ ok: result.ok, onChangeCalls: rec.calls, value: host.value.k500, childCount: host.children.length, rootValueMatches: fullCheck(engine, root, spec, expected) });
    }
    await drain();
  }
  measurements[variant] = { ...stats(samplesMs), status: 'pass', observations, profiles: variant !== 'baseline' ? profiles : undefined };
}
const profiles = measurements.profiling.profiles, groups = {};
for (const group of ['markWrite', 'computeStableNode', 'markCommitDeliveries', 'registerRecalculation']) {
  const activeIds = [...new Set(profiles.flatMap((sample) => Object.keys(sample[group] ?? {})))].map(Number);
  groups[group] = activeIds.map((id) => {
    const rows = profiles.map((sample) => sample[group]?.[id] ?? { inclusiveMs: 0, selfMs: 0, calls: 0 });
    return { id, name: labels[id].name, inclusiveUs: quantile(rows.map((r) => r.inclusiveMs * 1000), 0.5), selfUs: quantile(rows.map((r) => r.selfMs * 1000), 0.5), calls: quantile(rows.map((r) => r.calls), 0.5), callsPerChild: quantile(rows.map((r) => r.calls / 1000), 0.5), samplesInclusiveUs: rows.map((r) => r.inclusiveMs * 1000), samplesSelfUs: rows.map((r) => r.selfMs * 1000), samplesCalls: rows.map((r) => r.calls) };
  });
}
const focusedId = labels.find((row) => row.name === 'markWrite.default staticSpec [already-interpreted child]').id;
const focusedRows = measurements.focused.profiles.map((sample) => sample.markWrite[focusedId]);
if (focusedRows.some((row) => row.calls !== 1000)) throw new Error('Focused default-spec count mismatch');
const focused = { id: focusedId, name: labels[focusedId].name, inclusiveUs: quantile(focusedRows.map((row) => row.inclusiveMs * 1000), 0.5), calls: 1000, samplesUs: focusedRows.map((row) => row.inclusiveMs * 1000), description: 'Separate instrumented copy with only markWrite and default-spec timers; includes its own timer overhead, not a causal removable-time estimate.' };
// Separate correctness probe: subscriptions never enter the timing lane.
const correctness = {};
for (const variant of ['baseline', 'profiling', 'focused']) {
  const engine = engines[variant], rec = recorder(), root = engine.make(schema, structuredClone(input), rec.onChange);
  await drain(); await warmEngine(engine);
  const host = root.find('/h'), nodes = [root, host, ...childrenOf(host)], events = [];
  const before = nodes.map((node) => [engine.M.readFieldNodeRevision(node, 4), engine.M.readFieldNodeRevision(node, 256)]);
  const unsubscribes = nodes.map((node) => engine.M.subscribeFieldNode(node, (event) => events.push({ path: node.path, type: event.type, payload: event.payload, options: event.options })));
  rec.reset(); host.setValue(structuredClone(expected.h), engine.M.SetValueOption.Overwrite);
  if (!fullCheck(engine, root, spec, expected) || rec.calls !== 1) throw new Error('B2 independent correctness probe failed');
  const deltas = nodes.map((node, i) => [engine.M.readFieldNodeRevision(node, 4) - before[i][0], engine.M.readFieldNodeRevision(node, 256) - before[i][1]]);
  correctness[variant] = { nodeCount: nodes.length, eventCount: events.length, eventDigest: sha(JSON.stringify(events)), revisionDeltaDigest: sha(JSON.stringify(deltas)), onChangeCalls: rec.calls, values: 'pass' };
  unsubscribes.forEach((unsubscribe) => unsubscribe()); await drain();
}
if (JSON.stringify(correctness.baseline) !== JSON.stringify(correctness.profiling) || JSON.stringify(correctness.baseline) !== JSON.stringify(correctness.focused)) throw new Error('B2 instrumentation changed delivery/revision observations: ' + JSON.stringify(correctness));
const count = (group, name) => groups[group].find((row) => row.name === name)?.calls ?? 0;
const counts = { markWrite: count('markWrite', 'markWrite'), computeStableNode: count('computeStableNode', 'computeStableNode'), markCommitDeliveries: count('markCommitDeliveries', 'markCommitDeliveries'), staticSpec: count('markWrite', 'staticSpec'), knownChildDefaultSpec: count('markWrite', 'markWrite.default staticSpec [already-interpreted child]') };
if (JSON.stringify(counts) !== JSON.stringify({ markWrite: 1001, computeStableNode: 1002, markCommitDeliveries: 1, staticSpec: 2001, knownChildDefaultSpec: 1000 })) throw new Error('Unexpected B2 operation counts ' + JSON.stringify(counts));
const partitionErrorsUs = {};
for (const group of Object.keys(groups)) {
  const root = groups[group].find((r) => r.name === group);
  partitionErrorsUs[group] = profiles.map((sample, i) => Math.abs(Object.values(sample[group]).reduce((sum, row) => sum + row.selfMs, 0) * 1000 - root.samplesInclusiveUs[i]));
  if (Math.max(...partitionErrorsUs[group]) > 0.01) throw new Error('B2 exclusive partition mismatch: ' + group);
}
const record = { kind: 'b2-profile', runtime: runtime(), nodeEnv: process.env.NODE_ENV ?? null, engineSha256: manifest.engineSha256, bundleSha256: sha(fs.readFileSync(path.join(B2, 'current-profiling.mjs'))), focusedBundleSha256: sha(fs.readFileSync(path.join(B2, 'current-focused.mjs'))), labelsSha256: sha(fs.readFileSync(path.join(B2, 'labels.json'))), config, scene: spec, generatedAt: new Date().toISOString(), measurements, counts, groups, focused, correctness, partitionErrorsUs, method: 'All synchronous bundle functions, dynamic/built-in call expressions, loop bodies, literal allocations and writes; outermost inclusive + additive exclusive, scoped to three hot spots and separate adjacent registration. Timer/callback overhead perturbs measurements; percentages of the old uninstrumented gap are descriptive, not removable-time estimates.' };
if (record.engineSha256 !== expectedSha.current) throw new Error('B2 provenance mismatch');
console.log(JSON.stringify(record));
