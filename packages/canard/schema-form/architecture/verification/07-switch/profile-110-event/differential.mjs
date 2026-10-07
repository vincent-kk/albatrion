// Runtime-only differential: fixture data and compiled engines are inputs; product source text is never inspected.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const require = createRequire(path.resolve(pkg, '../../../package.json'));
process.env.NODE_PATH = path.resolve(pkg, '../../../node_modules');
require('node:module').Module._initPaths();
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const [phase, mode = 'production', comparator = 'working'] = process.argv.slice(2);
const suffix = mode === 'development' ? '-dev' : '';
const engines = Object.fromEntries(['head', comparator].map(version => [version,
  require(path.join(bundles, `event110-diff-${phase}-${version}${suffix}.cjs`))]));
const corpus = JSON.parse(fs.readFileSync(path.resolve(pkg,
  'src/core/blueprint/__tests__/fixtures/ownedInlineHead.json'), 'utf8'));
assert.equal(corpus.cases.length, 59);
const started = Date.now();
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const snapshot = value => JSON.parse(JSON.stringify(value, (key, item) =>
  key === 'stack' ? undefined : item === undefined ? { undefined: true } :
    typeof item === 'number' && !Number.isFinite(item) ? { number: String(item) } : item));
async function drain() {
  for (let index = 0; index < 64; index++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
}

/** Capture real commit work, pending tables and listeners without replacing engine algorithms. */
async function exercise(api, schema, subscribed, authored = []) {
  let root;
  try { root = api.nodeFromJSONSchema({ jsonSchema: structuredClone(schema), validationMode: 0, onChange() {} }); }
  catch (error) { return { error: { name: error.name, message: error.message } }; }
  await drain();
  const runtime = root.runtime, ids = new WeakMap(), nodes = [], handed = [], removers = [], issued = new WeakSet();
  const trace = { visits: [], revisions: [], targets: [], changedNodes: [], events: [], timeline: [], values: [] };
  let active = false;
  const identify = node => [ids.get(node), node.path];
  function track(node) {
    if (ids.has(node)) return;
    ids.set(node, nodes.length); nodes.push(node);
    for (const field of ['deliveryChanges', 'revisionLedger', 'pendingDelivery']) {
      let value = node[field];
      Object.defineProperty(node, field, { configurable: true, enumerable: true,
        get() { return value; }, set(next) {
          if (active) {
            const commit = runtime.commitNumber;
            if (field === 'deliveryChanges' && next === 0) trace.visits.push([commit, ...identify(node)]);
            if (field === 'revisionLedger' && node.pendingRevision) {
              const mask = node.pendingRevision, counts = [];
              for (let bit = 1; bit <= 65536; bit *= 2) {
                counts.push(next[bit] ?? 0);
                if (mask & bit) assert.equal(next[bit], (value[bit] ?? 0) + 1);
              }
              trace.revisions.push([commit, ...identify(node), mask, counts]);
              trace.timeline.push(['revision', commit, ...identify(node)]);
            }
            if (field === 'pendingDelivery' && value && next === undefined) {
              for (const object of [value, value.payload, value.options]) {
                if (!object) continue;
                assert(!issued.has(object), 'An already handed-out event/payload/options table was reused');
                issued.add(object);
              }
              handed.push([value, snapshot(value)]);
            }
          }
          value = next;
        } });
    }
    if (subscribed) removers.push(node.subscribe(event => {
      for (const record of nodes) assert.equal(record.pendingRevision, 0,
        'A listener ran before a commit revision increment');
      trace.events.push([runtime.commitNumber, ...identify(node), snapshot(event)]);
      trace.timeline.push(['listener', runtime.commitNumber, ...identify(node)]);
    }));
  }
  const pending = [root];
  while (pending.length) {
    const node = pending.shift(); track(node);
    for (const child of node.children ?? []) pending.push(child);
  }
  const mountedNodes = nodes.length;
  const factory = runtime.nodeFactory;
  runtime.nodeFactory = function(...args) { const node = factory(...args); track(node); return node; };
  let deliveries = runtime.deliveries;
  Object.defineProperty(runtime, 'deliveries', { configurable: true, enumerable: true,
    get() { return deliveries; }, set(next) {
      if (active && deliveries?.size) trace.targets.push([runtime.commitNumber, [...deliveries].map(identify)]);
      deliveries = next;
    } });
  const watched = new WeakSet();
  function watchScratch(scratch) {
    if (!scratch || watched.has(scratch.changedNodes)) return;
    const set = scratch.changedNodes, clear = set.clear; watched.add(set);
    set.clear = function() {
      if (active && this.size) trace.changedNodes.push([runtime.commitNumber, [...this].map(identify)]);
      return clear.call(this);
    };
  }
  let scratch = runtime.settlementScratch; watchScratch(scratch);
  Object.defineProperty(runtime, 'settlementScratch', { configurable: true, enumerable: true,
    get() { return scratch; }, set(next) { scratch = next; watchScratch(next); } });
  const scenarios = authored.map(interaction => ({ path: interaction.path, value: interaction.value }));
  for (const node of nodes.slice()) {
    if (node.behavior.strategy !== 'terminal') continue;
    const effective = node.schema.schema;
    const alternatives = effective && typeof effective === 'object' ? effective.enum : undefined;
    const first = alternatives?.length ? alternatives[0] : node.type === 'number' ? 17 :
      node.type === 'boolean' ? true : node.type === 'null' ? null : node.type === 'array' ? [1] :
        node.type === 'object' ? { event: 1 } : 'event-first';
    const later = alternatives?.length > 1 ? alternatives[1] : node.type === 'number' ? 29 :
      node.type === 'boolean' ? false : node.type === 'null' ? null : node.type === 'array' ? [2, 3] :
        node.type === 'object' ? { event: 2 } : 'event-later';
    scenarios.push({ path: node.path, value: first }, { path: node.path, value: first }, { path: node.path, value: later });
  }
  scenarios.push({ path: '', value: snapshot(root.value), equalRoot: true });
  let executed = 0;
  active = true;
  for (const scenario of scenarios) {
    let target;
    try { target = root.find(scenario.path); } catch { continue; }
    if (!target || target.detached) continue;
    target.setValue(scenario.equalRoot ? root.value : structuredClone(scenario.value));
    await drain(); executed++;
    trace.values.push(snapshot(root.value));
    if (executed % 128 === 0) console.log(`UPDATE_PROGRESS ${executed}/${scenarios.length}`);
    assert(Date.now() - started < 420000, 'Split differential before eight minutes');
  }
  for (const [event, before] of handed) assert.deepEqual(snapshot(event), before,
    'An already handed-out payload/options table was mutated');
  active = false;
  for (const commit of new Set(trace.timeline.map(row => row[1]))) {
    let lastRevision = -1, firstListener = Infinity;
    for (let index = 0; index < trace.timeline.length; index++) {
      const row = trace.timeline[index];
      if (row[1] !== commit) continue;
      if (row[0] === 'revision') lastRevision = index;
      else firstListener = Math.min(firstListener, index);
    }
    assert(lastRevision < firstListener, 'Every listener must follow every revision increment in its commit');
  }
  for (const remove of removers) remove();
  return { mountedNodes, executed, handed: handed.length, trace };
}

const cases = [];
const scenarios = corpus.cases.map(row => ({ label: row.label, schema: row.schema, interactions: [] }));
for (const fixture of engines.head.equivalentFixtures)
  if (['sample-0', 'flat-100', 'flat-500', 'nested-d5-f4'].includes(fixture.name))
    scenarios.push({ label: fixture.name, schema: fixture.workspace, interactions: fixture.interactions });
const oneOf = { type: 'object', properties: { kind: { type: 'string', default: 'kind_0' } },
  oneOf: Array.from({ length: 40 }, (_, index) => ({ controls: { active: `./kind === 'kind_${index}'` },
    properties: { [`payload_${index}`]: { type: 'string', default: `v_${index}` } } })) };
scenarios.push({ label: 'oneOf-40', schema: oneOf, interactions: [{ path: '/kind', value: 'kind_4' }, { path: '/kind', value: 'kind_0' }] });
for (let index = 0; index < scenarios.length; index++) {
  const scenario = scenarios[index];
  for (const subscribed of [false, true]) {
    const head = await exercise(engines.head, scenario.schema, subscribed, scenario.interactions);
    const candidate = await exercise(engines[comparator], scenario.schema, subscribed, scenario.interactions);
    assert(isDeepStrictEqual(candidate, head), `${scenario.label}/${subscribed ? 'all-listeners' : 'no-listeners'} runtime differential differs`);
    const trace = head.trace;
    cases.push({ label: scenario.label, subscribed, error: head.error, mountedNodes: head.mountedNodes,
      updates: head.executed ?? 0, visits: trace?.visits.length ?? 0, changedNodes: trace?.changedNodes.length ?? 0,
      revisionIncrements: trace?.revisions.length ?? 0, deliveryWaves: trace?.targets.length ?? 0,
      listenerCalls: trace?.events.length ?? 0, immutableHandouts: head.handed ?? 0, captureSha256: hash(head) });
  }
  if (index % 10 === 0) console.log(`DIFF_PROGRESS ${index + 1}/${scenarios.length}`);
}
const heavy = cases.find(row => row.label === 'flat-500' && row.subscribed);
assert.equal(heavy.mountedNodes, 501); assert(heavy.listenerCalls > 501);
const result = { phase, mode, comparator, corpus: { schemas: 59, original: 14, edges: 45 }, cases,
  assertions: ['delivery target set and insertion order', 'commit visitor order', 'all revision increments before every listener',
    'changedNodes equal HEAD', 'payloads/options equal HEAD', 'handed-out tables immutable'],
  updates: cases.reduce((sum, row) => sum + row.updates, 0),
  listenerCalls: cases.reduce((sum, row) => sum + row.listenerCalls, 0),
  elapsedMs: Date.now() - started, natural: true };
const text = JSON.stringify(result, null, 2) + '\n'; assert(Buffer.byteLength(text) <= 5_000_000);
console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, `diff-${phase}-${mode}-${comparator}.json`), text }));
console.log(`EVENT110_DIFF_OK ${phase}/${mode}/${comparator}: ${cases.length} cases, ${result.updates} updates, ${result.listenerCalls} listeners`);
