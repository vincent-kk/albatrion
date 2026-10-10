/** Run with yarn node from the repository root; stdout is the reproducible JSONL evidence. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { WorkLoop } from './WorkLoop.mjs';
import { derive } from './derive.mjs';
import { notify } from './notify.mjs';

/** Resolve the installed ajv8 plugin, since the root Ajv is v6. */
const pluginRequire = createRequire(new URL('../../../../../schema-form-ajv8-plugin/package.json', import.meta.url));
/** Ajv mutation options remain disabled; the authored schema is the validation oracle. */
const Ajv2020 = pluginRequire('ajv/dist/2020').default;
/** Custom x-omit keys are annotations used only by the model. */
const ajv = new Ajv2020({ strict: false, allErrors: true });
/** One entry per asserted experiment; no product code is imported. */
const evidence = [];

/** Return Ajv's independent verdict on the exact schema and emitted JSON. */
function verdict(schema, value) {
  const validate = ajv.compile(schema);
  return { valid: validate(value), errors: structuredClone(validate.errors) };
}

/** Store a compact trace result after its assertions have succeeded. */
function record(id, detail) {
  evidence.push({ id, ...detail });
}

// A3-1: a select guard is form state, not child raw (ADR 0002).
{
  const schema = { type: 'object', oneOf: [
    { properties: { a: { type: 'number' } }, required: ['a'], additionalProperties: false },
    { properties: { b: { type: 'number' } }, required: ['b'], additionalProperties: false },
  ] };
  const model = new WorkLoop(schema, ajv).replace({ a: 1, b: 2 });
  const first = model.settle({ selected: 0 });
  const second = model.settle({ selected: 1 });
  assert.deepEqual(first.raw, second.raw);
  assert.deepEqual(first.emit, { a: 1 });
  assert.deepEqual(second.emit, { b: 2 });
  record('A3-1-select', { schema, raw: first.raw, first: first.emit, second: second.emit, ajv: [verdict(schema, first.emit), verdict(schema, second.emit)] });
}

// A3-1: the earlier opposing presence guards do lose their previous-active dependence.
{
  const schema = { type: 'object', allOf: [
    { if: { not: { required: ['b'] } }, then: { properties: { a: {} } } },
    { if: { not: { required: ['a'] } }, then: { properties: { b: {} } } },
  ] };
  const outputs = [];
  for (const order of [['a', 'b'], ['b', 'a']]) {
    const model = new WorkLoop(schema, ajv);
    for (const key of order) { model.write(key, key === 'a' ? 'x' : 'y'); model.settle(); }
    for (const old of [[], ['allOf[0].then'], ['allOf[1].then']]) {
      model.previousActive = old;
      outputs.push(model.settle().emit);
    }
  }
  assert(outputs.every((v) => JSON.stringify(v) === '{"a":"x"}'));
  record('A3-1-value-guards', { schema, histories: outputs.length, emit: outputs[0] });
}

// A3-2: distinguish the productive sweep from the final no-change check.
{
  const conditions = Array.from({ length: 30 }, (_, i) => ({ if: { required: [`p${i}`] }, then: { properties: { [`p${i + 1}`]: { default: i + 1 } } } }));
  const forward = new WorkLoop({ properties: { p0: {} }, allOf: conditions }, ajv).replace({ p0: 0 }).settle();
  const schema = { properties: { p0: {} }, allOf: [...conditions].reverse() };
  const reverse = new WorkLoop(schema, ajv).replace({ p0: 0 }).settle();
  const activeOnly = new WorkLoop(schema, ajv).replace({ p0: 0 }).settle({ activeOnly: true });
  assert.equal(forward.activationSweep, 1);
  assert.equal(forward.sweeps, 2);
  assert.equal(reverse.activationSweep, 30);
  assert.equal(reverse.sweeps, 31);
  assert.deepEqual(activeOnly.emit, { p0: 0, p1: 1 });
  record('A3-2-chain', { length: 30, forward: { productive: forward.activationSweep, total: forward.sweeps, p30: forward.emit.p30 }, reverse: { productive: reverse.activationSweep, total: reverse.sweeps, p30: reverse.emit.p30 }, activeOnly: activeOnly.emit });
}

// A3: a newly activated object finishes its subtree before the following sibling guard.
{
  const schema = { properties: { seed: {} }, allOf: [
    { if: { required: ['seed'] }, then: { properties: { child: { type: 'object', default: {}, properties: { token: { default: 1 } } } } } },
    { if: { required: ['child'], properties: { child: { required: ['token'] } } }, then: { properties: { done: { default: true } } } },
  ] };
  const result = new WorkLoop(schema, ajv).replace({ seed: true }).settle();
  assert.equal(result.activationSweep, 1);
  assert.deepEqual(result.emit, { seed: true, child: { token: 1 }, done: true });
  record('A3-nested-activation', { schema, input: { seed: true }, emit: result.emit, productive: result.activationSweep });
}

// A3-3/A3-4: the unconditional selector is addressable even without an emitted value.
{
  const schema = { type: ['object', 'null'], oneOf: [
    { required: ['kind'], properties: { kind: { const: 'cat' }, meow: { default: true } } },
    { required: ['kind'], properties: { kind: { const: 'dog' }, bark: { default: true } } },
  ] };
  const model = new WorkLoop(schema, ajv, { discriminator: 'kind' });
  const empty = model.replace({}).settle();
  const loaded = model.replace({ kind: 'cat' }).settle();
  const nullResult = model.replace(null).settle();
  const scalar = model.replace(17).settle();
  assert(model.known.includes('kind'));
  assert.deepEqual(loaded.emit, { kind: 'cat', meow: true });
  assert(!empty.active.some((id) => id.startsWith('union')));
  assert(nullResult.trace.every((entry) => entry.enabled === false));
  assert.equal(scalar.emit, 17);
  const guard = ajv.compile({ required: ['kind'], properties: { kind: { const: 'cat' } } });
  record('A3-3-A3-4-host', { schema, empty: empty.emit, selectorExists: model.known.includes('kind'), loaded: loaded.emit, null: nullResult.emit, scalar: scalar.emit, directGuard: { null: guard(null), undefined: guard(undefined), number: guard(17), array: guard([]), empty: guard({}) } });
}

// Option A: a stale activation can be invisible to the validator.
{
  const base = { type: 'object', properties: { seed: {} }, allOf: [
    { if: { not: { required: ['x'] } }, then: { properties: { a: { default: 'A' } } } },
    { if: { required: ['seed'] }, then: { properties: { x: { default: 1 } } } },
  ] };
  for (const closed of [false, true]) {
    const schema = closed ? { ...base, unevaluatedProperties: false } : base;
    const a = new WorkLoop(schema, ajv).replace({ seed: true }).settle({ mode: 'A' });
    const b = new WorkLoop(schema, ajv).replace({ seed: true }).settle({ mode: 'B' });
    const aVerdict = verdict(schema, a.emit), bVerdict = verdict(schema, b.emit);
    assert.deepEqual(a.emit, { seed: true, a: 'A', x: 1 });
    assert.deepEqual(b.emit, { seed: true, x: 1 });
    assert.equal(aVerdict.valid, !closed);
    assert.equal(bVerdict.valid, true);
    assert.equal(b.capped, false);
    record(`option-${closed ? 'closed' : 'open'}`, { schema, input: { seed: true }, a: { emit: a.emit, ajv: aVerdict, sweeps: a.sweeps }, b: { emit: b.emit, ajv: bVerdict, sweeps: b.sweeps }, stale: a.trace.filter((t) => t.sweep === 2 && t.id === 'allOf[0].then') });
  }
}

// Option B: a self-invalidating guard terminates only because of the arbitrary cap.
{
  const schema = { type: 'object', if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } }, required: ['x'] } };
  const a = new WorkLoop(schema, ajv).replace({}).settle();
  const b2 = new WorkLoop(schema, ajv).replace({}).settle({ mode: 'B', cap: 2 });
  const b3 = new WorkLoop(schema, ajv).replace({}).settle({ mode: 'B', cap: 3 });
  assert.deepEqual(a.emit, { x: 1 });
  assert.deepEqual(b2.emit, {});
  assert.deepEqual(b3.emit, { x: 1 });
  assert.equal(verdict(schema, a.emit).valid, true);
  assert.equal(verdict(schema, b2.emit).valid, false);
  assert.equal(verdict(schema, b3.emit).valid, true);
  record('option-cycle', { schema, input: {}, a: { emit: a.emit, ajv: verdict(schema, a.emit), capped: a.capped }, b2: { emit: b2.emit, ajv: verdict(schema, b2.emit), capped: b2.capped }, b3: { emit: b3.emit, ajv: verdict(schema, b3.emit), capped: b3.capped } });
}

// A3 step 5: same-host guards see prohibited raw; the parent's guard sees the child's projected emit.
{
  const schema = { type: 'object', properties: { a: {} }, allOf: [
    { if: { required: ['a'] }, then: { properties: { a: false } } },
    { if: { required: ['a'] }, then: { properties: { b: { default: 1 } } } },
  ] };
  const result = new WorkLoop(schema, ajv).replace({ a: 'kept' }).settle();
  assert.deepEqual(result.local, { a: 'kept', b: 1 });
  assert.deepEqual(result.emit, { b: 1 });
  const parentGuard = ajv.compile({ required: ['child'], properties: { child: { required: ['a'] } } });
  assert.equal(parentGuard({ child: result.local }), true);
  assert.equal(parentGuard({ child: result.emit }), false);
  record('A3-5-prohibition', { schema, input: { a: 'kept' }, inputAjv: verdict(schema, { a: 'kept' }), raw: result.raw, local: result.local, emit: result.emit, ajv: verdict(schema, result.emit), parentBeforeProjection: true, parentAfterProjection: false });
}

// A4: two meanings of "accept the write, freeze the last round" give incoherent vs coherent commits.
{
  const accept = derive(0, (n) => 1 - n, 25, 'accept-pending');
  const complete = derive(0, (n) => 1 - n, 25, 'complete-pending');
  const complete26 = derive(0, (n) => 1 - n, 26, 'complete-pending');
  const long = derive(0, (n) => Math.min(30, n + 1), 25, 'complete-pending');
  assert.equal(accept.raw, 1);
  assert.equal(accept.emit, 0);
  assert.equal(complete.emit, 1);
  assert.equal(complete26.emit, 0);
  assert.equal(long.emit, 25);
  record('A4-cap', { input: 0, accept, complete, cap26: { raw: complete26.raw, emit: complete26.emit }, noncyclic: { raw: long.raw, emit: long.emit, next: 26, target: 30 } });
}

// A5: discriminator ownership does not settle precedence against a prohibition.
{
  const schema = { type: 'object', allOf: [
    { if: { required: ['kind'] }, then: { properties: { kind: false } } },
  ], oneOf: [
    { required: ['kind'], properties: { kind: { const: 'cat' }, a: { default: 1 } } },
    { required: ['kind'], properties: { kind: { const: 'dog' }, b: { default: 2 } } },
  ] };
  const result = new WorkLoop(schema, ajv, { discriminator: 'kind' }).replace({ kind: 'cat' }).settle();
  assert.deepEqual(result.local, { kind: 'cat', a: 1 });
  assert.deepEqual(result.emit, { a: 1 });
  record('A5-prohibited-selector', { schema, raw: result.raw, local: result.local, emit: result.emit, ajv: verdict(schema, result.emit) });
}

// A6/C1: the two literal rules disagree on the same replacement by null.
{
  const schema = { type: ['object', 'null'], properties: { note: {}, keep: {} } };
  const a6 = new WorkLoop(schema, ajv).replace({ note: 'typed', keep: 'K1' }).replace(null);
  const c1 = new WorkLoop(schema, ajv).replace({ note: 'typed', keep: 'K1' }).replace(null, false);
  const atNull = a6.settle();
  const retained = a6.write('note', 'Z').settle();
  const cleared = c1.write('note', 'Z').settle();
  assert.equal(atNull.emit, null);
  assert.deepEqual(retained.emit, { note: 'Z', keep: 'K1' });
  assert.deepEqual(cleared.emit, { note: 'Z' });
  record('A6-C1-null', { schema, input: { note: 'typed', keep: 'K1' }, operations: ['setValue(null)', 'partial note=Z'], atNull: { raw: atNull.raw, emit: atNull.emit }, a6: retained.emit, c1: cleared.emit });
}

// A6: automatic writes must not revive null, but can still change retained child raw.
{
  const schema = { properties: { note: {} }, if: { not: { required: ['note'] } }, then: { properties: { draft: { default: 'D' } } } };
  const model = new WorkLoop(schema, ajv).replace({ note: 'typed' }).replace(null);
  const defaults = model.settle();
  const injected = model.write('note', 'automatic', true).settle();
  assert.equal(defaults.emit, null);
  assert.deepEqual(defaults.raw, { note: 'typed', draft: 'D' });
  assert.equal(injected.emit, null);
  assert.equal(injected.raw.note, 'automatic');
  record('A6-automatic', { schema, defaults: { raw: defaults.raw, emit: defaults.emit }, injected: { raw: injected.raw, emit: injected.emit } });
}

// A7: payload stability survives immediate synchronous commits during delivery.
{
  const observations = notify();
  assert.deepEqual(observations.slice(0, 3).map((r) => r.payload), [1, 1, 1]);
  assert.deepEqual(observations.slice(0, 3).map((r) => r.value), [1, 2, 2]);
  assert.deepEqual(observations.slice(3).map((r) => r.payload), [2, 2, 2]);
  record('A7-notify', { observations });
}

// C1: replacement discards latent old-record data; branch changes and reset retain their stated role.
{
  const schema = { type: 'object', oneOf: [
    { properties: { kind: { const: 'a' }, a: {} }, required: ['kind'] },
    { properties: { kind: { const: 'b' }, b: {} }, required: ['kind'] },
  ] };
  const initial = { kind: 'a', a: 'OLD', b: 'SECRET', extra: 7 };
  const model = new WorkLoop(schema, ajv, { discriminator: 'kind' }).replace(initial);
  const first = model.settle();
  const partial = model.write('kind', 'b').settle();
  model.replace({ kind: 'a', a: 'NEW' }).settle();
  const replaced = model.write('kind', 'b').settle();
  const reset = model.replace(initial).settle();
  const reemit = model.replace(reset.emit).write('kind', 'b').settle();
  assert.deepEqual(partial.emit, { kind: 'b', b: 'SECRET', extra: 7 });
  assert.deepEqual(replaced.emit, { kind: 'b' });
  assert.equal(reset.raw.b, 'SECRET');
  assert(!Object.hasOwn(reemit.raw, 'b'));
  record('C1-write-kinds', { schema, initial, first: first.emit, partial: partial.emit, replaced: replaced.emit, resetRaw: reset.raw, setValueGetValueThenSwitch: reemit.emit });
}

// C2: use hasOwn, preserve extras, and leave omit exclusively in emit.
{
  const schema = { type: 'object', properties: { n: { default: 'D', 'x-omitEmpty': true }, tail: { 'x-omitTrailing': true } } };
  const outputs = [];
  for (const input of [{}, { n: '' }, { n: null }, { n: {} }, { n: 0 }, { n: false }]) {
    const result = new WorkLoop(schema, ajv).replace({ ...input, extra: 42 }).settle();
    outputs.push({ input, raw: result.raw, emit: result.emit });
    assert.equal(result.emit.extra, 42);
    assert.deepEqual(result.raw.n, Object.hasOwn(input, 'n') ? input.n : 'D');
  }
  const array = new WorkLoop(schema, ajv).replace({ tail: ['a', null, null] }).settle();
  assert.deepEqual(array.raw.tail, ['a', null, null]);
  assert.deepEqual(array.emit.tail, ['a']);
  record('C2-load', { schema, outputs, array: { raw: array.raw, local: array.local, emit: array.emit } });
}

// C1/C2: first activation writes a default even if the user only changed the discriminator.
{
  const schema = { properties: { on: {} }, if: { properties: { on: { const: true } }, required: ['on'] }, then: { properties: { child: { default: 'D' } } } };
  const model = new WorkLoop(schema, ajv).replace({ on: false });
  const before = model.settle();
  const after = model.write('on', true).settle();
  assert.deepEqual(before.raw, { on: false });
  assert.deepEqual(after.raw, { on: true, child: 'D' });
  record('C1-activation-default', { schema, before: before.raw, partialWrite: { on: true }, after: after.raw });
}

// C3: wrong-type replacement stays visible to validation; a later child write revives only new data.
{
  const schema = { type: 'object', properties: { note: {}, keep: {} } };
  const cases = [];
  for (const input of [17, 'broken', []]) {
    const model = new WorkLoop(schema, ajv).replace({ keep: 'OLD' }).replace(input);
    const wrong = model.settle();
    const recovered = model.write('note', 'Z').settle();
    assert.deepEqual(wrong.emit, input);
    assert.equal(verdict(schema, wrong.emit).valid, false);
    assert.deepEqual(recovered.emit, { note: 'Z' });
    cases.push({ input, emit: wrong.emit, ajv: verdict(schema, wrong.emit), recovered: recovered.emit });
  }
  record('C3-host-type', { schema, cases });
}

for (const entry of evidence) console.log(JSON.stringify(entry));
console.log(JSON.stringify({ status: 'PASS', experiments: evidence.length, ajv: pluginRequire('ajv/package.json').version }));
