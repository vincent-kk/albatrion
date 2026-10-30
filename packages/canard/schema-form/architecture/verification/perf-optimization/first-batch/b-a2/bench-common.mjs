// Imported by run-b, run-a2, run-breakdown, run-a2-breakdown, run-terminal and b2/run for measurement fixtures.
// Shared by standalone runners. Fixture creation/drains/warming and full checks
// remain outside write timing; legacy completion follows the round-369 probes.
import { performance } from 'node:perf_hooks';
import { isDeepStrictEqual } from 'node:util';
import { SB, P, runtime, identity, currentStages, legacyStages } from './config.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
// The workspace adapter owns the same observable mount endpoint for copied runners.
const { materializeMountedValues } = await import(pathToFileURL(path.join(P, 'bench/distEngine/loadDistEngine.ts')).href);
const comparisonLabel = 'nextExtras.sameValue';

export const option = (name, fallback) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
export const ordered = (values) => process.argv.includes('--reverse') ? [...values].reverse() : values;
export function settings(breakdown = false) {
  const smoke = process.argv.includes('--smoke');
  const warmups = Number(option('warmups', smoke ? 2 : 20));
  const samples = Number(option('samples', smoke ? 3 : breakdown ? 40 : 100));
  if (!Number.isInteger(warmups) || warmups < 0 || !Number.isInteger(samples) || samples < 1) throw new Error('Invalid warmups/samples');
  return { smoke, warmups, samples };
}
export const metadata = (name, config) => ({ kind: 'benchmark', name, runtime: runtime(), nodeEnv: process.env.NODE_ENV ?? null, config, lane: 'steady for writes; core for mount', completion: { current: 'Stop at call return; assert value and expected onChange immediately afterwards.', legacy: 'Stop at the later of matching onChange and root/host/children values settled, capped at 1000 hops/1000 ms.' } });
export const quantile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), at = (sorted.length - 1) * p;
  const low = Math.floor(at), high = Math.ceil(at);
  return sorted[low] + (sorted[high] - sorted[low]) * (at - low);
};
export const stats = (samplesMs) => ({ medianMs: quantile(samplesMs, 0.5), p10Ms: quantile(samplesMs, 0.1), p90Ms: quantile(samplesMs, 0.9), samplesMs });
export const objectOf = (n, offset = 0) => Object.fromEntries(Array.from({ length: n }, (_, i) => ['k' + i, i + offset]));
export function scene(kind, host, n, op, keyIndex) {
  return { id: `${kind}-${host}-${op}${keyIndex === undefined ? '' : '-k' + keyIndex}-N${n}`, kind, host, n, op, keyIndex };
}
export const a2Scenes = () => [
  ...['B0', 'B1'].flatMap((host) => ['mount', 'one-key', 'all-keys'].map((op) => scene('object', host, 1000, op, op === 'one-key' ? 500 : undefined))),
  scene('array', 'B0', 8000, 'push'), scene('array', 'B0', 8000, 'remove-front'),
];
export const a2LedgerScenes = () => [scene('object', 'B0', 1000, 'merge-one-key'), scene('object', 'B0', 1000, 'caller-mutates-after-write', 500)];
export const bScenes = () => [100, 1000].map((n) => scene('object', 'BN', n, 'all-keys'));
export const terminalScenes = () => [...[0, 500, 999].map((index) => scene('object', 'T', 1000, 'one-key', index)), scene('object', 'T', 1000, 'all-keys')];
export function schemaOf(spec, legacy = false) {
  const host = { type: spec.kind };
  if (spec.host === 'T') { if (legacy) host.terminal = true; else host.options = { terminal: true }; }
  if (spec.kind === 'object' && (spec.host === 'B1' || spec.host === 'BN')) host.properties = Object.fromEntries(Array.from({ length: spec.host === 'B1' ? 1 : spec.n }, (_, i) => ['k' + i, { type: 'number' }]));
  if (spec.kind === 'array' && spec.host === 'BN') host.items = { type: 'number' };
  return { type: 'object', properties: { h: host } };
}
export function inputOf(spec) { return { h: spec.kind === 'array' ? Array.from({ length: spec.n }, (_, i) => i) : objectOf(spec.n) }; }
export function expectedOf(spec) {
  const value = inputOf(spec);
  if (spec.op === 'mount') return value;
  if (spec.kind === 'object') {
    if (spec.op === 'all-keys') value.h = objectOf(spec.n, spec.n);
    else if (spec.op === 'merge-one-key') value.h['k' + spec.n] = -1;
    else value.h['k' + (spec.keyIndex ?? Math.floor(spec.n / 2))] = -1;
  } else if (spec.op === 'push') value.h.push(spec.n);
  else if (spec.op === 'remove-front') value.h.shift();
  return value;
}
export const writeInputOf = (spec, expected = expectedOf(spec)) => spec.op === 'merge-one-key' ? { h: { ['k' + spec.n]: -1 } } : structuredClone(expected);
const immediate = () => new Promise((resolve) => setImmediate(resolve));
const microtask = () => new Promise((resolve) => queueMicrotask(resolve));
export async function drain() { for (let i = 0; i < 3; i++) { await immediate(); await immediate(); } }
const drainMountTicks = () => new Promise((resolve) => setTimeout(() => setTimeout(resolve, 0), 0));
export function recorder() {
  const result = { calls: 0, value: undefined, at: 0, onCall: undefined, reset() { this.calls = 0; this.value = undefined; this.at = 0; } };
  result.onChange = (value) => { result.calls++; result.value = value; result.at = performance.now(); result.onCall?.(); };
  return result;
}
export const childrenOf = (node) => Array.from(node.children ?? [], (child) => child && typeof child === 'object' && 'node' in child ? child.node : child);
export function matchesHost(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value) !== Array.isArray(expected)) return false;
  const keys = Object.keys(expected);
  if (Object.keys(value).length !== keys.length || (Array.isArray(expected) && value.length !== expected.length)) return false;
  return [0, Math.floor(keys.length / 2), keys.length - 1].every((i) => i < 0 || i >= keys.length || value[keys[i]] === expected[keys[i]]);
}
export const matchesRoot = (value, expected) => value && typeof value === 'object' && Object.keys(value).length === 1 && matchesHost(value.h, expected.h);
export function nodesSettled(root, host, spec, expected) {
  if (!matchesRoot(root.value, expected) || !matchesHost(host.value, expected.h) || host.path !== '/h') return false;
  const children = childrenOf(host), count = spec.host === 'BN' ? Object.keys(expected.h).length : spec.host === 'B1' ? 1 : 0;
  if (children.length !== count) return false;
  return [0, Math.floor(children.length / 2), children.length - 1].every((i) => i < 0 || i >= children.length || (children[i].name === (spec.kind === 'array' ? String(i) : 'k' + i) && children[i].path === '/h/' + children[i].name && children[i].value === expected.h[children[i].name]));
}
export function fullCheck(engine, root, spec, expected) {
  const host = root.find('/h');
  if (!host || !isDeepStrictEqual(root.value, expected) || !isDeepStrictEqual(host.value, expected.h) || !nodesSettled(root, host, spec, expected)) return false;
  if ((engine.legacy ? host.group : host.strategy) !== (spec.host === 'T' ? 'terminal' : 'branch')) return false;
  if (spec.host === 'B1' && root.find('/h/k1')) return false;
  return childrenOf(host).every((child) => child.path === '/h/' + child.name && child.value === expected.h[child.name]);
}
let domModules;
async function legacyDom() {
  if (domModules) return domModules;
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  const React = await import('react'), ReactDOM = await import('react-dom'), ReactDOMClient = await import('react-dom/client');
  domModules = { dom, React, ReactDOM, ReactDOMClient };
  return domModules;
}
export async function loadEngine(name = 'current', variant = 'baseline', instrumented = false) {
  if (name !== 'current' && name !== 'legacy') throw new Error('Unknown engine ' + name);
  const legacy = name === 'legacy';
  const filename = `${name}-${instrumented ? 'instrumented' : variant}.mjs`;
  const dom = legacy ? await legacyDom() : undefined;
  const M = await import(pathToFileURL(path.join(SB, filename)).href);
  const engine = { ...identity(name, filename), legacy, M, variant, instrumented };
  engine.make = (schema, input, onChange) => {
    if (legacy) {
      let captured;
      const root = dom.ReactDOMClient.createRoot(document.createElement('div'));
      dom.ReactDOM.flushSync(() => root.render(dom.React.createElement(M.Form, { jsonSchema: schema, defaultValue: input, onChange, children: ({ node }) => { captured = node; return null; } })));
      dom.ReactDOM.flushSync(() => root.unmount());
      if (!M.isObjectNode(captured)) throw new Error('Legacy Form did not return an object node');
      return captured;
    }
    const root = M.fieldNodeFactory(M.blueprint(schema), { diagnostics: { status: 'stable' }, loadSnapshot: undefined, latentRaw: new M.PathKeyedMap('pair'), misfitPaths: new M.PathKeyedSet(), inactiveValuesMemo: new M.PathKeyedMap('path'), onChange });
    M.mountFieldNode(root, input, M.SetValueOption.Overwrite);
    return root;
  };
  engine.core = (schema, input, onChange) => {
    if (legacy) {
      const root = M.nodeFromJSONSchema({ jsonSchema: schema, defaultValue: input, validationMode: 0, onChange });
      return materializeMountedValues(root);
    }
    const root = M.buildFieldNodeTree({ jsonSchema: schema, defaultValue: input, validationMode: 0, onChange });
    M.mountFieldNode(root, undefined, undefined, { deferValidation: false });
    return materializeMountedValues(root);
  };
  return engine;
}
export async function warmEngine(engine) {
  const tiny = engine.make({ type: 'object', properties: { k0: { type: 'number' } } }, { k0: 0 });
  if (engine.legacy) await drain();
  const leaf = tiny.find('/k0');
  if (!leaf) throw new Error('Missing warmup leaf');
  if (engine.legacy) {
    if (!leaf.readOnly && !leaf.disabled) {
      leaf.setValue(1, 1 | 2 | 4 | 128); leaf.clearExternalErrors();
      if (!leaf.state[engine.M.NodeState.Dirty]) leaf.setState({ [engine.M.NodeState.Dirty]: true });
    }
  } else engine.M.writeFieldNodeInput(leaf, 1, engine.M.SetValueOption.Overwrite);
  await drain();
}
export function invoke(engine, spec, host, expected) {
  if (spec.op === 'push') return host.push(spec.n);
  if (spec.op === 'remove-front') return host.remove(0);
  return host.setValue(expected.h, spec.op === 'merge-one-key' ? engine.M.SetValueOption.Merge : engine.M.SetValueOption.Overwrite);
}
export async function writeOnce(engine, spec, root, rec, expected, customInvoke) {
  const host = root.find('/h');
  let completeAt, changeSeen = false, fromOnChange = false, microtaskHops = 0, macrotaskHops = 0;
  if (engine.legacy) rec.onCall = () => {
    if (completeAt !== undefined) return;
    if (matchesRoot(rec.value, expected)) changeSeen = true;
    if (changeSeen && nodesSettled(root, host, spec, expected)) { completeAt = rec.at; fromOnChange = true; }
  };
  const start = performance.now();
  engine.M.__benchStart?.(start);
  let returned, error;
  try { returned = customInvoke ? customInvoke() : invoke(engine, spec, host, expected); }
  catch (e) { error = e.message; }
  const returnedAt = performance.now();
  if (!engine.legacy) completeAt = returnedAt;
  while (engine.legacy && !error && completeAt === undefined && microtaskHops + macrotaskHops < 1000 && performance.now() - start <= 1000) {
    await microtask(); microtaskHops++;
    if (completeAt === undefined && changeSeen && nodesSettled(root, host, spec, expected)) completeAt = performance.now();
    if (completeAt !== undefined) break;
    await immediate(); macrotaskHops++;
    if (completeAt === undefined && changeSeen && nodesSettled(root, host, spec, expected)) completeAt = performance.now();
  }
  rec.onCall = undefined;
  const metrics = engine.M.__benchStop?.(completeAt ?? performance.now());
  // For current, these checks execute immediately after the timed call returns.
  const onChange = rec.calls > 0 && matchesRoot(rec.value, expected);
  const settled = nodesSettled(root, host, spec, expected);
  const full = fullCheck(engine, root, spec, expected);
  let returnedValue;
  try { returnedValue = await returned; } catch (e) { error ??= e.message; }
  const returnedOk = spec.op === 'push' ? returnedValue === spec.n + 1 : spec.op === 'remove-front' ? returnedValue === 0 : returnedValue === undefined;
  return { elapsedMs: completeAt === undefined ? null : completeAt - start, ok: !error && completeAt !== undefined && onChange && settled && full && returnedOk, error, onChange, settled, full, returnedOk, microtaskHops, macrotaskHops, fromOnChange, metrics };
}
export async function measure(engine, spec, config) {
  const schema = schemaOf(spec, engine.legacy), input = inputOf(spec), expected = expectedOf(spec), samplesMs = [], observations = [], functionSamples = [], stageSamples = [], splitSamples = [];
  let warmupPasses = 0;
  for (let index = -config.warmups; index < config.samples; index++) {
    const rec = recorder(); let root, result;
    if (spec.op === 'mount') {
      const sampleInput = structuredClone(input);
      const start = performance.now(); engine.M.__benchStart?.(start); root = engine.core(schema, sampleInput, rec.onChange); const constructedAt = performance.now();
      await drainMountTicks(); const end = Math.max(constructedAt, rec.at);
      const metrics = engine.M.__benchStop?.(end);
      const full = fullCheck(engine, root, spec, expected), onChange = rec.calls === 0 || matchesRoot(rec.value, expected);
      result = { elapsedMs: end - start, ok: full && onChange, full, onChange, metrics };
    } else {
      root = engine.make(schema, structuredClone(input), rec.onChange);
      await drain(); await warmEngine(engine);
      if (!fullCheck(engine, root, spec, input)) throw new Error('Fixture mismatch: ' + engine.bundle + ' ' + spec.id);
      const writeInput = writeInputOf(spec, expected), host = root.find('/h');
      rec.reset(); result = await writeOnce(engine, spec, root, rec, expected, () => invoke(engine, spec, host, writeInput));
    }
    if (index < 0) { if (result.ok) warmupPasses++; continue; }
    samplesMs.push(result.elapsedMs);
    const { metrics, ...observation } = result; observations.push(observation);
    if (metrics) {
      functionSamples.push(metrics); stageSamples.push(metrics.stagesMs);
      const nextExtras = metrics.ms.nextExtras ?? 0, nextExtrasSameValue = metrics.ms[comparisonLabel] ?? 0, assembleObject = metrics.ms.assembleObject ?? 0;
      splitSamples.push({ nextExtras, nextExtrasCopy: nextExtras - nextExtrasSameValue, nextExtrasSameValue, assembleObject, other: result.elapsedMs - nextExtras - assembleObject, nextExtrasSameValueSharePct: nextExtras ? nextExtrasSameValue / nextExtras * 100 : 0 });
    }
    await drain();
  }
  const names = [...Object.values(engine.legacy ? legacyStages : currentStages).flat(), ...(engine.legacy ? [] : [comparisonLabel])];
  const functions = functionSamples.length ? Object.fromEntries(names.map((name) => [name, { medianUs: quantile(functionSamples.map((m) => (m.ms[name] ?? 0) * 1000), 0.5), medianCalls: quantile(functionSamples.map((m) => m.calls[name] ?? 0), 0.5), samplesUs: functionSamples.map((m) => (m.ms[name] ?? 0) * 1000), calls: functionSamples.map((m) => m.calls[name] ?? 0) }])) : undefined;
  const stages = stageSamples.length ? Object.fromEntries([...Object.keys(legacyStages), 'other'].map((name) => [name, { medianUs: quantile(stageSamples.map((m) => (m[name] ?? 0) * 1000), 0.5), samplesUs: stageSamples.map((m) => (m[name] ?? 0) * 1000) }])) : undefined;
  const splitMs = splitSamples.length ? Object.fromEntries(['nextExtras', 'nextExtrasCopy', 'nextExtrasSameValue', 'assembleObject', 'other'].map((name) => [name, { medianMs: quantile(splitSamples.map((m) => m[name]), 0.5), samplesMs: splitSamples.map((m) => m[name]) }])) : undefined;
  const nextExtrasSameValueSharePct = splitSamples.length ? { medianPct: quantile(splitSamples.map((m) => m.nextExtrasSameValueSharePct), 0.5), samplesPct: splitSamples.map((m) => m.nextExtrasSameValueSharePct) } : undefined;
  const measured = samplesMs.every((value) => Number.isFinite(value));
  return { ...identity(engine.engine, engine.bundle), variant: engine.variant, instrumented: engine.instrumented, ...spec, lane: spec.op === 'mount' ? 'core' : 'steady', ...(measured ? stats(samplesMs) : { medianMs: null, p10Ms: null, p90Ms: null, samplesMs }), status: observations.every((o) => o.ok) && warmupPasses === config.warmups ? 'pass' : 'fail', warmupPasses, observations, functions, stages, splitMs, nextExtrasSameValueSharePct };
}
function deepFreeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; }
const sameKeys = (value, expected) => value && JSON.stringify(Object.keys(value)) === JSON.stringify(Object.keys(expected));
const owns = (value, name) => value !== null && typeof value === 'object' && Object.hasOwn(value, name);
function declaredNameSnapshot(root, rec, expected) {
  const host = root.find('/h'), child = root.find('/h/k0'), emitted = (rec.value ?? root.value)?.h;
  return {
    extrasHasK0: owns(host.undeclaredValues, 'k0'), extrasK0: host.undeclaredValues?.k0 ?? null,
    emittedHasK0: owns(emitted, 'k0'), emittedK0: emitted?.k0 ?? null, declaredChildK0: child?.value ?? null,
    emittedK0MatchesDeclaredChild: emitted?.k0 === child?.value,
    emittedUnexpectedK0: !owns(expected.h, 'k0') && owns(emitted, 'k0'),
    unexpectedEmittedKeys: Object.keys(emitted ?? {}).filter((name) => !owns(expected.h, name)),
  };
}
async function observeCallerMutation(engine, spec) {
  const rec = recorder(), expected = expectedOf(spec), callerInput = structuredClone(expected.h);
  try {
    const root = engine.make(schemaOf(spec), inputOf(spec), rec.onChange);
    await drain(); await warmEngine(engine); rec.reset();
    const first = await writeOnce(engine, spec, root, rec, expected, () => root.find('/h').setValue(callerInput, engine.M.SetValueOption.Overwrite));
    const host = root.find('/h'), key = 'k500', marker = -123456, beforeCalls = rec.calls;
    const snapshot = () => ({ hostValue: host.value?.[key], rootValue: root.value?.h?.[key], extrasValue: host.undeclaredValues?.[key], hostFollows: host.value?.[key] === marker, rootFollows: root.value?.h?.[key] === marker, extrasFollow: host.undeclaredValues?.[key] === marker, extrasAliasCallerInput: host.undeclaredValues === callerInput });
    const before = snapshot();
    callerInput[key] = marker;
    const immediate = snapshot(); await drain(); const afterDrain = snapshot();
    return { status: first.ok && !afterDrain.hostFollows && !afterDrain.rootFollows && !afterDrain.extrasFollow ? 'pass' : 'fail', firstWriteNormal: first.ok, key, callerMutation: marker, before, immediate, afterDrain, extraOnChangeCalls: rec.calls - beforeCalls, throws: false, note: 'Intentional caller mutation is outside the separate WRITE-013 core-mutation check; no second engine write occurs during this observation.' };
  } catch (error) { return { status: 'fail', throws: true, error: error.message }; }
}
export function removableAccounting(spec, checks) {
  const conditions = { inputHoldsNoDeclaredNames: spec.kind === 'object' ? spec.host === 'B0' : null, noPreviousExtrasToMerge: spec.kind === 'object' ? spec.op !== 'merge-one-key' : null, coreNeverMutatesObjectLater: checks.WRITE013.status === 'pass' };
  let category;
  if (spec.kind === 'array') category = 'context only (array slot path; no nextExtras)';
  else if (spec.op === 'merge-one-key') category = 'separate Merge scene (previous extras must be merged; SETTLE-042)';
  else if (spec.op === 'caller-mutates-after-write') category = 'separate caller-mutates-after-write scene';
  else if (spec.host === 'B1') category = 'outside conditions (declared name in input)';
  else if (!conditions.coreNeverMutatesObjectLater) category = 'outside conditions (WRITE-013 failed)';
  else category = 'removable';
  return { category, v1Eligible: category === 'removable' && Object.values(conditions).every((value) => value === true), conditions, scope: 'Target host /h nextExtras. Whole-bundle v1 timings are counterfactual observations, not an exact isolated copy cost; enclosing-root behavior may also change.' };
}
export async function correctness(engine, spec) {
  async function exercise(frozen) {
    const rec = recorder(), schema = schemaOf(spec), firstExpected = expectedOf(spec), mountExpected = inputOf(spec);
    const callerInput = structuredClone(spec.op === 'mount' || spec.kind === 'array' ? mountExpected.h : writeInputOf(spec, firstExpected).h);
    const comparison = deepFreeze(structuredClone(callerInput));
    if (frozen) deepFreeze(callerInput);
    const fixtureInput = spec.op === 'mount' || spec.kind === 'array' ? { h: callerInput } : structuredClone(mountExpected);
    let root;
    try {
      root = spec.op === 'mount' ? engine.core(schema, fixtureInput, rec.onChange) : engine.make(schema, fixtureInput, rec.onChange);
      await drainMountTicks(); await drain();
      const mount = fullCheck(engine, root, spec, mountExpected), mountOrder = sameKeys(root.find('/h').value, mountExpected.h);
      const declaredNames = spec.host === 'B1' ? { afterMount: declaredNameSnapshot(root, rec, mountExpected) } : undefined;
      const previousExtras = root.find('/h').undeclaredValues, previousCopy = structuredClone(previousExtras);
      let first;
      if (spec.op === 'mount') first = { ok: mount && (rec.calls === 0 || matchesRoot(rec.value, firstExpected)), onChange: rec.calls === 0 || matchesRoot(rec.value, firstExpected) };
      else {
        rec.reset();
        first = await writeOnce(engine, spec, root, rec, firstExpected, spec.kind === 'object' ? () => invoke(engine, spec, root.find('/h'), { h: callerInput }) : undefined);
      }
      const unchangedAfterFirst = isDeepStrictEqual(callerInput, comparison), firstOrder = sameKeys(root.find('/h').value, firstExpected.h);
      if (declaredNames) declaredNames.afterFirstWrite = declaredNameSnapshot(root, rec, firstExpected);
      const merge = spec.op === 'merge-one-key' ? {
        previousKeyCount: Object.keys(previousCopy ?? {}).length,
        hostKeyCount: Object.keys(root.find('/h').value ?? {}).length,
        extrasKeyCount: Object.keys(root.find('/h').undeclaredValues ?? {}).length,
        newExtrasObject: root.find('/h').undeclaredValues !== previousExtras,
        previousExtrasUnchanged: isDeepStrictEqual(previousExtras, previousCopy),
        retainedPreviousKeys: Object.keys(previousCopy ?? {}).every((name) => owns(root.find('/h').undeclaredValues, name) && root.find('/h').undeclaredValues[name] === previousCopy[name]),
        hostOrderMatchesExpected: sameKeys(root.find('/h').value, firstExpected.h),
        extrasOrderMatchesExpected: sameKeys(root.find('/h').undeclaredValues, firstExpected.h),
        expectedLastKey: 'k' + spec.n,
        observedLastKey: Object.keys(root.find('/h').value ?? {}).at(-1),
      } : undefined;
      // Keep the first input alive across a separate later whole-host overwrite.
      const laterExpected = structuredClone(firstExpected);
      if (spec.kind === 'object') laterExpected.h.k500 = -777;
      else laterExpected.h[Math.floor(laterExpected.h.length / 2)] = -777;
      const laterSpec = { ...spec, op: 'one-key' };
      const laterInput = structuredClone(laterExpected.h);
      rec.reset(); const later = await writeOnce(engine, laterSpec, root, rec, laterExpected, () => root.find('/h').setValue(laterInput, engine.M.SetValueOption.Overwrite));
      const unchangedAfterLater = isDeepStrictEqual(callerInput, comparison), laterOrder = sameKeys(root.find('/h').value, laterExpected.h);
      if (declaredNames) declaredNames.afterLaterWrite = declaredNameSnapshot(root, rec, laterExpected);
      return { throws: false, unchangedAfterFirst, unchangedAfterLater, mount, firstNormal: first.ok, laterNormal: later.ok, firstOnChange: first.onChange, laterOnChange: later.onChange, mountOrder, firstOrder, laterOrder, declaredNames, merge, error: first.error ?? later.error ?? null };
    } catch (error) { return { throws: true, error: error.message, unchangedAfterFailure: isDeepStrictEqual(callerInput, comparison) }; }
  }
  const unfrozen = await exercise(false), frozen = await exercise(true);
  const pass = (value) => value ? 'pass' : 'fail';
  return {
    WRITE013: { status: pass(!unfrozen.throws && unfrozen.unchangedAfterFirst && unfrozen.unchangedAfterLater), afterFirst: pass(unfrozen.unchangedAfterFirst), afterLater: pass(unfrozen.unchangedAfterLater), comparison: 'Deep-frozen structured clone; separate caller input; rechecked after a later overwrite.' },
    frozenCaller: { status: pass(!frozen.throws), throws: frozen.throws, normalStatus: pass(frozen.mount && frozen.firstNormal && frozen.laterNormal), error: frozen.error },
    VALUE002: { status: pass(unfrozen.mountOrder && unfrozen.firstOrder && unfrozen.laterOrder), afterMount: pass(unfrozen.mountOrder), afterFirstWrite: pass(unfrozen.firstOrder), afterLaterWrite: pass(unfrozen.laterOrder), orderBasis: spec.op === 'merge-one-key' ? 'SETTLE-042: previous extras retain insertion order, then the new incoming undeclared key.' : 'Host key order equals complete input order.' },
    normal: { status: pass(unfrozen.mount && unfrozen.firstNormal && unfrozen.laterNormal), mount: pass(unfrozen.mount), first: pass(unfrozen.firstNormal), later: pass(unfrozen.laterNormal), firstOnChange: pass(unfrozen.firstOnChange), laterOnChange: pass(unfrozen.laterOnChange) },
    declaredNameLeak: spec.host === 'B1' ? { status: pass(unfrozen.declaredNames && Object.values(unfrozen.declaredNames).every((state) => !state.extrasHasK0)), snapshots: unfrozen.declaredNames } : undefined,
    merge: spec.op === 'merge-one-key' ? { status: pass(unfrozen.merge?.newExtrasObject && unfrozen.merge?.previousExtrasUnchanged && unfrozen.merge?.retainedPreviousKeys && unfrozen.merge?.hostOrderMatchesExpected && unfrozen.merge?.extrasOrderMatchesExpected), ...unfrozen.merge } : undefined,
    callerMutation: spec.op === 'caller-mutates-after-write' ? await observeCallerMutation(engine, spec) : undefined,
    details: { unfrozen, frozen },
  };
}
