// Runtime oracle only: reads schema fixtures and executes independently built engines.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const req = createRequire(path.join(repo, 'package.json'));
process.env.NODE_PATH = path.join(repo, 'node_modules');
req('node:module').Module._initPaths();
const candidateName = process.argv[2];
const engines = { head: req(path.join(scratch, 'value110-head.cjs')), candidate: req(path.join(scratch, `value110-${candidateName}.cjs`)) };
const corpus = JSON.parse(fs.readFileSync(path.join(pkg, 'src/core/blueprint/__tests__/fixtures/ownedInlineHead.json'), 'utf8')).cases;
assert.equal(corpus.length, 59);
const started = Date.now();
const drain = async () => { for (let i = 0; i < 64; i++) await Promise.resolve(); await new Promise(resolve => setImmediate(resolve)); };
const counters = { schemas: 0, rejectedSchemas: 0, authoredFixtures: 0, operations: 0, captures: 0, keyLists: 0, childReferences: 0, equalRestorations: 0, specialKeys: 0 };

/** Encode order, own descriptors and reference history without source inspection. */
function encoder() {
  const ids = new WeakMap();
  let next = 1;
  const encode = (value, seen = new Set()) => {
    if (value === undefined) return ['undefined'];
    if (typeof value === 'number' && !Number.isFinite(value)) return ['number', String(value)];
    if (Object.is(value, -0)) return ['number', '-0'];
    if (value === null || typeof value !== 'object') return typeof value === 'function' ? ['function'] : value;
    if (!ids.has(value)) ids.set(value, next++);
    const id = ids.get(value);
    if (seen.has(value)) return ['ref', id];
    seen.add(value);
    const keys = Reflect.ownKeys(value);
    counters.keyLists++;
    return [Array.isArray(value) ? 'array' : 'object', id,
      Object.getPrototypeOf(value) === Object.prototype ? 'ordinary' : Object.getPrototypeOf(value) === null ? 'null' : 'other',
      keys.map(key => { const d = Object.getOwnPropertyDescriptor(value, key);
        return [typeof key === 'symbol' ? String(key) : key, !!d.enumerable, !!d.configurable, !!d.writable, encode(Reflect.get(value, key), seen)]; })];
  };
  return encode;
}

/** Observe VALUE-012 plus payload identities on every live occurrence. */
function capture(root, encode, events) {
  const nodes = [], pending = [root];
  while (pending.length) {
    const node = pending.pop();
    const links = [];
    for (const child of node.children ?? []) {
      if (child.parent !== node) continue;
      counters.childReferences++;
      links.push([child.name, node.local !== null && typeof node.local === 'object' && Object.hasOwn(node.local, child.name)
        ? Reflect.get(node.local, child.name) === child.emit : null,
      node.emit !== null && typeof node.emit === 'object' && Object.hasOwn(node.emit, child.name)
        ? Reflect.get(node.emit, child.name) === child.emit : null]);
    }
    nodes.push({ path: node.path, local: encode(node.local), emit: encode(node.emit), raw: encode(node.raw), extras: encode(node.extras),
      keys: node.local !== null && typeof node.local === 'object' ? Object.keys(node.local) : [],
      children: (node.children ?? []).map(child => child.name), links, revisions: { ...node.revisionLedger },
      pendingPayload: encode(node.pendingDelivery?.payload) });
    for (let i = (node.children?.length ?? 0) - 1; i >= 0; i--) if (node.children[i].parent === node) pending.push(node.children[i]);
  }
  counters.captures++;
  return { nodes, output: encode(root.outputValue), events: events.map(event => encode(event)), diagnostics: root.runtime.diagnostics };
}

/** Execute the same authored/generic writes, retaining each engine's identity history. */
async function compare(label, schema, operations) {
  const roots = {}, encoders = {}, events = {}, errors = {};
  for (const version of ['head', 'candidate']) {
    events[version] = [];
    try {
      roots[version] = engines[version].nodeFromJSONSchema({ jsonSchema: structuredClone(schema), validationMode: 0,
        onChange: () => {}, onError: () => {} });
    } catch (error) {
      errors[version] = JSON.parse(JSON.stringify(error, (key, value) => key === 'stack' ? undefined : value instanceof Error
        ? { name: value.name, message: value.message, code: value.code, details: value.details } : value));
    }
    if (errors[version]) continue;
    encoders[version] = encoder();
    const pending = [roots[version]];
    while (pending.length) {
      const node = pending.pop();
      node.subscribe(event => events[version].push({ path: node.path, type: event.type, payload: event.payload }));
      for (const child of node.children ?? []) if (child.parent === node) pending.push(child);
    }
  }
  assert.deepEqual(errors.candidate, errors.head, label + ': rejected schema');
  if (errors.head) { counters.rejectedSchemas++; return; }
  await drain();
  const check = step => assert.deepEqual(capture(roots.candidate, encoders.candidate, events.candidate), capture(roots.head, encoders.head, events.head), label + ': ' + step);
  check('mount');
  const leaves = [], pending = [roots.head];
  while (pending.length) {
    const node = pending.pop();
    if (!node.children?.length && node.behavior.type !== 'virtual') {
      const current = node.local;
      const value = typeof current === 'number' ? current + 1 : typeof current === 'boolean' ? !current : typeof current === 'string' ? current + '-110'
        : node.behavior.type === 'number' || node.behavior.type === 'integer' ? 7 : node.behavior.type === 'boolean' ? true
        : node.behavior.type === 'array' ? [1] : node.behavior.type === 'object' ? { probe: 1 } : 'value-110';
      leaves.push({ path: node.path, value });
    }
    for (let i = (node.children?.length ?? 0) - 1; i >= 0; i--) if (node.children[i].parent === node) pending.push(node.children[i]);
  }
  const steps = operations ?? leaves;
  for (let i = 0; i < steps.length; i++) {
    assert(Date.now() - started < 420000, 'Split differential before eight minutes');
    const step = steps[i];
    assert.equal(!!roots.head.find(step.path), !!roots.candidate.find(step.path), label + ': shape');
    if (!roots.head.find(step.path)) continue;
    for (const version of ['head', 'candidate']) roots[version].find(step.path).setValue(structuredClone(step.value));
    await drain(); counters.operations++; check('write ' + i);
    for (const version of ['head', 'candidate']) {
      const root = roots[version], previous = root.outputValue;
      root.setValue(structuredClone(root.value));
      await drain();
      assert.strictEqual(root.outputValue, previous, label + ': equal value restores previous output reference');
      counters.equalRestorations++;
    }
    counters.operations++; check('equal ' + i);
  }
  for (const version of ['head', 'candidate']) {
    const root = roots[version], previous = root.outputValue;
    root.setValue(structuredClone(root.value)); await drain();
    assert.strictEqual(root.outputValue, previous, label + ': final equal reference');
    counters.equalRestorations++;
  }
  check('final equal');
}

for (const sample of corpus) { await compare(sample.label, sample.schema); counters.schemas++; }
for (const fixture of engines.head.equivalentFixtures) {
  await compare(fixture.name, fixture.workspace, fixture.interactions); counters.authoredFixtures++;
}
const specialSchema = { type: 'object', properties: Object.fromEntries([
  ['__proto__', { type: 'object', default: { nested: 1 } }], ['constructor', { type: 'string', default: 'ctor' }],
  ['10', { type: 'number', default: 10 }], ['2', { type: 'number', default: 2 }], ['01', { type: 'number', default: 1 }],
  ['group', { type: 'object', properties: { value: { type: 'number', default: 1 } } }],
]), options: { propertyKeys: ['constructor', '10', '__proto__', '2', '01', 'group'] } };
await compare('special-keys', specialSchema, [{ path: '/constructor', value: 'next' }, { path: '/__proto__', value: { nested: 2 } },
  { path: '/2', value: 20 }, { path: '/10', value: 100 }, { path: '/01', value: 10 }, { path: '/group/value', value: 2 }]);
for (const version of ['head', 'candidate']) {
  const root = engines[version].nodeFromJSONSchema({ jsonSchema: structuredClone(specialSchema), validationMode: 0 });
  root.find('/constructor').setValue('next'); await drain();
  assert.equal(Object.getPrototypeOf(root.emit), Object.prototype);
  assert(Object.hasOwn(root.emit, '__proto__'));
  assert.equal(Object.getOwnPropertyDescriptor(root.emit, '__proto__').get, undefined);
  assert.equal(root.emit.constructor, 'next');
  assert.deepEqual(Object.keys(root.emit), ['2', '10', 'constructor', '__proto__', '01', 'group']);
  assert.strictEqual(root.emit.group, root.find('/group').emit);
  counters.specialKeys += 5;
}

/** A fresh equal assembly must restore local identity even when host raw changes. */
for (const version of ['head', 'candidate']) {
  const root = engines[version].nodeFromJSONSchema({ jsonSchema: { type: 'object' }, validationMode: 0, onError: () => {} });
  const previous = root.local, input = structuredClone(root.value);
  const row = root.behavior, assemble = row.assemble;
  root.behavior = { ...row, assemble: (node, ...args) => {
    const result = assemble(node, ...args);
    return node === root ? { ...result } : result;
  } };
  try {
    root.setValue(null); await drain();
    assert.strictEqual(root.local, previous, version + ': fresh equal assembly restores previous local reference');
    root.setValue(input); await drain();
    assert.strictEqual(root.local, previous, version + ': restored host keeps previous local reference');
    assert.strictEqual(root.emit, previous, version + ': restored host emits previous reference');
    counters.equalRestorations += 2;
  } finally { root.behavior = row; }
}
const record = { candidate: candidateName, HEAD: 'ba2571b86', ...counters, sourceTextRead: false,
  started, ended: Date.now(), elapsedMs: Date.now() - started, verdict: '통과' };
fs.writeFileSync(path.join(directory, `differential-${candidateName}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
