/**
 * Red-team attacks against round-3-spec.md §A/§C, executed on ./model.mjs.
 * Run: node attacks.mjs [section...]   (no args = all)
 */
import { activeTags, ajv, build, compute, counters, find, options, pathOf, rawTree, resetCounters, settle, setValue, validate, write, NONE } from './model.mjs';

const J = (v) => JSON.stringify(v);
const only = new Set(process.argv.slice(2));
const section = (id, title, fn) => { if (only.size && !only.has(id)) return; console.log(`\n=== [${id}] ${title}`); try { fn(); } catch (e) { console.log('THROW', e.message); } };
const fresh = (schema, init) => { const r = build(schema); if (init !== undefined) setValue(r, init); settle(r); return r; };
const show = (r, label = '') => console.log(`${label} emit=${J(r.emit)} local=${J(r.local)} raw=${J(rawTree(r))} active=${J(activeTags(r))} rounds=${r.rounds}`);

// ---------------------------------------------------------------- A3-1 determinism
section('A3-1a', 'same user raw, three write orders, two fragments declaring x with different defaults', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } }, allOf: [
    { if: { required: ['a'] }, then: { properties: { x: { type: 'number', default: 1 } } } },
    { if: { required: ['b'] }, then: { properties: { x: { type: 'number', default: 2 } } } } ] };
  const r1 = fresh(schema); write(find(r1, 'a'), 'x'); settle(r1); write(find(r1, 'b'), 'y'); settle(r1); show(r1, 'a then b :');
  const r2 = fresh(schema); write(find(r2, 'b'), 'y'); settle(r2); write(find(r2, 'a'), 'x'); settle(r2); show(r2, 'b then a :');
  const r3 = fresh(schema, { a: 'x', b: 'y' }); show(r3, 'setValue  :');
});
section('A3-1b', '"처음 활성" per settle: user removes a defaulted conditional child, next unrelated keystroke re-injects it', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' }, z: { type: 'string' } }, allOf: [{ if: { required: ['a'] }, then: { properties: { x: { type: 'number', default: 1 } } } }] };
  for (const mode of ['settle', 'lifetime']) {
    options.firstActive = mode;
    const r = fresh(schema, { a: 'x' }); show(r, `[${mode}] load        :`);
    write(find(r, 'x'), NONE); settle(r); show(r, `[${mode}] remove x    :`);
    write(find(r, 'z'), 'q'); settle(r); show(r, `[${mode}] type z      :`);
    setValue(r, { a: 'x', z: 'q' }); settle(r); show(r, `[${mode}] setValue(V) :`);
  }
  options.firstActive = 'settle';
});
section('A3-1c', 'total order: nested allOf inside an unconditional allOf item vs top-level if — tuple (rank, index, depth) puts the nested one first', () => {
  const schema = { type: 'object', properties: { p: { type: 'string' } }, allOf: [{ allOf: [{ if: { required: ['q'] }, then: { properties: { r: { type: 'string', default: 'R' } } } }] }], if: { required: ['p'] }, then: { properties: { q: { type: 'string', default: 'Q' } } } };
  const r = build(schema); console.log('fragment order:', r.fragments.map((f) => `${f.tag}${J(f.order)}`).join(' < '));
  setValue(r, { p: 'P' }); settle(r); show(r);
});

// ---------------------------------------------------------------- A3-2 chains
section('A3-2', 'dependency chain of 30: forward vs reverse declaration order — rounds and guard evaluations', () => {
  const N = 30;
  const mk = (reverse) => { const items = []; for (let i = 0; i < N; i++) items.push({ if: { required: [`p${i}`] }, then: { properties: { [`p${i + 1}`]: { type: 'string', default: `v${i + 1}` } } } }); if (reverse) items.reverse(); return { type: 'object', properties: { p0: { type: 'string' } }, allOf: items }; };
  for (const rev of [false, true]) {
    for (const reevalOn of [true, false]) {
      options.reevalOn = reevalOn; resetCounters();
      const r = fresh(mk(rev), { p0: 'go' });
      console.log(`reverse=${rev} reevalOn=${reevalOn}: rounds=${r.rounds} guards=${counters.guards} activeCount=${activeTags(r).length} keys=${Object.keys(r.emit).length}`);
    }
  }
  options.reevalOn = true;
  options.reevalOnlyOn = true; resetCounters(); const r = fresh(mk(true), { p0: 'go' });
  console.log(`reverse=true, A3-2 literal (only ON guards re-run): rounds=${r.rounds} guards=${counters.guards} activeCount=${activeTags(r).length}`);
  options.reevalOnlyOn = false;
});
section('A3-1d', 'nested conditional inside a then body: tuple order (rank allOf < rank if) evaluates it before — and independently of — its enclosing then', () => {
  const schema = { type: 'object', properties: { p: { type: 'string' }, q: { type: 'string' } }, if: { required: ['p'] }, then: { properties: { inner: { type: 'string', default: 'I' } }, allOf: [{ if: { required: ['q'] }, then: { properties: { deep: { type: 'string', default: 'DEEP' } } } }] } };
  const r = build(schema); console.log('   fragment order:', r.fragments.map((f) => `${f.tag}${J(f.order)}`).join(' < '));
  setValue(r, { q: 'Q' }); settle(r); show(r, '   raw {q} only (outer then is OFF):'); console.log('   ajv:', J(validate(schema, r.emit)));
});
section('A3-2b', 'cost per keystroke: N fragments all already satisfied, one unrelated leaf typed', () => {
  for (const N of [30, 200]) {
    const items = []; for (let i = 0; i < N; i++) items.push({ if: { required: [`p${i}`] }, then: { properties: [`p${i + 1}`].reduce((o, k) => ({ ...o, [k]: { type: 'string', default: 'v' } }), {}) } });
    const schema = { type: 'object', properties: { p0: { type: 'string' }, note: { type: 'string' } }, allOf: items.reverse() };
    const r = fresh(schema, { p0: 'go' });
    resetCounters(); const t0 = process.hrtime.bigint(); write(find(r, 'note'), 'k'); settle(r); const us = Number(process.hrtime.bigint() - t0) / 1e3;
    console.log(`N=${N} reverse chain, keystroke in note: rounds=${r.rounds} guards=${counters.guards} (N²/2≈${(N * N) / 2}) time=${us.toFixed(0)}µs`);
    const f = fresh({ type: 'object', properties: { p0: { type: 'string' }, note: { type: 'string' } }, allOf: items.slice().reverse() }, { p0: 'go' });
    resetCounters(); write(find(f, 'note'), 'k'); settle(f); console.log(`N=${N} forward chain, keystroke in note: rounds=${f.rounds} guards=${counters.guards}`);
  }
});

// ---------------------------------------------------------------- A3 step 4 monotone
section('A3-4A', 'monotone: then AND else of the same if both active; emit rejected by ajv; option B has an accepted fixpoint', () => {
  const schema = { type: 'object', properties: { mode: { type: 'string' } }, allOf: [
    { if: { not: { required: ['extra'] } }, then: { properties: { fallback: { type: 'string', default: 'F' } } }, else: { properties: { mode: {}, extra: {} }, additionalProperties: false } },
    { if: { properties: { mode: { const: 'full' } }, required: ['mode'] }, then: { properties: { extra: { type: 'string', default: 'E' } } } } ] };
  for (const mono of [true, false]) {
    options.monotone = mono; const r = fresh(schema, { mode: 'full' }); show(r, `monotone=${mono}:`); console.log('   ajv:', J(validate(schema, r.emit)));
  }
  options.monotone = true;
});
section('A3-4B', 'realistic "if not required x then y required": no default → no divergence (monotone irrelevant)', () => {
  const schema = { type: 'object', properties: { x: { type: 'string' }, y: { type: 'string' } }, allOf: [{ if: { not: { required: ['x'] } }, then: { required: ['y'] } }] };
  const r = fresh(schema, {}); show(r); console.log('   ajv:', J(validate(schema, r.emit)));
});
section('A3-4C', 'ADR 0007 oscillation `if not required x then x default` under monotone', () => {
  const schema = { type: 'object', allOf: [{ if: { not: { required: ['x'] } }, then: { properties: { x: { type: 'number', default: 1 } } } }] };
  const r = fresh(schema, {}); show(r); console.log('   ajv:', J(validate(schema, r.emit)));
  write(find(r, 'x'), NONE); settle(r); show(r, 'after user removes x:');
});

// ---------------------------------------------------------------- A3-5 forbid
section('A3-5', 'forbid fragment: guard sees x, projection drops it; ajv verdict', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' } }, allOf: [{ if: { required: ['a'] }, then: { properties: { a: false } } }] };
  const r = fresh(schema, { a: 'here' }); show(r); console.log('   ajv(emit):', J(validate(schema, r.emit)), ' ajv(local):', J(validate(schema, r.local)));
});

// ---------------------------------------------------------------- A3-4 / omitEmpty / guards see local
section('A3-4-omit', 'guard sees pre-projection L: empty string counts as present; validator sees emit without it', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' } }, allOf: [{ if: { required: ['a'] }, then: { properties: { b: { type: 'string', default: 'B' } }, required: ['b'] } }] };
  const r = fresh(schema, { a: '' }); show(r); console.log('   validator input (emit):', J(r.emit), 'ajv:', J(validate(schema, r.emit)));
  console.log('   guard `required a` on L:', ajv.compile({ required: ['a'] })(r.local), ' on emit:', ajv.compile({ required: ['a'] })(r.emit));
});
section('A3-4-lift', 'ADR 0002 rule 6 lifted guard reads a nested object that omitEmpty/null turned into undefined/null — vacuous truth returns one level up', () => {
  const g = ajv.compile({ properties: { addr: { required: ['zip'] } } });
  for (const L of [{}, { addr: {} }, { addr: null }, { addr: { zip: '1' } }, { addr: { city: 'x' } }]) console.log(`   guard on ${J(L)} → ${g(L)}`);
  const schema = { type: 'object', properties: { addr: { type: 'object', properties: { zip: { type: 'string' }, city: { type: 'string' } } } }, allOf: [{ if: { properties: { addr: { required: ['zip'] } } }, then: { properties: { zipNote: { type: 'string', default: 'has zip' } } } }] };
  for (const init of [{}, { addr: {} }, { addr: null }, { addr: { city: 'Seoul' } }]) { const r = fresh(schema, init); console.log(`   init ${J(init)} → L=${J(r.local)} active=${J(activeTags(r))} emit=${J(r.emit)}`); }
});

// ---------------------------------------------------------------- nested hosts
section('A3-nest', 'parent fragment declares a GRANDCHILD (rule 6 overlay on descendants): the child host has no fragment for it', () => {
  const schema = { type: 'object', properties: { flag: { type: 'string' }, child: { type: 'object', properties: { p: { type: 'string' } }, allOf: [{ if: { required: ['q'] }, then: { properties: { r: { type: 'string', default: 'R' } } } }] } }, allOf: [{ if: { required: ['flag'] }, then: { properties: { child: { properties: { q: { type: 'string', default: 'Q' } } } } } }] };
  const r = fresh(schema, { flag: 'on', child: { p: 'P' } }); show(r);
  const c = find(r, 'child'); console.log('   child fragments:', c.fragments.map((f) => f.tag), ' child children:', [...c.children.keys()], ' child overlays:', J(c.overlays ?? null));
});

// ---------------------------------------------------------------- arrays
section('A3-array', 'array items with conditional fragments; keystroke in item 9,999 — compute count and array copy', () => {
  const schema = { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string' } }, allOf: [{ if: { properties: { kind: { const: 'x' } }, required: ['kind'] }, then: { properties: { extra: { type: 'string', default: 'E' } } } }] } } } };
  const N = 10000; const r = fresh(schema, { items: Array.from({ length: N }, (_, i) => ({ kind: i % 2 ? 'x' : 'y' })) });
  resetCounters(); const t0 = process.hrtime.bigint(); write(find(r, 'items/9999/kind'), 'x'); settle(r); const us = Number(process.hrtime.bigint() - t0) / 1e3;
  console.log(`   keystroke in item 9999: computes=${counters.computes} guards=${counters.guards} time=${us.toFixed(0)}µs (spec: "루트에서 시작하는 단일 하향 재귀" — this model has no dirty list, so the number is the upper bound the spec's dirty list must beat)`);
  console.log('   contains/prefixItems: model has no representation — spec A3 says nothing (see report)');
});

// ---------------------------------------------------------------- A4 derive
section('A4a', 'injectTo two-cycle t := u+1, u := t+1 — cap 25, "값은 받아들이고 마지막 라운드의 트리로 고정"', () => {
  const schema = { type: 'object', properties: { t: { type: 'number', injectTo: { '/u': (v) => (v ?? 0) + 1 } }, u: { type: 'number', injectTo: { '/t': (v) => (v ?? 0) + 1 } } } };
  const r = build(schema); setValue(r, { t: 0, u: 0 }); resetCounters(); const res = settle(r);
  console.log(`   ${J(res)} raw=${J(rawTree(r))} emit=${J(r.emit)} — raw t/u vs emit t/u equal? ${J(rawTree(r)) === J(r.emit)}`);
});
section('A4b', 'injectTo from a child inside a fragment that its own write turns off: the written value stays, the writer is inactive', () => {
  const schema = { type: 'object', properties: { t: { type: 'string' } }, allOf: [{ if: { not: { required: ['t'] } }, then: { properties: { c: { type: 'string', default: 'C', injectTo: { '/t': (v) => `from-${v}` } } } } }] };
  const r = build(schema); options.log = (m) => console.log('   ', m); const res = settle(r); options.log = null; show(r, `   ${J(res)}`);
  write(find(r, 't'), NONE); settle(r); show(r, '   user removes t:');
});
section('A4c', 'injectTo writes 17 into a host: partial write or full replace? (C1/C3 do not say)', () => {
  const schema = { type: 'object', properties: { src: { type: 'string', injectTo: { '/host': () => 17 } }, host: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } } } };
  const r = build(schema); setValue(r, { src: 'go', host: { a: 'A', b: 'B' } }); settle(r); show(r);
  write(find(r, 'host/a'), 'A2'); settle(r); show(r, '   then partial write host/a:');
});

// ---------------------------------------------------------------- A5 union
section('A5a', 'branches declare different defaults for k; nothing says which default the union-owned k gets', () => {
  const schema = { type: 'object', oneOf: [{ properties: { k: { const: 'a', default: 'a' }, x: { type: 'string', default: 'X' } } }, { properties: { k: { const: 'b', default: 'b' }, y: { type: 'string', default: 'Y' } } }] };
  const r = fresh(schema, {}); show(r); console.log('   k node schema:', J(find(r, 'k').schema), ' ajv(emit):', J(validate(schema, r.emit)));
});
section('A5b', 'value union oneOf:[{type:string},{type:object,…}] — B step 3 finds no candidate; A5 has no host', () => {
  const schema = { oneOf: [{ type: 'string' }, { type: 'object', properties: { k: { const: 'o' }, v: { type: 'string' } } }] };
  const r = build(schema); console.log('   kind=', r.kind, 'select=', J(r.select ?? null), 'fragments=', r.fragments.map((f) => f.tag)); setValue(r, 'hello'); settle(r); show(r);
});
section('A5c', 'anyOf where two branches match the same k value → B step 4 says select; with a third disjoint branch the whole union degrades', () => {
  const schema = { type: 'object', anyOf: [{ properties: { k: { const: 'a' }, x: { type: 'string' } } }, { properties: { k: { const: 'a' }, y: { type: 'string' } } }, { properties: { k: { const: 'z' }, z: { type: 'string' } } }] };
  const r = build(schema); console.log('   select=', r.select ? 'yes' : 'no', 'children=', [...r.children.keys()]);
});

// ---------------------------------------------------------------- A6 null
section('A6a', 'setValue(null) on a host: C1 full replace clears children, A6 keeps them — both readings', () => {
  const schema = { type: 'object', properties: { note: { type: 'string', default: 'D' }, keep: { type: 'string' } } };
  for (const keep of [true, false]) {
    options.nullKeepsChildren = keep;
    const r = fresh(schema, { note: 'typed', keep: 'K1' }); setValue(r, null); settle(r); show(r, `   nullKeepsChildren=${keep} after null:`);
    write(find(r, 'note'), 'Z'); settle(r); show(r, `   nullKeepsChildren=${keep} write note:`);
  }
  options.nullKeepsChildren = true;
});
section('A6b', 'default injection inside compute of a null host writes raw under the null ancestor; a later partial write revives it', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' } }, allOf: [{ if: { not: { required: ['a'] } }, then: { properties: { d: { type: 'string', default: 'D' } } } }] };
  const r = fresh(schema, null); show(r, '   null host:'); write(find(r, 'a'), 'A'); settle(r); show(r, '   write a:');
});
section('A6c', 'required child under a null parent and under an omitEmpty-omitted parent: ajv verdicts on emit', () => {
  const schema = { type: 'object', properties: { addr: { type: ['object', 'null'], properties: { zip: { type: 'string' } }, required: ['zip'] } }, required: ['addr'] };
  for (const init of [{ addr: null }, { addr: {} }, { addr: { zip: '' } }]) { const r = fresh(schema, init); console.log(`   init ${J(init)} local=${J(r.local)} emit=${J(r.emit)} ajv=${J(validate(schema, r.emit))}`); }
});

// ---------------------------------------------------------------- A7/A8
section('A8a', 'node.value (local) vs getValue() (emit) in one wave; UpdateValue with local changed but emit not', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' }, addr: { type: 'object', properties: { zip: { type: 'string' } } } } };
  const r = fresh(schema, { a: 'x' }); const before = r.emit;
  write(find(r, 'addr/zip'), ''); settle(r); console.log(`   after zip:='' → local=${J(r.local)} emit=${J(r.emit)} emit deep-equal before? ${J(before) === J(r.emit)} same ref? ${before === r.emit}`);
});
section('A7', 'listener 1 does sync setValue; listener 2 of wave 1 reads payload (wave-1 local) vs getValue() (wave-2 emit)', () => {
  const schema = { type: 'object', properties: { n: { type: 'number' } } };
  const r = fresh(schema, { n: 1 }); const seen = [];
  const listeners = [(payload) => { write(find(r, 'n'), 2); settle(r); seen.push(`L1 payload=${J(payload)}`); }, (payload) => seen.push(`L2 payload=${J(payload)} getValue()=${J(r.emit)} node.value=${J(r.local)}`)];
  write(find(r, 'n'), 1.5); settle(r); const payload = r.local; for (const l of listeners) l(payload);
  console.log('   ' + seen.join(' | '));
});

// ---------------------------------------------------------------- C1–C3
section('C1', 'setValue(V) then getValue(): defaults re-injected for keys V lacks; extras kept; latent value purged', () => {
  const schema = { type: 'object', properties: { kind: { type: 'string' }, base: { type: 'string', default: 'BASE' } }, allOf: [{ if: { properties: { kind: { const: 'a' } }, required: ['kind'] }, then: { properties: { a: { type: 'string', default: 'A0' } } } }, { if: { properties: { kind: { const: 'b' } }, required: ['kind'] }, then: { properties: { b: { type: 'string' } } } }] };
  const r = fresh(schema, { kind: 'b', b: 'SECRET' }); show(r, '   load A:'); setValue(r, { kind: 'a', a: 'NEW', extra: 1 }); settle(r); show(r, '   setValue B:'); write(find(r, 'kind'), 'b'); settle(r); show(r, '   switch to b:');
  const v = { kind: 'a' }; setValue(r, v); settle(r); console.log(`   setValue(${J(v)}) → getValue()=${J(r.emit)}  equal? ${J(v) === J(r.emit)}`);
});
section('C2-extra', 'extra key later becomes a declared key when a fragment turns on: host raw vs child node — two owners', () => {
  const schema = { type: 'object', properties: { kind: { type: 'string' } }, allOf: [{ if: { properties: { kind: { const: 'b' } }, required: ['kind'] }, then: { properties: { e: { type: 'string', default: 'DEF' } } } }] };
  const r = fresh(schema, { kind: 'a', e: 'EXTRA' }); show(r, '   load:'); write(find(r, 'kind'), 'b'); settle(r); show(r, '   kind:=b:'); console.log('   host.raw=', J(r.raw), ' e.raw=', J(find(r, 'e').raw === NONE ? '∅' : find(r, 'e').raw));
});
section('C3', 'raw=17 host: siblings after a partial write into one child; extras after 17', () => {
  const schema = { type: 'object', properties: { host: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string', default: 'BD' } } } } };
  const r = fresh(schema, { host: { a: 'A', b: 'B', x: 'EXTRA' } }); show(r, '   load:');
  setValue(find(r, 'host'), 17); settle(r); show(r, '   setValue(host,17):'); console.log('   ajv:', J(validate(schema, r.emit)));
  write(find(r, 'host/a'), 'A2'); settle(r); show(r, '   partial host/a:');
});
