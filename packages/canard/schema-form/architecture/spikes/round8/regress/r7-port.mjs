// Round 7 (claude) — P6 prototype probes against loop-v4d.mjs.
//   node r7.mjs old   -> r7-old-output.txt  (OLD_SWITCHES = loop-v4c behaviour; must reproduce round-6 output)
//   node r7.mjs new   -> r7-new-output.txt  (default switches + the extra matrix X*, D-17)
// E1-E4, E6, E7, E9, E10 are ported from round6/claude/r6.mjs and E12, E13 from r6-empty.mjs.
// Only the import path and E3 differ: in "old" E3 keeps r6's EMULATED F11 wrapper on top of
// v4c's level-firing derive; in "new" E3 uses a plain map and v4d's NATIVE edge-firing.
import { readFileSync, writeFileSync } from 'node:fs';

import * as L from '../proto/loop-v4e.mjs';

const { leaf, object, array, attach, declareFragments, declareInjections, prime, write, setValue, batch, subscribe, reset, valueOf, rawTree, activeIds, counters, lastSettle, lastEntry, setSwitches, OLD_SWITCHES, NEW_SWITCHES, SWITCHES, MISSING } = L;
const MODE = process.argv[2] === 'old' ? 'old' : 'new';
const BASE = MODE === 'old' ? OLD_SWITCHES : NEW_SWITCHES;
setSwitches(BASE);

const J = (v) => JSON.stringify(v);
const JU = (v) => JSON.stringify(v === undefined ? '<undefined>' : v);
const out = [];
const log = (...a) => {
  const s = a.join(' ');
  out.push(s);
  console.log(s);
};
const rawOf = (n) => (n.hasPending ? n.pendingRaw : n.raw);
/** Run fn under BASE overridden by sw, then restore BASE. */
const under = (sw, fn) => {
  setSwitches({ ...BASE, ...sw });
  try {
    return fn();
  } finally {
    setSwitches(BASE);
  }
};

// ---------------------------------------------------------------- E1
function e1(guardThen, kindDefault, loadValue) {
  const root = object('root');
  attach(root, leaf('kind', kindDefault));
  attach(root, leaf('x'));
  declareFragments(root, [
    { id: 'then', guard: guardThen, declares: ['x'], defaults: { x: 'T' } },
    { id: 'else', guard: (G) => !guardThen(G), declares: ['x'], defaults: { x: 'E' } },
  ]);
  prime(root, loadValue);
  return { emit: valueOf(root), active: activeIds(root), rounds: lastSettle.rounds };
}
const vac = (G) => G.kind === undefined || G.kind === 'a';
const req = (G) => G.kind === 'a';
log('E1 transient-shape default injection (ADR 0007 §1 전이, round-4-spec A2 "주입 시점에 활성인 선언")');
log('  (a) if without required, kind default "b"');
log('    load {}          ->', J(e1(vac, 'b', {})));
log('    load {kind:"b"}  ->', J(e1(vac, 'b', { kind: 'b' })));
log('  (b) if WITH required, kind default "a"');
log('    load {}          ->', J(e1(req, 'a', {})));
log('    load {kind:"a"}  ->', J(e1(req, 'a', { kind: 'a' })));

// ---------------------------------------------------------------- E2
function e2Tree() {
  const root = object('root');
  const kind = attach(root, leaf('kind'));
  attach(root, leaf('x'));
  declareFragments(root, [
    { id: 'A', guard: (G) => G.kind === 'a', declares: ['x'], defaults: { x: 'A' } },
    { id: 'B', guard: (G) => G.kind === 'b', declares: ['x'], defaults: { x: 'B' } },
  ]);
  prime(root, {});
  return { root, kind };
}
function e2(useBatch) {
  const { root, kind } = e2Tree();
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
function e3Tree(emulated) {
  const root = object('root');
  const src = attach(root, leaf('src'));
  const tgt = attach(root, leaf('tgt'));
  const map = emulated
    ? (e) => {
        const committed = src.emit === MISSING ? undefined : src.emit;
        if (e === committed) return rawOf(tgt);
        return `f(${e})`;
      }
    : (e) => `f(${e})`;
  declareInjections(root, [{ from: src, to: tgt, map }]);
  return { root, src, tgt };
}
function e3(scenario, emulated) {
  const { root, src, tgt } = e3Tree(emulated);
  prime(root, { src: 'x', tgt: 'custom' });
  const afterLoad = valueOf(root);
  write(tgt, 'mine');
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
if (MODE === 'old') {
  log('E3 injectTo fires only when source emit changed vs previous commit (F11) — EMULATED via map()');
  log('  load {src:x,tgt:custom}; user tgt=mine; then src y->x sequential ->', J(e3('seq', true)));
  log('  same, src y->x inside batch                                     ->', J(e3('batch', true)));
} else {
  log(`E3 injectTo edge-firing — NATIVE (EDGE_REF=${SWITCHES.EDGE_REF}, LOAD_EDGE=${SWITCHES.LOAD_EDGE})`);
  log('  load {src:x,tgt:custom}; user tgt=mine; then src y->x sequential ->', J(e3('seq', false)));
  log('  same, src y->x inside batch                                     ->', J(e3('batch', false)));
}

// ---------------------------------------------------------------- E4
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

// ---------------------------------------------------------------- E6
function e6(withListener, n) {
  const root = object('root');
  const a = attach(root, leaf('a'));
  attach(root, leaf('b'));
  prime(root, {});
  if (withListener) subscribe(a, (p) => setValue(root.index.get('b'), `derived:${p.current}`));
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
function e7() {
  const root = object('root');
  const obj = attach(root, object('obj'));
  const ox = attach(obj, leaf('x', 'D'));
  attach(obj, leaf('y'));
  attach(
    root,
    array('items', (i) => {
      const o = object(i);
      attach(o, leaf('x', 'D'));
      attach(o, leaf('y'));
      return o;
    }),
  );
  prime(root, { obj: {}, items: [] });
  write(ox, undefined);
  setValue(root, { obj: { y: '1' }, items: [{ y: '1' }] }, 'Merge');
  return valueOf(root);
}
log('');
log('E7 Merge write containing an object and an array (03 §3 row 2 "Merge는 로드가 아니므로 default가 들어가지 않는다")');
log('  setValue({obj:{y:1}, items:[{y:1}]}, Merge) ->', J(e7()));

// ---------------------------------------------------------------- E9
function e9(order) {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  const F1 = { id: 'F1', guard: (G) => !('b' in G), declares: ['a'] };
  const F2 = { id: 'F2', guard: (G) => !('a' in G), declares: ['b'] };
  declareFragments(root, order === 12 ? [F1, F2] : [F2, F1]);
  prime(root, { a: 1, b: 2 });
  return { order, active: activeIds(root), emit: valueOf(root), status: root.settle.status, sweeps: root.settle.sweeps };
}
log('');
log('E9 negative cycle with two fixed points (ADR 0007 §2 "budget-exceeded로 표시된다", F13 order hint)');
log('  order F1,F2 ->', J(e9(12)));
log('  order F2,F1 ->', J(e9(21)));

// ---------------------------------------------------------------- E10
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

// ---------------------------------------------------------------- E12, E13 (r6-empty.mjs)
function e12() {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  declareFragments(root, [
    { id: 'A', select: 0, declares: ['a'], defaults: { a: 'A' } },
    { id: 'B', select: 1, declares: ['b'], defaults: { b: 'B' } },
  ]);
  prime(root, { zzz: 1 });
  return root;
}
{
  const root = e12();
  log('E12 select-guard, load {zzz:1} -> active', JU(activeIds(root)), 'emit', JU(valueOf(root)));
}
{
  const root = object('root');
  const a = attach(root, leaf('a'));
  prime(root, { a: 'x' });
  write(a, '');
  log('E13 root {a}, user clears a to "" -> getValue()', JU(valueOf(root)), 'raw', JU(rawTree(root)));
}

// ---------------------------------------------------------------- port check (old only)
if (MODE === 'old') {
  const r6 = readFileSync(new URL('../../round6/claude/r6-output.txt', import.meta.url), 'utf8').split('\n');
  const r6e = readFileSync(new URL('../../round6/claude/r6-empty-output.txt', import.meta.url), 'utf8').split('\n');
  const ported = ['E1', 'E2', 'E3', 'E4', 'E6', 'E7', 'E9', 'E10'];
  const keep = [];
  let inCase = false;
  for (const line of r6) {
    const head = /^E(\d+) /.exec(line);
    if (head) inCase = ported.includes(`E${head[1]}`);
    if (inCase && line.trim() !== '') keep.push(line);
  }
  for (const line of r6e) if (/^E1[23] /.test(line)) keep.push(line);
  const mine = new Set(out);
  const missing = keep.filter((l) => !mine.has(l));
  log('');
  log(`PORT CHECK vs round6/claude r6-output.txt + r6-empty-output.txt: ${keep.length - missing.length}/${keep.length} lines identical`);
  for (const m of missing) log(`  MISSING: ${m}`);
}

// ---------------------------------------------------------------- extras (new only)
if (MODE === 'new') {
  const NEW_SETTLE = {};
  const NEW_ENTRY = { AUTO_SCOPE: 'entry' };
  const rows = [
    ['OLD (v4c)', OLD_SWITCHES],
    ['NEW settle-scope', NEW_SETTLE],
    ['NEW entry-scope', NEW_ENTRY],
    ['NEW settle-scope, EDGE_REF=commit', { EDGE_REF: 'commit' }],
  ];
  log('');
  log('==================== EXTRAS (round 7) ====================');

  // X2: E2 with the two writes inside ONE outermost entry (a listener performs the second).
  log('');
  log('X2 E2 inside one entry: write(kind,a) whose listener writes kind=b, vs batch');
  for (const [label, sw] of rows) {
    const r = under(sw, () => {
      const { root, kind } = e2Tree();
      subscribe(kind, (p) => {
        if (p.current === 'a') write(kind, 'b');
      });
      write(kind, 'a');
      const listener = valueOf(root);
      const t = e2Tree();
      batch(t.root, () => {
        write(t.kind, 'a');
        write(t.kind, 'b');
      });
      const top = e2Tree();
      write(top.kind, 'a');
      write(top.kind, 'b');
      return { topLevelSeq: valueOf(top.root), inEntrySeq: listener, batch: valueOf(t.root) };
    });
    log(`  ${label.padEnd(36)} ->`, J(r));
  }

  // X3: E3 with the two source writes inside ONE entry.
  log('');
  log('X3 E3 inside one entry: user tgt=mine; write(src,y) whose listener writes src=x, vs batch, vs top-level');
  for (const [label, sw] of rows) {
    const r = under(sw, () => {
      const emulated = sw === OLD_SWITCHES;
      const a = e3Tree(emulated);
      prime(a.root, { src: 'x', tgt: 'custom' });
      write(a.tgt, 'mine');
      subscribe(a.src, (p) => {
        if (p.current === 'y') write(a.src, 'x');
      });
      write(a.src, 'y');
      return { topLevelSeq: e3('seq', emulated).final, inEntrySeq: valueOf(a.root), batch: e3('batch', emulated).final };
    });
    log(`  ${label.padEnd(36)} ->`, J(r));
  }

  // X3c: native F11 with EDGE_REF=commit, FINAL_SHAPE off, must equal r6's emulation.
  log('');
  log('X3c native edge with EDGE_REF=commit (F11 text) vs r6 EMULATED wrapper on v4c derive');
  {
    const nat = under({ ...OLD_SWITCHES, INJECT_TO_EDGE: true }, () => ({ seq: e3('seq', false), batch: e3('batch', false) }));
    const emu = under(OLD_SWITCHES, () => ({ seq: e3('seq', true), batch: e3('batch', true) }));
    log('  native  ->', J(nat));
    log('  emulated->', J(emu));
    log('  identical:', J(nat) === J(emu));
  }

  // X3L: mount / reset rule (LOAD_EDGE)
  log('');
  log('X3L injectTo at mount / reset (LOAD_EDGE): map(e)=f(e)');
  for (const mode of ['fire', 'skip', 'fill', 'ref']) {
    const r = under({ LOAD_EDGE: mode }, () => {
      const a = e3Tree(false);
      prime(a.root, { src: 'x', tgt: 'custom' });
      const loadWithTgt = valueOf(a.root);
      write(a.tgt, 'mine');
      write(a.src, 'z');
      const edited = valueOf(a.root);
      reset(a.root);
      const afterReset = valueOf(a.root);
      const b = e3Tree(false);
      prime(b.root, { src: 'x' });
      const loadNoTgt = valueOf(b.root);
      const c = e3Tree(false);
      prime(c.root, { src: 'x', tgt: 'custom' });
      write(c.tgt, 'mine');
      reset(c.root);
      const resetSrcSame = valueOf(c.root);
      return { loadWithTgt, loadNoTgt, edited, afterReset, resetWhereSrcUnchanged: resetSrcSame };
    });
    log(`  LOAD_EDGE=${mode.padEnd(4)} ->`, J(r));
  }

  // X9h: F13 order hint makes the fixed point depend on history.
  log('');
  log('X9h F13 ORDER_HINT: same raw {a:1,b:2} reached by two histories (fragments F1,F2 of E9)');
  for (const hint of [false, true]) {
    const r = under({ ORDER_HINT: hint }, () => {
      const mk = () => {
        const root = object('root');
        attach(root, leaf('a'));
        attach(root, leaf('b'));
        declareFragments(root, [
          { id: 'F1', guard: (G) => !('b' in G), declares: ['a'] },
          { id: 'F2', guard: (G) => !('a' in G), declares: ['b'] },
        ]);
        return root;
      };
      const h1 = mk();
      prime(h1, { a: 1, b: 2 });
      const h2 = mk();
      prime(h2, { b: 2 });
      setValue(h2, { a: 1 }, 'Merge');
      return { loadAB: { active: activeIds(h1), emit: valueOf(h1), raw: rawTree(h1) }, loadB_thenMergeA: { active: activeIds(h2), emit: valueOf(h2), raw: rawTree(h2) } };
    });
    log(`  ORDER_HINT=${String(hint).padEnd(5)} ->`, J(r));
  }

  // X10/X12: TIE_MODE and the zero-key rule.
  log('');
  log('X10/X12 initial selection (D-14 a): E10 tie and E12 zero keys under SELECT_RULE/TIE_MODE');
  for (const [label, sw] of [
    ['v4c', { SELECT_RULE: 'v4c' }],
    ['score, TIE=first', { SELECT_RULE: 'score', TIE_MODE: 'first' }],
    ['score, TIE=none', { SELECT_RULE: 'score', TIE_MODE: 'none' }],
  ]) {
    const r = under(sw, () => {
      const t10 = e10();
      const t12 = e12();
      const root = object('root');
      attach(root, leaf('a'));
      attach(root, leaf('b'));
      attach(root, leaf('c'));
      declareFragments(root, [
        { id: 'A', select: 0, declares: ['a'] },
        { id: 'BC', select: 1, declares: ['b', 'c'] },
      ]);
      prime(root, { a: 1, b: 2, c: 3 });
      return { e10: { active: t10.active, emit: t10.emit }, e12: { active: activeIds(t12), emit: valueOf(t12) ?? '<undefined>' }, score2vs1: { active: activeIds(root), emit: valueOf(root) } };
    });
    log(`  ${label.padEnd(17)} ->`, J(r));
  }

  // X15: injectTo fed by a default injected in an intermediate round (P6 covers injectTo too).
  log('');
  log('X15 injectTo from a child whose default was injected in an intermediate round and whose fragment is off at the end');
  for (const [label, sw] of rows.slice(0, 2)) {
    const r = under(sw, () => {
      const root = object('root');
      attach(root, leaf('kind', 'b'));
      const x = attach(root, leaf('x'));
      const y = attach(root, leaf('y'));
      declareFragments(root, [{ id: 'F', guard: vac, declares: ['x'], defaults: { x: 'X' } }]);
      declareInjections(root, [{ from: x, to: y, map: (v) => (v === undefined ? undefined : `d(${v})`) }]);
      prime(root, {});
      return { emit: valueOf(root), raw: rawTree(root), active: activeIds(root), rounds: lastSettle.rounds, status: root.settle.status };
    });
    log(`  ${label.padEnd(36)} ->`, J(r));
  }

  // X16: a schema with no fixed point under P6 (selfcheck A4b's load).
  log('');
  log('X16 selfcheck A4b load: fragment "then" = if not required t, declares c default C; injectTo c -> t (from-${c})');
  for (const [label, sw] of rows.slice(0, 3)) {
    const r = under(sw, () => {
      L.setTrace(true);
      const root = object('');
      attach(root, leaf('t'));
      const c = attach(root, leaf('c'));
      declareFragments(root, [{ id: 'then', guard: (G) => !('t' in G), declares: ['c'], defaults: { c: 'C' } }]);
      prime(root, {});
      declareInjections(root, [{ from: c, to: root.index.get('t'), map: (v) => `from-${v}` }]);
      setValue(root, {});
      L.setTrace(false);
      return { emit: valueOf(root) ?? '<undefined>', raw: rawTree(root), active: activeIds(root), rounds: lastSettle.rounds, status: root.settle.status, budgetWhich: lastSettle.budgetWhich, retractions: lastSettle.retracted.length };
    });
    log(`  ${label.padEnd(36)} ->`, J(r));
  }

  // XA4: the cap still binds a self-feeding injectTo under edge-firing when the write changes the source.
  log('');
  log('XA4 selfcheck A4-cap with write(n,1) instead of write(n,0) (n committed 0): map = min(30, n+1)');
  for (const [label, sw] of rows.slice(0, 2)) {
    const r = under(sw, () => {
      const root = object('');
      const n = attach(root, leaf('n'));
      prime(root, { n: 0 });
      declareInjections(root, [{ from: n, to: n, map: (v) => Math.min(30, (v ?? 0) + 1) }]);
      write(n, 0);
      const same = { emit: valueOf(root), rounds: lastSettle.rounds };
      write(n, 1);
      return { writeSameValue0: same, write1: { emit: valueOf(root), raw: rawTree(root), rounds: lastSettle.rounds, status: root.settle.status } };
    });
    log(`  ${label.padEnd(36)} ->`, J(r));
  }

  // D-17: wave counting two ways.
  log('');
  log('D-17 E6 re-run: 30 un-batched writes in one synchronous tick; waves counted (i) per tick, all waves (ADR 0008:62, F15)');
  log('     and (ii) per outermost entry, feedback waves only (round-6 F-5). "reach" = first write whose waves make the count 25;');
  log('     "reject" = first write whose listener write falls in a wave numbered >= 25 (ADR 0008 rule 4 rejects that wave\'s listener writes).');
  for (const withListener of [false, true]) {
    const root = object('root');
    const a = attach(root, leaf('a'));
    const b = attach(root, leaf('b'));
    prime(root, {});
    if (withListener) subscribe(a, (p) => setValue(b, `derived:${p.current}`));
    let tick = 0;
    let reachTick = -1;
    let rejectTick = -1;
    let maxFeedback = 0;
    let reachEntry = -1;
    const per = [];
    for (let i = 1; i <= 30; i++) {
      write(a, `v${i}`);
      const w = lastEntry.waves;
      const fb = w - 1;
      per.push(w);
      if (withListener && rejectTick < 0 && tick + 1 >= 25 && fb > 0) rejectTick = i;
      tick += w;
      if (reachTick < 0 && tick >= 25) reachTick = i;
      if (fb > maxFeedback) maxFeedback = fb;
      if (reachEntry < 0 && fb >= 25) reachEntry = i;
    }
    log(`  ${withListener ? 'store listener a->b' : 'no listener        '} -> ${J({ wavesPerWrite: [...new Set(per)], tickTotal: tick, perTick: { reachAtWrite: reachTick, firstRejectedListenerWriteAt: rejectTick }, perEntryFeedback: { maxFeedbackWavesInOneEntry: maxFeedback, reachAtWrite: reachEntry } })}`);
  }
  {
    const root = object('root');
    const a = attach(root, leaf('a'));
    prime(root, {});
    let k = 0;
    subscribe(a, () => {
      if (k < 30) write(a, `c${++k}`);
    });
    write(a, 'go');
    log(`  one write whose listener re-writes a 30 times (feedback chain) -> ${J({ wavesInEntry: lastEntry.waves, feedbackWaves: lastEntry.waves - 1, perEntryReachAtFeedbackWave: 25, perTickReachAtWave: 25, wavesExceededFlag: lastSettle.wavesExceeded })}`);
  }
}

writeFileSync(new URL(`./r7port-${MODE}-output.txt`, import.meta.url), `${out.join('\n')}\n`);
