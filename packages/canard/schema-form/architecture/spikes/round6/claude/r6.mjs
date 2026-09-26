// Round 6 (claude) — counterexample probes against the 3.1-edition prototype.
// Imports spikes/work-loop/proto/loop-v4c.mjs unchanged. Run: node r6.mjs
// Rules the prototype does not implement (F11 edge-triggered injectTo, F15 per-tick
// wave cap) are emulated in this file and marked EMULATED.
import * as L from '../../work-loop/proto/loop-v4c.mjs';

const { leaf, object, array, attach, declareFragments, declareInjections, prime, write, setValue, batch, subscribe, valueOf, rawTree, activeIds, counters, resetCounters, lastSettle, setTrace, MISSING } = L;
const J = (v) => JSON.stringify(v);
const out = [];
const log = (...a) => {
  const s = a.join(' ');
  out.push(s);
  console.log(s);
};
const rawOf = (n) => (n.hasPending ? n.pendingRaw : n.raw);

// ---------------------------------------------------------------- E1
// Transition injection runs against a TRANSIENT shape inside one settle.
// kind (base default), x shared by then (default 'T') and else (default 'E').
function e1(guardThen, kindDefault, loadValue) {
  const root = object('root');
  const kind = attach(root, leaf('kind', kindDefault));
  attach(root, leaf('x'));
  declareFragments(root, [
    { id: 'then', guard: guardThen, declares: ['x'], defaults: { x: 'T' } },
    { id: 'else', guard: (G) => !guardThen(G), declares: ['x'], defaults: { x: 'E' } },
  ]);
  prime(root, loadValue);
  return { emit: valueOf(root), active: activeIds(root), rounds: lastSettle.rounds };
}
log('E1 transient-shape default injection (ADR 0007 §1 전이, round-4-spec A2 "주입 시점에 활성인 선언")');
// (a) `if: {properties:{kind:{const:'a'}}}` — vacuously true when kind is absent (standard)
const vac = (G) => G.kind === undefined || G.kind === 'a';
log('  (a) if without required, kind default "b"');
log('    load {}          ->', J(e1(vac, 'b', {})));
log('    load {kind:"b"}  ->', J(e1(vac, 'b', { kind: 'b' })));
// (b) `if: {properties:{kind:{const:'a'}}, required:['kind']}` — the pattern the docs recommend
const req = (G) => G.kind === 'a';
log('  (b) if WITH required, kind default "a"');
log('    load {}          ->', J(e1(req, 'a', {})));
log('    load {kind:"a"}  ->', J(e1(req, 'a', { kind: 'a' })));

// ---------------------------------------------------------------- E2
// Sequential vs batch: shared node, branch defaults differ.
function e2(useBatch) {
  const root = object('root');
  const kind = attach(root, leaf('kind'));
  attach(root, leaf('x'));
  declareFragments(root, [
    { id: 'A', guard: (G) => G.kind === 'a', declares: ['x'], defaults: { x: 'A' } },
    { id: 'B', guard: (G) => G.kind === 'b', declares: ['x'], defaults: { x: 'B' } },
  ]);
  prime(root, {});
  if (useBatch)
    batch(root, () => {
      write(kind, 'a');
      write(kind, 'b');
    });
  else {
    write(kind, 'a');
    write(kind, 'b');
  }
  return { emit: valueOf(root), raw: rawTree(root) };
}
log('');
log('E2 same writes, sequential vs batch (ADR 0008 §3 batch = mark N, settle 1)');
log('  sequential write(kind,a); write(kind,b) ->', J(e2(false)));
log('  batch(same two writes)                   ->', J(e2(true)));

// ---------------------------------------------------------------- E3
// injectTo edge-triggered on "source emit differs from previous commit" (F11). EMULATED.
function e3(scenario) {
  const root = object('root');
  const src = attach(root, leaf('src'));
  const tgt = attach(root, leaf('tgt'));
  declareInjections(root, [
    {
      from: src,
      to: tgt,
      map: (e) => {
        const committed = src.emit === MISSING ? undefined : src.emit;
        if (e === committed) return rawOf(tgt); // F11: source unchanged -> no fire
        return `f(${e})`;
      },
    },
  ]);
  prime(root, { src: 'x', tgt: 'custom' });
  const afterLoad = valueOf(root);
  write(tgt, 'mine'); // user edits the target
  if (scenario === 'seq') {
    write(src, 'y');
    write(src, 'x');
  } else if (scenario === 'batch') {
    batch(root, () => {
      write(src, 'y');
      write(src, 'x');
    });
  }
  return { afterLoad, final: valueOf(root) };
}
log('');
log('E3 injectTo fires only when source emit changed vs previous commit (F11) — EMULATED via map()');
log('  load {src:x,tgt:custom}; user tgt=mine; then src y->x sequential ->', J(e3('seq')));
log('  same, src y->x inside batch                                     ->', J(e3('batch')));

// ---------------------------------------------------------------- E4
// "emit reference unchanged => no onChange/validation" is reference-based.
function e4(useListener) {
  const root = object('root');
  const a = attach(root, leaf('a'));
  let onChange = 0;
  let validations = 0;
  const seen = [];
  root.onChange = (v, p) => {
    onChange++;
    seen.push({ prev: p.previous, cur: p.current });
  };
  root.onValidate = () => validations++;
  prime(root, { a: 'orig' });
  onChange = 0;
  validations = 0;
  seen.length = 0;
  if (useListener) {
    // a mask that rejects some input by writing the old value back (store listener, ADR 0008 §6)
    subscribe(a, (p) => {
      if (p.current === 'bad') setValue(a, 'orig');
    });
    write(a, 'bad');
  } else {
    batch(root, () => {
      write(a, 'bad');
      write(a, 'orig');
    });
  }
  return { onChange, validations, seen, final: valueOf(root) };
}
log('');
log('E4 net-zero change: listener write-back vs batch (ADR 0008 §5 "emit 참조가 바뀌지 않은 쓰기는 onChange도 검증도 없다")');
log('  listener reverts bad->orig ->', J(e4(true)));
log('  batch(bad, orig)           ->', J(e4(false)));

// ---------------------------------------------------------------- E5
// dev-mode budget throw aborts the entry's onChange; prod calls it.
function e5(dev) {
  const root = object('root');
  const y = attach(root, leaf('y'));
  attach(root, leaf('x'));
  // documented oscillation: if: {not: {required:[x]}}, then: {properties: {x: {default: 1}}}
  declareFragments(root, [{ id: 'osc', guard: (G) => !('x' in G), declares: ['x'], defaults: { x: 1 } }]);
  let onChange = 0;
  let validations = 0;
  root.onChange = () => onChange++;
  root.onValidate = () => validations++;
  let thrown = 0;
  try {
    prime(root, { y: '0' }, { dev });
  } catch {
    thrown++;
  }
  onChange = 0;
  validations = 0;
  try {
    write(y, '1');
  } catch {
    thrown++;
  }
  return { dev, onChangeAfterKeystroke: onChange, validations, thrown, committed: valueOf(root), status: root.settle.status };
}
log('');
log('E5 budget-exceeded: dev vs prod observable lifecycle (ADR 0007 §2 상한 초과, REPORT-v4c §5 A5)');
log('  dev  ->', J(e5(true)));
log('  prod ->', J(e5(false)));

// ---------------------------------------------------------------- E6
// Per-tick wave cap (ADR 0008 §2 rule 4 / F15: 틱당 25, macrotask reset). The prototype
// resets per dispatch, so here we only COUNT waves accumulated in one synchronous tick.
function e6(withListener, n) {
  const root = object('root');
  const a = attach(root, leaf('a'));
  const b = attach(root, leaf('b'));
  prime(root, {});
  if (withListener) subscribe(a, (p) => setValue(b, `derived:${p.current}`)); // ADR 0008 §6 recommended pattern
  const w0 = counters.waves;
  let firstCall = -1;
  for (let i = 1; i <= n; i++) {
    write(a, `v${i}`);
    if (firstCall < 0 && counters.waves - w0 > 25) firstCall = i;
  }
  return { calls: n, wavesInTick: counters.waves - w0, firstCallPastCap25: firstCall, b: valueOf(root).b };
}
log('');
log('E6 waves accumulated in ONE tick by un-batched writes (count only; cap applied per ADR text = inference)');
log('  30 writes, no listener          ->', J(e6(false, 30)));
log('  30 writes, store listener a->b  ->', J(e6(true, 30)));

// ---------------------------------------------------------------- E7
// "Merge is not a load, so no default" (03 §3) vs array Merge = Overwrite (ADR 0013 미결).
function e7() {
  const root = object('root');
  const obj = attach(root, object('obj'));
  const ox = attach(obj, leaf('x', 'D'));
  attach(obj, leaf('y'));
  const items = attach(
    root,
    array('items', (i) => {
      const o = object(i);
      attach(o, leaf('x', 'D'));
      attach(o, leaf('y'));
      return o;
    }),
  );
  prime(root, { obj: {}, items: [] });
  write(ox, undefined); // user clears obj.x -> absent
  setValue(root, { obj: { y: '1' }, items: [{ y: '1' }] }, 'Merge');
  return valueOf(root);
}
log('');
log('E7 Merge write containing an object and an array (03 §3 row 2 "Merge는 로드가 아니므로 default가 들어가지 않는다")');
log('  setValue({obj:{y:1}, items:[{y:1}]}, Merge) ->', J(e7()));

// ---------------------------------------------------------------- E8
// Positive loop: guard reads a key only its own fragment declares. Least fixed point.
function e8() {
  const root = object('root');
  attach(root, leaf('x'));
  // if: {required: ['x']}, then: {properties: {x: {type: 'string'}}}   (x not in base properties)
  declareFragments(root, [{ id: 'self', guard: (G) => 'x' in G, declares: ['x'] }]);
  prime(root, { x: 'v' });
  return { load: { x: 'v' }, emit: valueOf(root) ?? null, raw: rawTree(root), status: root.settle.status };
}
function e8b() {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  // allOf: [{if:{required:[b]}, then:{properties:{a:{}}}}, {if:{required:[a]}, then:{properties:{b:{}}}}]
  declareFragments(root, [
    { id: 'needsB', guard: (G) => 'b' in G, declares: ['a'] },
    { id: 'needsA', guard: (G) => 'a' in G, declares: ['b'] },
  ]);
  prime(root, { a: 1, b: 2 });
  return { load: { a: 1, b: 2 }, emit: valueOf(root) ?? null, status: root.settle.status };
}
log('');
log('E8 positive loops: valid loaded data vs emitted value (ADR 0013 "형상은 그 값으로 수렴한다")');
log('  self loop  ->', J(e8()));
log('  mutual     ->', J(e8b()));

// ---------------------------------------------------------------- E9
// Even negative cycle: two fixed points, order decides, NOT flagged budget-exceeded.
function e9(order) {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  const F1 = { id: 'F1', guard: (G) => !('b' in G), declares: ['a'] }; // if not required b then a
  const F2 = { id: 'F2', guard: (G) => !('a' in G), declares: ['b'] }; // if not required a then b
  declareFragments(root, order === 12 ? [F1, F2] : [F2, F1]);
  prime(root, { a: 1, b: 2 });
  return { order, active: activeIds(root), emit: valueOf(root), status: root.settle.status, sweeps: root.settle.sweeps };
}
log('');
log('E9 negative cycle with two fixed points (ADR 0007 §2 "budget-exceeded로 표시된다", F13 order hint)');
log('  order F1,F2 ->', J(e9(12)));
log('  order F2,F1 ->', J(e9(21)));

// ---------------------------------------------------------------- E10
// select-guard anyOf, value valid for both branches: load -> save round trip.
function e10() {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  declareFragments(root, [
    { id: 'A', select: 0, declares: ['a'] },
    { id: 'B', select: 1, declares: ['b'] },
  ]);
  prime(root, { a: 1, b: 2 });
  return { load: { a: 1, b: 2 }, emit: valueOf(root), active: activeIds(root) };
}
log('');
log('E10 anyOf without discriminator, value matching both branches (ADR 0002 선택 가드 초기 선택)');
log('  ->', J(e10()));

// ---------------------------------------------------------------- E11
// Store listener that normalises the SAME field (the pattern ADR 0008 §6 recommends
// instead of effects) marks RequestRefresh on that field on every keystroke.
function e11() {
  const root = object('root');
  const a = attach(root, leaf('a'));
  prime(root, {});
  const refreshes = [];
  subscribe(a, (p) => {
    refreshes.push({ v: p.current, refresh: p.refresh });
    if (typeof p.current === 'string' && p.current !== p.current.toUpperCase()) setValue(a, p.current.toUpperCase());
  });
  write(a, 'k');
  return refreshes;
}
log('');
log('E11 store listener upper-cases the same field (A6/F7 Refresh, T-2 "타이핑은 리마운트하지 않는다")');
log('  deliveries to a ->', J(e11()));

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
writeFileSync(new URL('./r6-output.txt', import.meta.url), `${out.join('\n')}\n`);
void fileURLToPath;
void resetCounters;
void setTrace;
