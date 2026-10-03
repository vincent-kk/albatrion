/** Loaded by run.mjs; keeps all 18 codex3 IDs and original schemas where recorded. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WorkLoop } from './WorkLoop.mjs';
import { Dispatcher } from './Dispatcher.mjs';

export function legacyExperiments(ajv, record, verdict) {
  const old = Object.fromEntries(readFileSync(new URL('../codex3/results.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse).filter((x) => x.id).map((x) => [x.id, x]));
  const model = (id, value, options) => new WorkLoop(old[id].schema, ajv, options).replace(value);
  {
    const m = model('A3-1-select', { a: 1, b: 2 }, { forceSelection: true });
    const a = m.settle({ selected: 0 }), b = m.settle({ selected: 1 });
    assert.deepEqual(a.emit, { a: 1 }); assert.deepEqual(b.emit, { b: 2 });
    assert.deepEqual(a.state.children, b.state.children);
    record('A3-1-select', { verdict: '해소', outputs: [a.emit, b.emit], selections: [a.state.selection, b.state.selection] });
  }
  {
    const outputs = [];
    for (const order of [['a', 'b'], ['b', 'a']]) {
      const m = model('A3-1-value-guards', {});
      for (const k of order) { m.write(k, k === 'a' ? 'x' : 'y'); m.settle(); }
      for (const active of [[], ['root/allOf/0/then'], ['root/allOf/1/then']]) { m.previousActive = active; outputs.push(m.settle().emit); }
    }
    assert(outputs.every((v) => JSON.stringify(v) === '{"a":"x"}'));
    record('A3-1-value-guards', { verdict: '통과 유지', histories: outputs.length, emit: outputs[0] });
  }
  {
    const conditions = Array.from({ length: 30 }, (_, i) => ({ if: { required: [`p${i}`] }, then: { properties: { [`p${i + 1}`]: { default: i + 1 } } } }));
    const run = (list, input) => new WorkLoop({ properties: { p0: {} }, allOf: list }, ajv).replace(input).settle();
    const forward = run(conditions, { p0: 0 }), reverse = run([...conditions].reverse(), { p0: 0 });
    assert.equal(forward.settle.status, 'budget-exceeded'); assert.equal(reverse.settle.status, 'budget-exceeded');
    assert.equal(forward.emit.p30, undefined); assert.equal(forward.emit.p24, 24);
    const preloaded = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`p${i}`, i]));
    const loadedForward = run(conditions, preloaded), loadedReverse = run([...conditions].reverse(), preloaded);
    assert.equal(loadedForward.settle.sweeps, 2); assert.equal(loadedReverse.settle.sweeps, 31);
    record('A3-2-chain', { verdict: '새 결함', input: { p0: 0 }, forward: { emit: forward.emit, settle: forward.settle, rounds: forward.rounds.length }, reverse: { emit: reverse.emit, settle: reverse.settle, rounds: reverse.rounds.length }, preloaded: { forward: loadedForward.settle, reverse: loadedReverse.settle } });
  }
  {
    const r = model('A3-nested-activation', { seed: true }).settle();
    assert.deepEqual(r.emit, { seed: true, child: { token: 1 }, done: true });
    record('A3-nested-activation', { verdict: '통과 유지', emit: r.emit, rounds: r.rounds.map(({ round, sweeps, emit }) => ({ round, sweeps, emit })) });
  }
  {
    const m = model('A3-3-A3-4-host', {});
    const empty = m.settle(), loaded = m.replace({ kind: 'cat' }).settle(), nil = m.replace(null).settle(), scalar = m.replace(17).settle();
    assert.deepEqual(empty.emit, { kind: 'cat', meow: true }); assert.equal(nil.emit, null); assert.equal(scalar.emit, 17);
    assert(nil.trace.every((x) => !x.enabled));
    record('A3-3-A3-4-host', { verdict: '통과 유지', empty: empty.emit, loaded: loaded.emit, null: { emit: nil.emit, childRaw: nil.state.children, active: nil.active }, scalar: scalar.emit });
  }
  for (const id of ['option-open', 'option-closed']) {
    const r = model(id, { seed: true }).settle();
    assert.deepEqual(r.emit, { seed: true, x: 1 }); assert.equal(verdict(old[id].schema, r.emit).valid, true);
    record(id, { verdict: '해소', emit: r.emit, latent: r.state.children, settle: r.settle, ajv: verdict(old[id].schema, r.emit) });
  }
  {
    const r = model('option-cycle', {}).settle();
    assert.equal(r.settle.status, 'budget-exceeded');
    const paddedSchema = { ...old['option-cycle'].schema, allOf: [{}] };
    const padded = new WorkLoop(paddedSchema, ajv).replace({}).settle();
    assert.equal(padded.settle.status, 'budget-exceeded'); assert.deepEqual(padded.emit, {});
    record('option-cycle', { verdict: '명시적 제한', emit: r.emit, settle: r.settle, ajv: verdict(old['option-cycle'].schema, r.emit), equivalentEmptyAllOf: { emit: padded.emit, settle: padded.settle, ajv: verdict(paddedSchema, padded.emit) } });
  }
  {
    const r = model('A3-5-prohibition', { a: 'kept' }).settle();
    assert.deepEqual(r.emit, { a: 'kept', b: 1 }); assert.equal(verdict(old['A3-5-prohibition'].schema, r.emit).valid, false);
    record('A3-5-prohibition', { verdict: '해소', emit: r.emit, settle: r.settle, ajv: verdict(old['A3-5-prohibition'].schema, r.emit) });
  }
  {
    const cases = [];
    for (const [name, fn] of [['toggle', (n) => 1 - n], ['long', (n) => Math.min(30, n + 1)]]) {
      const m = new WorkLoop({ properties: { n: {} } }, ajv).replace({ n: 0 });
      const r = m.settle({ inject: (r) => { const n = fn(r.emit.n); return n === r.emit.n ? [] : [{ path: '/n', value: n, kind: 'injectTo', apply: () => m.write('n', n) }]; } });
      assert.equal(r.state.children.n, r.emit.n); assert.equal(r.settle.status, 'budget-exceeded');
      cases.push({ name, raw: r.state.children.n, emit: r.emit.n, rounds: r.rounds.length, pending: r.rounds.at(-1).writes });
    }
    record('A4-cap', { verdict: '해소', cases });
  }
  {
    const r = model('A5-prohibited-selector', { kind: 'cat' }).settle();
    assert.deepEqual(r.emit, { kind: 'cat', a: 1 });
    record('A5-prohibited-selector', { verdict: '해소', emit: r.emit, ajv: verdict(old['A5-prohibited-selector'].schema, r.emit) });
  }
  {
    const m = model('A6-C1-null', { note: 'typed', keep: 'K1' }); m.settle();
    const nil = m.replace(null).settle(), recovered = m.write('note', 'Z').settle();
    assert.deepEqual(recovered.emit, { note: 'Z' });
    record('A6-C1-null', { verdict: '해소', atNull: { emit: nil.emit, raw: nil.state }, recovered: recovered.emit });
  }
  {
    const m = model('A6-automatic', { note: 'typed' }); m.settle();
    const nil = m.replace(null).settle();
    const injected = m.settle({ inject: () => m.children.note.raw === 'automatic' ? [] : [{ path: '/note', value: 'automatic', kind: 'injectTo', apply: () => m.write('note', 'automatic') }] });
    assert.equal(nil.emit, null); assert.equal(nil.state.children.draft, 'D');
    assert.deepEqual(injected.emit, { note: 'automatic' });
    record('A6-automatic', { verdict: '미정의 잔존', defaultOnly: { emit: nil.emit, raw: nil.state }, injected: injected.emit, interpretation: 'leaf-target injectTo uses descendant write; ancestor promotion is not expressly specified' });
  }
  {
    const d = new Dispatcher(), n = d.add('root', 0, 0), observations = [];
    for (const listener of ['first', 'second', 'third']) n.listeners.push((p) => { observations.push({ wave: d.waves, listener, payload: p.current, value: n.value }); if (p.current === 1 && listener === 'first') d.commit({ root: 2 }); });
    d.commit({ root: 1 });
    assert.deepEqual(observations.slice(0, 3).map((r) => r.payload), [1, 1, 1]); assert.deepEqual(observations.slice(0, 3).map((r) => r.value), [1, 2, 2]);
    record('A7-notify', { verdict: '통과 유지', observations });
  }
  {
    const initial = { kind: 'a', a: 'OLD', b: 'SECRET', extra: 7 };
    const m = model('C1-write-kinds', initial); const first = m.settle();
    const partial = m.write('kind', 'b').settle(); m.replace({ kind: 'a', a: 'NEW' }).settle();
    const replaced = m.write('kind', 'b').settle(), reset = m.reset().settle();
    const reemit = m.replace(reset.emit).write('kind', 'b').settle();
    assert.deepEqual(partial.emit, { kind: 'b', b: 'SECRET', extra: 7 }); assert.deepEqual(replaced.emit, { kind: 'b' }); assert.equal(reset.state.children.b, 'SECRET'); assert.equal(reemit.state.children.b, undefined);
    record('C1-write-kinds', { verdict: '해소', first: first.emit, partial: partial.emit, replaced: replaced.emit, reset: reset.state, setValueGetValueThenSwitch: reemit.emit });
  }
  {
    const outputs = [];
    for (const input of [{}, { n: '' }, { n: null }, { n: {} }, { n: 0 }, { n: false }]) {
      const r = model('C2-load', { ...input, extra: 42 }).settle();
      assert.equal(r.emit.extra, 42); assert.deepEqual(r.state.children.n, Object.hasOwn(input, 'n') ? input.n : 'D');
      outputs.push({ input, state: r.state, emit: r.emit });
    }
    const array = model('C2-load', { tail: ['a', null, null] }).settle();
    assert.deepEqual(array.emit.tail, ['a']); assert.deepEqual(array.state.children.tail, ['a', null, null]);
    record('C2-load', { verdict: '해소', outputs, array: { raw: array.state.children.tail, emit: array.emit.tail } });
  }
  {
    const m = model('C1-activation-default', { on: false }); const before = m.settle(), after = m.write('on', true).settle();
    assert.deepEqual(after.emit, { on: true, child: 'D' });
    record('C1-activation-default', { verdict: '해소', before: before.emit, after: after.emit, rounds: after.rounds.length });
  }
  {
    const cases = [];
    for (const input of [17, 'broken', []]) {
      const m = model('C3-host-type', { keep: 'OLD' }); m.settle();
      const r = m.replace(input).settle(), recovered = m.write('note', 'Z').settle();
      assert.deepEqual(r.emit, input); assert.deepEqual(recovered.emit, { note: 'Z' });
      cases.push({ input, emit: r.emit, recovered: recovered.emit, ajv: verdict(old['C3-host-type'].schema, r.emit) });
    }
    record('C3-host-type', { verdict: '통과 유지', cases });
  }
}
