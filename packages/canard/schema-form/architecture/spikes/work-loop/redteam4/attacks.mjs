/**
 * Red-team attacks against round-4-spec.md §A (work loop 3.1), executed on ./model.mjs.
 * Run: node attacks.mjs [section...]   (no args = all)
 */
import { activeTags, build, counters, find, input, options, refreshTargets, removeKey, reset, residual, resetCounters, settle, setValue, validate, write, NONE, rawTree } from './model.mjs';

const J = (v) => JSON.stringify(v);
const only = new Set(process.argv.slice(2));
const section = (id, title, fn) => { if (only.size && !only.has(id)) return; console.log(`\n=== [${id}] ${title}`); try { fn(); } catch (e) { console.log('THROW', e.stack.split('\n').slice(0, 3).join(' | ')); } };
const fresh = (schema, init, dv) => { const r = build(schema, '', null, dv ?? init); setValue(r, init); settle(r); return r; };
const show = (r, label = '') => console.log(`${label} emit=${J(r.emit)} raw=${J(rawTree(r))} active=${J(activeTags(r))} settle=${J(r.settle)} rounds=${J(r.settleRounds)}`);
const cond = (ifs, props) => ({ if: ifs, then: { properties: props } });
const str = (d) => (d === undefined ? { type: 'string' } : { type: 'string', default: d });

// ---------------------------------------------------------------- 1. A2 transition-based default injection
section('1a', 'ON→OFF→ON: two commits vs one settle (batch) — same two writes, different raw', () => {
  const schema = { type: 'object', properties: { a: str() }, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } })] };
  for (const batched of [false, true]) {
    const r = fresh(schema, { a: 'A' }); write(find(r, '/x'), undefined); settle(r); show(r, `[batch=${batched}] user cleared x :`);
    write(find(r, '/a'), undefined); if (!batched) settle(r); write(find(r, '/a'), 'A'); settle(r); show(r, `[batch=${batched}] a:=∅ then a:='A':`);
  }
});
section('1a2', 'flip inside ONE settle via derive rounds: F off in round 1, injectTo turns it back on — no injection; the same via two commits injects', () => {
  const schema = { type: 'object', properties: { a: str(), src: str() }, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } })],
    injectTo: { '/src': { '/a': (v, root) => (v === 'go' ? 'A' : root.a) } } };
  const r = fresh(schema, { a: 'A' }); write(find(r, '/x'), undefined); settle(r); show(r, 'cleared x            :');
  write(find(r, '/a'), undefined); write(find(r, '/src'), 'go'); settle(r); show(r, 'one settle a:=∅,src=go:');
  const r2 = fresh(schema, { a: 'A' }); write(find(r2, '/x'), undefined); settle(r2);
  write(find(r2, '/a'), undefined); settle(r2); write(find(r2, '/src'), 'go'); settle(r2); show(r2, 'two commits           :');
});
section('1b', 'user clears x (raw ∅, key declared) while fragment stays on; sibling write re-runs settle', () => {
  const schema = { type: 'object', properties: { a: str(), z: str() }, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } })] };
  const r = fresh(schema, { a: 'A' }); write(find(r, '/x'), undefined); settle(r); write(find(r, '/z'), 'q'); settle(r); show(r, 'after sibling write:');
  setValue(r, { a: 'A', z: 'q' }, 'Merge'); settle(r); show(r, 'Merge same object  :');
  setValue(r, { a: 'A', z: 'q' }); settle(r); show(r, 'Overwrite same obj :');
});
section('1c', 'two fragments declare x with defaults 1 / 2 — activation across two commits vs within one commit', () => {
  const schema = { type: 'object', properties: { a: str(), b: str() }, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } }), cond({ required: ['b'] }, { x: { type: 'number', default: 2 } })] };
  const r1 = fresh(schema, {}); write(find(r1, '/a'), 'A'); settle(r1); write(find(r1, '/b'), 'B'); settle(r1); show(r1, 'a then b   :');
  const r2 = fresh(schema, {}); write(find(r2, '/b'), 'B'); settle(r2); write(find(r2, '/a'), 'A'); settle(r2); show(r2, 'b then a   :');
  const r3 = fresh(schema, { a: 'A', b: 'B' }); show(r3, 'load {a,b} :');
  const r4 = fresh(schema, {}); write(find(r4, '/a'), 'A'); write(find(r4, '/b'), 'B'); settle(r4); show(r4, 'batch a,b  :');
});
section('1d', 'disableDefaultInjection: listener write right after the load commit; reset(); union k default', () => {
  const schema = { type: 'object', properties: { a: str('A0'), t: str() }, allOf: [cond({ required: ['t'] }, { x: { type: 'number', default: 1 } })],
    oneOf: [{ properties: { kind: { const: 'cat' }, meow: str('m') } }, { properties: { kind: { const: 'dog' } } }] };
  options.disableDefaultInjection = true;
  const r = fresh(schema, undefined, { a: 'A0' }); show(r, 'load (flag on)          :');
  write(find(r, '/t'), 'listener'); settle(r); show(r, 'listener Merge → t      :');
  reset(r); settle(r); show(r, 'reset() with flag on    :');
  options.disableDefaultInjection = false;
  const r2 = fresh(schema, undefined, { a: 'A0' }); show(r2, 'load (flag off)         :');
});
section('1e', 'forward chain of conditional defaults: each level is one transition round → shares the 25-round budget', () => {
  for (const N of [24, 25, 26, 30]) {
    const items = []; for (let i = 0; i < N; i++) items.push(cond({ required: [`p${i}`] }, { [`p${i + 1}`]: str(`v${i + 1}`) }));
    resetCounters(); const r = fresh({ type: 'object', properties: { p0: str() }, allOf: items }, { p0: 'go' });
    console.log(`N=${N}: keys=${Object.keys(r.emit).length} rounds=${J(r.settleRounds)} guards=${counters.guards} sweeps=${counters.sweeps} last=${J(r.emit[`p${N}`])}`);
  }
});
section('1f', 'injectTo writes undefined to a defaulted child → transition re-injects → ping-pong to the round cap', () => {
  const schema = { type: 'object', properties: { a: str() }, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } })], injectTo: { '/a': { '/x': () => undefined } } };
  resetCounters(); const r = fresh(schema, { a: 'A' }); show(r, ''); console.log('   rounds counter', counters.rounds);
});

// ---------------------------------------------------------------- 2. A4-3 guard input = projected value
section('2a', 'omitEmpty: a:"" is absent for the guard; ajv on the emit agrees', () => {
  const schema = { type: 'object', properties: { a: str() }, allOf: [cond({ required: ['a'] }, { b: str('B') })] };
  const r = fresh(schema, { a: '' }); show(r, 'a=""  :'); console.log('   ajv(then applies?)', J(validate({ ...schema, allOf: [{ if: { required: ['a'] }, then: { required: ['b'] } }] }, r.emit).ok));
  write(find(r, '/a'), 'x'); settle(r); show(r, 'a="x" :');
  const nested = { type: 'object', properties: { o: { type: 'object', properties: { s: str() } } }, allOf: [cond({ required: ['o'] }, { flag: str('F') })] };
  const r2 = fresh(nested, { o: { s: '' } }); show(r2, 'o={s:""} → o projected to {} → omitted → `required o` false:');
});
section('2b', 'guard reading a nested host that is budget-exceeded — what G does the parent see?', () => {
  const childSchema = { type: 'object', properties: {}, allOf: [cond({ not: { required: ['y'] } }, { x: { type: 'number' } }), cond({ required: ['x'] }, { y: { type: 'number' } })] };
  const schema = { type: 'object', properties: { c: childSchema }, allOf: [cond({ properties: { c: { required: ['x', 'y'] } } }, { both: str('BOTH') })] };
  const r = fresh(schema, { c: { x: 1, y: 1 } }); show(r, ''); console.log('   child settle', J(find(r, '/c').settle), 'child emit', J(find(r, '/c').emit), 'root settle', J(r.settle));
});
section('2c', 'inherited overlay + child guard reading the overlay key: recompute count, cap', () => {
  const schema = { type: 'object', properties: { a: str(), c: { type: 'object', properties: { s: str() }, allOf: [cond({ required: ['q'] }, { r: str('R') })] } },
    allOf: [cond({ required: ['a'] }, { c: { properties: { q: str('Q') } } })] };
  resetCounters(); const r = fresh(schema, { a: 'A' }); show(r, 'load {a}:'); console.log('   counters', J(counters), 'child active', J(activeTags(find(r, '/c'))), 'child settle', J(find(r, '/c').settle));
  resetCounters(); write(find(r, '/a'), 'B'); settle(r); console.log('   keystroke at /a → counters', J(counters));
  const self = { type: 'object', properties: { c: { type: 'object', properties: { s: str() } } }, allOf: [cond({ not: { properties: { c: { required: ['q'] } } } }, { c: { properties: { q: str('Q') } } })] };
  resetCounters(); const r2 = fresh(self, { c: { s: 'S' } }); show(r2, 'self-negating via overlay:'); console.log('   counters', J(counters), 'child computes bounded by parent sweeps', r2.settle.sweeps);
});

// ---------------------------------------------------------------- 3. A4-4 option B with cap — period-2 alternation
section('3', 'F1: ¬y → declares x; F2: x → declares y; raw {x:1,y:1}: no fixed point, cap parity decides the emit', () => {
  const mk = (extra = {}) => ({ type: 'object', properties: {}, allOf: [cond({ not: { required: ['y'] } }, { x: { type: 'number' } }), cond({ required: ['x'] }, { y: { type: 'number' } })], ...extra });
  for (const gs of [true, false]) for (const adj of [0, -1, 1]) {
    options.gaussSeidel = gs; options.capAdjust = adj; const r = fresh(mk(), { x: 1, y: 1 });
    console.log(`gaussSeidel=${gs} cap=${r.fragments.length + 1 + adj}: emit=${J(r.emit)} settle=${J(r.settle)} ajv=${validate(mk(), r.emit).ok} ajv(unevaluated:false)=${validate(mk({ unevaluatedProperties: false }), r.emit).ok}`);
  }
  options.gaussSeidel = true; options.capAdjust = 0;
  console.log('   ajv on the raw data itself {x:1,y:1}:', validate(mk(), { x: 1, y: 1 }).ok, '/ unevaluated:false →', validate(mk({ unevaluatedProperties: false }), { x: 1, y: 1 }).ok);
  console.log('   fixed-point search over all A:', ['{}', '{F1}', '{F2}', '{F1,F2}'].join(' '), '→', [[], ['x'], ['y'], ['x', 'y']].map((keys) => { const G = Object.fromEntries(keys.map((k) => [k, 1])); const on1 = !('y' in G), on2 = 'x' in G; return `${J(keys)}:F1=${on1},F2=${on2}`; }).join(' '));
});

// ---------------------------------------------------------------- 4. A4-6 inherited overlays — recompute count vs parent cap
section('4', 'parent P lifts q (default) into child; child C depends on q; one keystroke at the parent', () => {
  const schema = { type: 'object', properties: { a: str(), c: { type: 'object', properties: { s: str() }, allOf: [cond({ required: ['q'] }, { r: str('R') })] } },
    allOf: [cond({ required: ['a'] }, { c: { properties: { q: str('Q') } } })] };
  for (const mode of ['per-toggle', 'per-sweep']) {
    options.childRecompute = mode; const r = fresh(schema, { a: 'A' }); resetCounters(); write(find(r, '/a'), 'A2'); settle(r);
    console.log(`[${mode}] keystroke: computes=${counters.computes} sweeps=${counters.sweeps} guards=${counters.guards} rounds=${counters.rounds} parent cap=${r.fragments.length + 1} emit=${J(r.emit)}`);
  }
  options.childRecompute = 'per-toggle';
  const K = 6; const items = []; for (let i = 0; i < K; i++) items.push(cond({ required: [`a${i}`] }, { c: { properties: { [`q${i}`]: str(`Q${i}`) } } }));
  for (let i = 0; i < K; i++) items.push(cond({ required: [`b${i}`] }, { [`a${i}`]: str(`A${i}`) }));
  const many = { type: 'object', properties: { c: { type: 'object', properties: { s: str() } }, ...Object.fromEntries(Array.from({ length: K }, (_, i) => [`b${i}`, str()])) }, allOf: items.reverse() };
  const r = fresh(many, Object.fromEntries(Array.from({ length: K }, (_, i) => [`b${i}`, 'x'])));
  resetCounters(); write(find(r, '/b0'), 'y'); settle(r);
  console.log(`K=${K} overlay fragments behind a reverse chain: child computes=${counters.computes - 0} (parent cap ${r.fragments.length + 1}, parent sweeps ${r.settle.sweeps}) guards=${counters.guards} child keys=${J(Object.keys(find(r, '/c').emit))}`);
});

// ---------------------------------------------------------------- 5. A5 non-object host
section('5', 'host raw=17: two views, extras survival, null vs all-default object', () => {
  const schema = { type: 'object', properties: { host: { type: ['object', 'null'], properties: { note: str(), reason: str('because') } } } };
  const r = fresh(schema, { host: { note: 'n', reason: 'r', zz: 'extra' } }); show(r, 'load with extra zz   :'); console.log('   extras', J(find(r, '/host').extras));
  setValue(r, { host: 17 }); settle(r); show(r, 'setValue host:=17    :'); console.log('   getValue=', J(r.emit), 'node.find(/host/note).value=', J(find(r, '/host/note').local), 'reason=', J(find(r, '/host/reason').local), 'ajv:', J(validate(schema, r.emit).errors.map((e) => e.text)));
  write(find(r, '/host/note'), 'typed'); settle(r); show(r, 'type note            :'); console.log('   extras after 17 → type:', J(find(r, '/host').extras));
  options.extrasSurviveNonObject = true;
  const r2 = fresh(schema, { host: { note: 'n', zz: 'extra' } }); setValue(r2, { host: 17 }); settle(r2); write(find(r2, '/host/note'), 'typed'); settle(r2); console.log('   [extras survive reading] emit=', J(r2.emit));
  options.extrasSurviveNonObject = false;
  const rn = fresh(schema, { host: null }); const ro = fresh(schema, { host: {} });
  console.log('   null host emit=', J(rn.emit), '| all-default object host emit=', J(ro.emit), '| child views equal?', J(find(rn, '/host/reason').local) === J(find(ro, '/host/reason').local));
  write(find(rn, '/host/reason'), ''); settle(rn); show(rn, 'null host, user clears reason ("" partial write):');
  write(find(rn, '/host/note'), 'again'); settle(rn); show(rn, 'then types note:');
});

// ---------------------------------------------------------------- 6. A6 refresh rule
section('6', 'RequestRefresh: committed raw vs reported value — formatter, NaN, object-valued inputs', () => {
  const schema = { type: 'object', properties: { s: str(), n: { type: 'number' }, tags: { type: 'array', items: { type: 'string' } } } };
  const r = fresh(schema, {});
  input(find(r, '/s'), '12'); settle(r); console.log('DOM "12a", formatter reported "12" → refresh targets:', J(refreshTargets(r)), '(stale DOM invisible to the rule)');
  input(find(r, '/n'), NaN); settle(r); console.log('number input cleared → reports NaN → refresh(===):', J(refreshTargets(r)), '| refresh(Object.is):', J((options.refreshEq = Object.is, refreshTargets(r)))); options.refreshEq = (a, b) => a === b;
  input(find(r, '/tags'), ['a']); settle(r); console.log('array-valued input reports a fresh array each keystroke → raw is the same reference:', J(refreshTargets(r)));
  const r2 = build({ ...schema, injectTo: { '/s': { '/n': (v) => (v === undefined ? undefined : v.length) } } }); setValue(r2, {}); settle(r2);
  input(find(r2, '/n'), 3); input(find(r2, '/s'), 'abc'); settle(r2); console.log('injectTo writes the same value n=3 the input reported → refresh:', J(refreshTargets(r2)));
  input(find(r2, '/s'), 'abcd'); settle(r2); console.log('injectTo writes n=4 (input reported 3) → refresh:', J(refreshTargets(r2)));
});

// ---------------------------------------------------------------- 7. A7 union
section('7', 'discriminator default = first branch; error routing inputs; selection slot vs Overwrite', () => {
  const u = { type: 'object', oneOf: [{ properties: { kind: { const: 'cat' }, meow: str() }, required: ['kind'] }, { properties: { kind: { const: 'dog' }, bark: str() }, required: ['kind'] }] };
  const r = fresh(u, undefined); show(r, 'empty form      :'); console.log('   ajv', validate(u, r.emit).ok, '| ajv on {}', validate(u, {}).ok);
  options.disableDefaultInjection = true; const rf = fresh(u, undefined); show(rf, 'flag on         :'); console.log('   ajv', validate(u, rf.emit).ok); options.disableDefaultInjection = false;
  console.log('   errors for {}      :', J(validate(u, {}).errors.map((e) => `${e.keyword}@${e.schemaPath}`)));
  console.log('   errors for {kind:"zzz"}:', J(validate(u, { kind: 'zzz' }).errors.map((e) => `${e.keyword}@${e.schemaPath}`)));
  const sel = { type: 'object', oneOf: [{ properties: { a: str(), b: str() } }, { properties: { c: str() } }] };
  const rs = fresh(sel, { c: 'C' }); console.log('   selection initial for {c:"C"} =', rs.selection, 'emit', J(rs.emit));
  rs.selection = 1; settle(rs); setValue(rs, { a: 'A', b: 'B' }); settle(rs); console.log('   after user selects [1] then setValue({a,b}, Overwrite): selection=', rs.selection, 'emit=', J(rs.emit), 'raw=', J(rawTree(rs)));
  reset(rs); settle(rs); console.log('   reset() (defaultValue {c:"C"}):', 'selection=', rs.selection, 'emit=', J(rs.emit), 'raw=', J(rawTree(rs)));
});

// ---------------------------------------------------------------- 8. A8 residual keys
section('8', 'removeKey on extras vs inactive-fragment child raw; branch-only unevaluatedProperties:false', () => {
  const schema = { type: 'object', properties: { a: str() }, additionalProperties: false, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } })] };
  const r = fresh(schema, { zz: 'Z', x: 5 }); show(r, 'load {zz, x} (a absent → F off):'); console.log('   residual', J(residual(r, schema)), 'x raw', J(find(r, '/x').raw));
  removeKey(r, 'zz'); removeKey(r, 'x'); settle(r); show(r, 'removeKey zz, x:');
  write(find(r, '/a'), 'A'); settle(r); show(r, 'a typed → F on → x default revived:');
  const r2 = fresh(schema, { x: 5 }); write(find(r2, '/a'), 'A'); settle(r2); show(r2, 'x=5 not removed, F on → x keeps 5:');
  const br = { type: 'object', oneOf: [{ properties: { kind: { const: 'cat' }, meow: str() }, required: ['kind'], unevaluatedProperties: false }, { properties: { kind: { const: 'dog' }, bark: str() }, required: ['kind'] }] };
  const rb = fresh(br, { kind: 'cat', zz: 'Z' }); console.log('   branch cat: residual', J(residual(rb, br)), 'emit', J(rb.emit));
  write(find(rb, '/kind'), 'dog'); settle(rb); console.log('   branch dog: residual', J(residual(rb, br)), 'emit', J(rb.emit));
});

// ---------------------------------------------------------------- 9. cost
section('9', 'N=200 fragments, one reverse chain: guard evaluations and ms per keystroke (ajv)', () => {
  for (const N of [30, 200]) for (const reverse of [false, true]) {
    const items = []; for (let i = 0; i < N; i++) items.push(cond({ required: [`p${i}`] }, { [`p${i + 1}`]: str(`v${i + 1}`) }));
    if (reverse) items.reverse();
    options.deriveCap = 1000; const r = fresh({ type: 'object', properties: { p0: str(), note: str() }, allOf: items }, { p0: 'go' });
    resetCounters(); const t0 = process.hrtime.bigint(); write(find(r, '/note'), 'k'); settle(r); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    console.log(`N=${N} reverse=${reverse}: keystroke at unrelated leaf → guards=${counters.guards} sweeps=${counters.sweeps} ${ms.toFixed(2)} ms (chain fully ON at commit, keys=${Object.keys(r.emit).length})`);
  }
  options.deriveCap = 25;
});

// ---------------------------------------------------------------- A4-2, A4-7, A1-1
section('A4-2', 'nested conditional inside a then: not traversed while the enclosing fragment is off', () => {
  const schema = { type: 'object', properties: { p: str(), q: str() }, if: { required: ['p'] }, then: { properties: { inner: str('I') }, allOf: [cond({ required: ['q'] }, { deep: str('DEEP') })] } };
  resetCounters(); const r = fresh(schema, { q: 'Q' }); show(r, 'raw {q} only:'); console.log('   guards evaluated', counters.guards, 'ajv', validate(schema, r.emit).ok);
  write(find(r, '/p'), 'P'); settle(r); show(r, 'then p typed :'); console.log('   ajv', validate(schema, r.emit).ok);
});
section('A4-7', 'emit key order = schema declaration order, extras after in insertion order', () => {
  const schema = { type: 'object', properties: { a: str(), b: str() }, allOf: [cond({ required: ['a'] }, { c: str('C') })] };
  const r = fresh(schema, { zz: 1, b: 'B', c: 'C0', a: 'A', yy: 2 }); console.log('   keys', J(Object.keys(r.emit)));
});
section('A1-1', 'getValue → setValue(getValue(), Overwrite) is not idempotent when a defaulted child was cleared', () => {
  const schema = { type: 'object', properties: { a: str() }, allOf: [cond({ required: ['a'] }, { x: { type: 'number', default: 1 } })] };
  const r = fresh(schema, { a: 'A' }); write(find(r, '/x'), undefined); settle(r); const v1 = r.emit; setValue(r, v1); settle(r); console.log('   before', J(v1), 'after round trip', J(r.emit));
});

// ---------------------------------------------------------------- A3-1 with caps
section('A3-1', 'derive cap: round 26 is not executed — committed raw is the last completed round', () => {
  const schema = { type: 'object', properties: { t: { type: 'number' }, u: { type: 'number' } }, injectTo: { '/t': { '/u': (v) => v + 1 }, '/u': { '/t': (v) => v } } };
  const r = fresh(schema, { t: 0, u: 0 }); show(r, ''); console.log('   raw t,u =', J([find(r, '/t').raw, find(r, '/u').raw]), 'emit = F(raw)?', J(r.emit) === J({ t: find(r, '/t').raw, u: find(r, '/u').raw }));
});
section('A4-2u', 'empty nested union: host {} vs host null — does the k default turn a branch on?', () => {
  const schema = { type: 'object', properties: { pet: { type: ['object', 'null'], oneOf: [{ properties: { kind: { const: 'cat' }, meow: str('m') } }, { properties: { kind: { const: 'dog' } } }] } } };
  for (const init of [{ pet: {} }, { pet: null }, {}]) { const r = fresh(schema, init); console.log(`   init=${J(init)} → emit=${J(r.emit)} pet.active=${J(activeTags(find(r, '/pet')))} rounds=${J(r.settleRounds)}`); }
});
